import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, User } from '@prisma/client';
import { ReqUser } from 'src/user.decorator';
import { GetUserQueryDto as GetUserDto } from './dto/get.user.dto';
import { CreateUserDto } from './dto/create.user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  async create(@Body() data: CreateUserDto) {
    return this.usersService.create(data);
  }

  @Get()
  async findAll(@ReqUser() user, @Query() params: GetUserDto): Promise<User[]> {
    if (user.isAdmin == false) {
      throw new ForbiddenException();
    }
    const sortingCriteria = parseOrderBy(params.orderBy);
    return this.usersService.findAll({
      where: {
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        isAdmin: params.isAdmin,
      },
      orderBy: {
        email: sortingCriteria.email,
        firstName: sortingCriteria.firstName,
        lastName: sortingCriteria.lastName,
      },
      take: params.take,
      skip: params.skip,
    });
  }

  @Patch(':id')
  async update(@ReqUser() user, @Param('id') id: number, @Body() userData: Prisma.UserUpdateInput): Promise<User> {
    if (user.id != id) {
      throw new ForbiddenException();
    }
    return this.usersService.update({
      where: { id: id },
      data: userData,
    });
  }

  @Delete(':id')
  async remove(@ReqUser() user, @Param('id') id: number): Promise<User> {
    if (user.id != id) {
      throw new ForbiddenException();
    }
    return this.usersService.remove({ id: id });
  }
}
