import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { SignService } from './sign.service';

// Glossário global — endpoint PÚBLICO (sem autenticação).
// Consumido tanto pela área logada quanto pela landing page.
@ApiTags('Glossary')
@Controller('glossary')
export class GlossaryController {
  constructor(private readonly signService: SignService) {}

  // GET /glossary?search=&categoryId=&handConfigId=&tag=
  @Get()
  async findAll(
    @Query('search') search?: string,
    @Query('categoryId') categoryId?: string,
    @Query('handConfigId') handConfigId?: string,
    @Query('tag') tag?: string,
  ) {
    const signs = await this.signService.findGlobal({ search, categoryId, handConfigId, tag });
    return { success: true, message: 'Glossário obtido com sucesso', object: signs };
  }
}
