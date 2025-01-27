import { Controller, Get, Post, Body, Patch, Param, Delete, Query, NotFoundException, ForbiddenException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { Prisma, UserRole } from '@prisma/client';
import { ReqUser } from 'src/decorators/user.decorator';
import { CreateProjectDto } from './dto/create.project.dto';
import { GetProjectDto as GetProjectDto } from './dto/get.project.dto';
import { parseOrderBy } from 'src/order.parser';
import { userInfo } from 'os';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  async create(@ReqUser() user, @Body() createProjectDto: CreateProjectDto) {
    return this.projectsService.create({
      ...createProjectDto,
      owner: { connect: { id: user.sub } },
    });
  }

  @Get()
  async findAll(@ReqUser() user, @Query() params: GetProjectDto) {
    const sortingCriteria = parseOrderBy(params.orderBy);
    return this.projectsService.findAll({
      where: {
        name: { contains: params.name },
        description: { contains: params.description },
        OR: [{
          ownerId: user.role == UserRole.ADMIN ? undefined : user.sub,
          ProjectParticipants: { some: user.sub }
        }]
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
  async findOne(@ReqUser() user, @Param('id') id: number) {
    const project = await this.projectsService.findOne({ id: id });
    if (project == null) {
      throw new NotFoundException();
    }
    if (project.ownerId != user.sub || project.ProjectParticipants.find(participant => participant.userId == user.sub) == null) {
      throw new ForbiddenException();
    }
    return this.projectsService.findOne({ id: id });
  }

  @Patch(':id')
  async update(@ReqUser() user, @Param('id') id: number, @Body() updateProjectDto: Prisma.ProjectUpdateInput) {
    const project = await this.projectsService.findOne({ id: id });
    if (project == null) {
      throw new NotFoundException();
    }
    if (project.ownerId != user.sub) {
      throw new ForbiddenException();
    }
    return this.projectsService.update({
      data: updateProjectDto,
      where: { id: id, ownerId: user.sub },
    })
  }

  @Delete(':id')
  async remove(@ReqUser() user, @Param('id') id: number) {
    const project = await this.projectsService.findOne({ id: id });
    if (project == null) {
      throw new NotFoundException();
    }
    if (project.ownerId != user.sub) {
      throw new ForbiddenException();
    }
    return this.projectsService.remove({ id: id, ownerId: user.sub });
  }
}
