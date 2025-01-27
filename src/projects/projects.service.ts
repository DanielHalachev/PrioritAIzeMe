import { Injectable } from '@nestjs/common';
import { Prisma, Project } from '@prisma/client';
import { PrismaService } from './../prisma/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  create(data: Prisma.ProjectCreateInput) {
    return this.prisma.project.create({
      data,
    });
  }

  findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.ProjectWhereUniqueInput;
    where?: Prisma.ProjectWhereInput;
    orderBy?: Prisma.ProjectOrderByWithRelationInput;
  }): Promise<Project[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.project.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(projectWhereUniqueInput: Prisma.ProjectWhereUniqueInput) {
    return this.prisma.project.findUnique({
      where: projectWhereUniqueInput,
      include: {
        ProjectParticipants: {
          select: {
            userId: true, // Only select the userId field
          },
        },
      }
    });
  }

  async update(params: {
    where: Prisma.ProjectWhereUniqueInput;
    data: Prisma.ProjectUpdateInput;
  }): Promise<Project> {
    const { where, data } = params;
    return this.prisma.project.update({
      data,
      where,
    });
  }

  async remove(where: Prisma.ProjectWhereUniqueInput): Promise<Project> {
    // should be handled by the database itself
    // const deleteProjectTasks = this.prisma.task.deleteMany({
    //   where: {
    //     projectId: where.id
    //   }
    // })

    // const deleteProject = this.prisma.project.delete({
    //   where,
    // });

    // await this.prisma.$transaction([deleteProjectTasks, deleteProject])

    const deleteProject = await this.prisma.project.delete({
      where,
    });
    return deleteProject;
  }
}
