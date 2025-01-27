import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';
import { Prisma, User } from '@prisma/client';
@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async create(data: Prisma.UserCreateInput) {
    return this.prisma.user.create({ data, });
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: Prisma.UserWhereUniqueInput;
    where?: Prisma.UserWhereInput;
    orderBy?: Prisma.UserOrderByWithRelationInput;
  }): Promise<User[]> {
    const { skip, take, cursor, where, orderBy } = params;
    return this.prisma.user.findMany({
      skip,
      take,
      cursor,
      where,
      orderBy,
    });
  }

  async findOne(userWhereUniqueInput: Prisma.UserWhereUniqueInput): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: userWhereUniqueInput
    });
  }

  async update(params: {
    where: Prisma.UserWhereUniqueInput;
    data: Prisma.UserUpdateInput;
  }): Promise<User> {
    const { where, data } = params;
    return this.prisma.user.update({
      data,
      where,
    });
  }

  async remove(where: Prisma.UserWhereUniqueInput): Promise<User> {
    // should be handled by the database itself
    // const deleteTasks = this.prisma.task.deleteMany({
    //   where: {
    //     creatorId: where.id,
    //   }
    // })

    // const deleteProjects = this.prisma.project.deleteMany({
    //   where: {
    //     ownerId: where.id,
    //   }
    // })

    // const deleteUser = this.prisma.user.delete({
    //   where,
    // });

    // await this.prisma.$transaction([deleteTasks, deleteProjects, deleteUser])

    const deleteUser = await this.prisma.user.delete({
      where,
    });

    return deleteUser;
  }
}
