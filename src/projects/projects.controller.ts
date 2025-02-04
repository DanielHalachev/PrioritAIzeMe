import { CacheInterceptor } from '@nestjs/cache-manager';
import { Body, Controller, Delete, ForbiddenException, Get, NotFoundException, Param, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { SortingParams } from './../decorators/sorting.params.decorator';
import { ReqUser } from './../decorators/user.decorator';
import { CreateProjectDto } from './dto/create.project.dto';
import { GetProjectDto } from './dto/get.project.dto';
import { ProjectsService } from './projects.service';

@Controller('projects')
@UseInterceptors(CacheInterceptor)
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
  async findAll(
    @ReqUser() user,
    @Query() params: GetProjectDto,
    @SortingParams([
      'name',
      'description'
    ]) orderBy) {
    const orderByArray = orderBy.map(order => ({ [order.property]: order.direction }));
    const whereClause: Prisma.ProjectWhereInput = {
      name: { contains: params.name },
      description: { contains: params.description }
    };
    if (user.role !== UserRole.ADMIN) {
      whereClause.OR = [
        { ownerId: user.sub },
        { ProjectParticipants: { some: { userId: user.sub } } }
      ];
    }
    return this.projectsService.findAll({
      where: whereClause,
      orderBy: orderByArray.length ? orderByArray : { name: 'asc' },
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
    if (project.ownerId != user.sub && project.ProjectParticipants.find(participant => participant.userId == user.sub) == null) {
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
