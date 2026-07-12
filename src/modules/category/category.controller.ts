import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

import { JwtAuthGuard } from '@modules/auth/jwt-auth.guard';
import { RolesGuard } from '@common/guards/roles.guard';
import { Roles } from '@common/decorators/roles.decorator';
import { Role } from '@common/enums/enum';

import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { CreateCategoryDocs, DeleteCategoryDocs, FindAllCategoriesDocs } from '@common/swagger/category';

@ApiTags('Category')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  // POST /category
  @CreateCategoryDocs()
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Post()
  async create(@Body() dto: CreateCategoryDto) {
    const category = await this.categoryService.create(dto);
    return { success: true, message: 'Categoria criada com sucesso', object: category };
  }

  // GET /category?search=
  @FindAllCategoriesDocs()
  @Roles(Role.STUDENT, Role.EDUCATOR, Role.GUARDIAN, Role.MANAGER)
  @Get()
  async findAll(@Query('search') search?: string) {
    const categories = await this.categoryService.findAll(search);
    return { success: true, message: 'Categorias obtidas com sucesso', object: categories };
  }

  // DELETE /category/:id
  @DeleteCategoryDocs()
  @Roles(Role.EDUCATOR, Role.MANAGER)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.categoryService.delete(id);
    return { success: true, message: 'Categoria excluída com sucesso' };
  }
}
