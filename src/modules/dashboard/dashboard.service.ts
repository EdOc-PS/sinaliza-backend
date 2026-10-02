import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { GlobalStatus, Role } from '@common/enums/enum';

const DAY_MS = 24 * 60 * 60 * 1000;
const ACCESS_WINDOW_DAYS = 30;
const ACTIVE_WINDOW_DAYS = 7;

const startOfDayUtc = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

const signCardSelect = {
  id: true,
  name: true,
  slug: true,
  videoUrl: true,
  anotherUrl: true,
  imgUrl: true,
  globalStatus: true,
  creatorId: true,
  category: { select: { id: true, name: true, value: true } },
  classrooms: { select: { id: true, name: true } },
  _count: { select: { favorites: true } },
};

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview() {
    const now = new Date();
    const accessSince = startOfDayUtc(new Date(now.getTime() - (ACCESS_WINDOW_DAYS - 1) * DAY_MS));
    const activeSince = new Date(now.getTime() - ACTIVE_WINDOW_DAYS * DAY_MS);

    const [
      totalSigns,
      statusGroups,
      categoryGroups,
      categories,
      students,
      educators,
      accessesLast30d,
      activeUsers,
      dailyRows,
      usageRows,
      signs,
    ] = await Promise.all([
      this.prisma.sign.count(),
      this.prisma.sign.groupBy({ by: ['globalStatus'], _count: { _all: true } }),
      this.prisma.sign.groupBy({ by: ['categoryId'], _count: { _all: true } }),
      this.prisma.category.findMany({ select: { id: true, name: true } }),
      this.prisma.user.count({ where: { roles: { has: Role.STUDENT }, status: true } }),
      this.prisma.user.count({ where: { roles: { has: Role.EDUCATOR }, status: true } }),
      this.prisma.signAccess.count({ where: { createdAt: { gte: accessSince } } }),
      this.prisma.history.findMany({
        where: { accessedAt: { gte: activeSince } },
        distinct: ['userId'],
        select: { userId: true },
      }),
      this.prisma.$queryRaw<{ day: Date; total: bigint }[]>`
        SELECT date_trunc('day', "createdAt") AS day, COUNT(*) AS total
        FROM "SignAccess"
        WHERE "createdAt" >= ${accessSince}
        GROUP BY 1
        ORDER BY 1`,
      this.prisma.history.groupBy({ by: ['signId'], _sum: { accessCount: true } }),
      this.prisma.sign.findMany({ select: signCardSelect }),
    ]);

    // Série completa dos últimos 30 dias — dias sem acesso entram como 0
    const totalsByDay = new Map(
      dailyRows.map((r) => [startOfDayUtc(new Date(r.day)).toISOString().slice(0, 10), Number(r.total)]),
    );
    const accessesByDay = Array.from({ length: ACCESS_WINDOW_DAYS }, (_, i) => {
      const day = new Date(accessSince.getTime() + i * DAY_MS).toISOString().slice(0, 10);
      return { date: day, total: totalsByDay.get(day) ?? 0 };
    });

    const statusCount = (status: GlobalStatus) =>
      statusGroups.find((g) => g.globalStatus === status)?._count._all ?? 0;

    const categoryName = new Map(categories.map((c) => [c.id, c.name]));
    const signsByCategory = categoryGroups
      .map((g) => ({ category: categoryName.get(g.categoryId) ?? 'Sem categoria', total: g._count._all }))
      .sort((a, b) => b.total - a.total);

    const usageBySign = new Map(usageRows.map((r) => [r.signId, r._sum.accessCount ?? 0]));
    const withUsage = signs.map(({ _count, creatorId, ...sign }) => ({
      ...sign,
      creatorId,
      usageCount: usageBySign.get(sign.id) ?? 0,
      favoriteCount: _count.favorites,
    }));

    const topSigns = [...withUsage]
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 8)
      .map(({ creatorId: _creatorId, ...s }) => s);

    // Candidatos: ainda não públicos nem em análise, ranqueados por uso +
    // favoritos (favoritar pesa mais — é um sinal explícito de utilidade)
    const candidateSigns = withUsage
      .filter((s) => s.globalStatus === GlobalStatus.PRIVATE || s.globalStatus === GlobalStatus.REJECTED)
      .filter((s) => s.usageCount + s.favoriteCount > 0)
      .map((s) => ({ ...s, score: s.usageCount + 2 * s.favoriteCount }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    const creators = await this.prisma.user.findMany({
      where: { id: { in: [...new Set(candidateSigns.map((s) => s.creatorId))] } },
      select: { id: true, name: true },
    });
    const creatorName = new Map(creators.map((c) => [c.id, c.name]));
    const promotionCandidates = candidateSigns.map(({ creatorId, ...s }) => ({
      ...s,
      creatorName: creatorName.get(creatorId) ?? null,
    }));

    return {
      kpis: {
        totalSigns,
        publicSigns: statusCount(GlobalStatus.PUBLIC),
        pendingSigns: statusCount(GlobalStatus.PENDING),
        students,
        educators,
        accessesLast30d,
        activeUsers7d: activeUsers.length,
      },
      accessesByDay,
      signsByStatus: [
        { status: GlobalStatus.PUBLIC, total: statusCount(GlobalStatus.PUBLIC) },
        { status: GlobalStatus.PENDING, total: statusCount(GlobalStatus.PENDING) },
        { status: GlobalStatus.PRIVATE, total: statusCount(GlobalStatus.PRIVATE) },
        { status: GlobalStatus.REJECTED, total: statusCount(GlobalStatus.REJECTED) },
      ],
      signsByCategory,
      topSigns,
      promotionCandidates,
    };
  }
}
