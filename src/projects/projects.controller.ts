import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Prisma } from '@prisma/client';
import { ReqUser } from 'src/user.decorator';
import { CreateProjectDto } from './dto/create.project.dto';
import { GetProjectDto as GetProjectDto } from './dto/get.project.dto';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  create(@ReqUser() user, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create({
      ...createProjectDto,
      owner: { connect: { id: user.id } },
    });
  }

  @Get()
  findAll(@ReqUser() user, @Query() params: GetProjectDto) {
    const sortingCriteria = parseOrderBy(params.orderBy);
    return this.projectsService.findAll({
      where: {
        name: { contains: params.name },
        description: { contains: params.description },
        ownerId: user.id,
      },
      orderBy: {
        name: sortingCriteria.name,
        description: sortingCriteria.description
      },
      skip: params.skip,
      take: params.take,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.projectsService.findOne({ id: Number(id) });
  }

  @Patch(':id')
  update(@ReqUser() user, @Param('id') id: string, @Body() updateProjectDto: Prisma.ProjectUpdateInput) {
    return this.projectsService.update({
      data: updateProjectDto,
      where: { id: Number(id), ownerId: user.id },
    })
  }

  @Delete(':id')
  remove(@ReqUser() user, @Param('id') id: string) {
    return this.projectsService.remove({ id: Number(id), ownerId: user.id });
  }
}
