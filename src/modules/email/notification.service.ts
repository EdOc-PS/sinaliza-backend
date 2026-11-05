import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/database/prisma.service';
import { Role } from '@common/enums/enum';
import { EmailService } from './email.service';
import { noticeTemplate, type NoticeTemplateData } from './templates/notice.template';

interface Recipient {
  id: string;
  name: string;
  email: string | null;
}

// Avisos disparados pelas ações da plataforma: sempre viram notificação no sino e
// só saem por email com EMAIL_NOTIFICATIONS_ENABLED=true (exige domínio verificado).
// Nenhum aviso bloqueia nem desfaz a ação que o originou: falhas ficam só no log.
@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private readonly emailService: EmailService,
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  private get frontendUrl() {
    return (this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:5173').replace(/\/+$/, '');
  }

  private async send(to: Recipient, data: Omit<NoticeTemplateData, 'name' | 'logoUrl'>) {
    try {
      await this.prisma.notification.create({
        data: {
          userId: to.id,
          tone: data.tone,
          title: data.title,
          message: data.paragraphs.join(' '),
          reason: data.highlight?.text,
          link: data.button?.url.replace(this.frontendUrl, ''),
        },
      });
    } catch (err) {
      this.logger.error(`Não foi possível criar a notificação "${data.title}"`, err as Error);
    }

    if (!to.email || this.config.get<string>('EMAIL_NOTIFICATIONS_ENABLED') !== 'true') return;

    const { html, text, subject } = noticeTemplate({
      ...data,
      name: to.name,
      logoUrl: `${this.frontendUrl}/logo/logo-simples.png`,
    });
    try {
      await this.emailService.send({ to: to.email, subject, html, text });
    } catch (err) {
      this.logger.error(`Não foi possível enviar "${subject}" para ${to.email}`, err as Error);
    }
  }

  private findUser(id: string) {
    return this.prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true } });
  }

  // Gestores ativos (da mesma instituição, quando informada)
  private findManagers(institutionId?: string | null) {
    return this.prisma.user.findMany({
      where: {
        roles: { has: Role.MANAGER },
        status: true,
        ...(institutionId ? { institutionId } : {}),
      },
      select: { id: true, name: true, email: true },
    });
  }

  private signUrl(slug: string) {
    return `${this.frontendUrl}/signs/${slug}`;
  }

  // Promoção aprovada → criador do sinal
  async promotionApproved(creatorId: string, signName: string, slug: string) {
    const creator = await this.findUser(creatorId);
    if (!creator) return;
    await this.send(creator, {
      tone: 'success',
      badge: 'Promoção aprovada',
      title: 'Seu sinal entrou no glossário global!',
      preheader: `"${signName}" agora está no glossário global.`,
      paragraphs: [
        `Um gestor aprovou a promoção do sinal "${signName}". Ele agora está no glossário global e fica visível para toda a instituição.`,
      ],
      button: { label: 'Ver o sinal', url: this.signUrl(slug) },
    });
  }

  // Promoção recusada → criador do sinal, com o motivo
  async promotionRejected(creatorId: string, signName: string, slug: string, reason: string) {
    const creator = await this.findUser(creatorId);
    if (!creator) return;
    await this.send(creator, {
      tone: 'danger',
      badge: 'Promoção recusada',
      title: 'Promoção do sinal recusada',
      preheader: `A promoção de "${signName}" ao glossário global não foi aprovada.`,
      paragraphs: [
        `Um gestor analisou o sinal "${signName}" e a promoção para o glossário global não foi aprovada por enquanto.`,
        'Ajuste o que foi apontado abaixo e envie de novo para aprovação.',
      ],
      highlight: { label: 'Motivo informado pelo gestor', text: reason },
      button: { label: 'Ver o sinal', url: this.signUrl(slug) },
    });
  }

  // Nova promoção pendente → gestores
  async promotionRequested(creatorId: string, signName: string, institutionId?: string | null) {
    const [creator, managers] = await Promise.all([this.findUser(creatorId), this.findManagers(institutionId)]);
    const author = creator?.name ?? 'Um educador';
    await Promise.all(
      managers.map((manager) =>
        this.send(manager, {
          tone: 'info',
          badge: 'Aguardando aprovação',
          title: 'Novo sinal aguardando aprovação',
          preheader: `${author} enviou "${signName}" para o glossário global.`,
          paragraphs: [
            `${author} enviou o sinal "${signName}" para o glossário global.`,
            'Revise o sinal e aprove ou recuse a promoção no dashboard.',
          ],
          button: { label: 'Revisar promoções', url: `${this.frontendUrl}/dashboard` },
        }),
      ),
    );
  }

  // Sinal removido do glossário global → criador do sinal, com o motivo
  async signUnpromoted(creatorId: string, signName: string, slug: string, reason: string) {
    const creator = await this.findUser(creatorId);
    if (!creator) return;
    await this.send(creator, {
      tone: 'danger',
      badge: 'Removido do glossário',
      title: 'Seu sinal saiu do glossário global',
      preheader: `"${signName}" foi removido do glossário global.`,
      paragraphs: [
        `Um gestor removeu o sinal "${signName}" do glossário global. Ele continua disponível nas suas turmas.`,
        'Depois de ajustar o que foi apontado, você pode enviá-lo de novo para aprovação.',
      ],
      highlight: { label: 'Motivo informado pelo gestor', text: reason },
      button: { label: 'Ver o sinal', url: this.signUrl(slug) },
    });
  }

  // Novo cadastro de aluno pendente → gestores
  async studentPendingApproval(studentName: string, institutionId?: string | null) {
    const managers = await this.findManagers(institutionId);
    await Promise.all(
      managers.map((manager) =>
        this.send(manager, {
          tone: 'info',
          badge: 'Cadastro pendente',
          title: 'Nova conta aguardando análise',
          preheader: `${studentName} se cadastrou e aguarda aprovação.`,
          paragraphs: [
            `${studentName} criou uma conta de aluno no Sinaliza e está aguardando a sua análise.`,
            'Enquanto a conta não for aprovada, o aluno não consegue acessar as turmas.',
          ],
          button: { label: 'Analisar cadastros', url: `${this.frontendUrl}/members` },
        }),
      ),
    );
  }

  // Educador cadastrado pelo gestor → boas-vindas
  async educatorWelcome(id: string, name: string, email: string) {
    await this.send({ id, name, email }, {
      tone: 'success',
      badge: 'Conta criada',
      title: 'Bem-vindo(a) ao Sinaliza!',
      preheader: 'Um gestor criou sua conta de educador no Sinaliza.',
      paragraphs: [
        `Um gestor da instituição criou sua conta de educador no Sinaliza com o email ${email}.`,
        'Use a senha informada pelo gestor para entrar na plataforma.',
      ],
      button: { label: 'Abrir minhas turmas', url: `${this.frontendUrl}/classrooms` },
    });
  }

  // Decisão sobre o cadastro → aluno
  async approvalDecided(userId: string, approved: boolean) {
    const user = await this.findUser(userId);
    if (!user) return;
    await this.send(user, approved
      ? {
          tone: 'success',
          badge: 'Conta aprovada',
          title: 'Sua conta foi aprovada!',
          preheader: 'Você já pode acessar o Sinaliza.',
          paragraphs: ['Um gestor aprovou o seu cadastro. Suas turmas já estão disponíveis.'],
          button: { label: 'Abrir minhas turmas', url: `${this.frontendUrl}/classrooms` },
        }
      : {
          tone: 'danger',
          badge: 'Conta recusada',
          title: 'Seu cadastro não foi aprovado',
          preheader: 'Um gestor analisou o seu cadastro.',
          paragraphs: ['Um gestor analisou o seu cadastro e ele não foi aprovado. Fale com a instituição para saber mais.'],
        });
  }

  // Educador promovido a administrador da turma
  async promotedToClassroomAdmin(userId: string, classroomId: string, classroomName: string) {
    const user = await this.findUser(userId);
    if (!user) return;
    await this.send(user, {
      tone: 'success',
      badge: 'Administrador',
      title: `Você agora é administrador da turma ${classroomName}`,
      preheader: `Você pode gerenciar a turma ${classroomName}.`,
      paragraphs: [`Você recebeu as mesmas permissões de quem criou a turma "${classroomName}".`],
      button: { label: 'Abrir a turma', url: `${this.frontendUrl}/classrooms/${classroomId}` },
    });
  }

  // Participante adicionado a uma turma pelo professor
  async addedToClassroom(userId: string, classroomId: string, classroomName: string, teacherName: string) {
    const user = await this.findUser(userId);
    if (!user) return;
    await this.send(user, {
      tone: 'info',
      badge: 'Nova turma',
      title: `Você entrou na turma ${classroomName}`,
      preheader: `${teacherName} adicionou você à turma ${classroomName}.`,
      paragraphs: [
        `${teacherName} adicionou você à turma "${classroomName}". Os sinais da turma já estão disponíveis para você.`,
      ],
      button: { label: 'Abrir a turma', url: `${this.frontendUrl}/classrooms/${classroomId}` },
    });
  }
}
