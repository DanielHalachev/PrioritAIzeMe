import { Controller, Get, Post, Body, Patch, Param, Delete, Req, Query, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma, User, UserRole } from '@prisma/client';
import { ReqUser } from './../decorators/user.decorator';
import { GetUserQueryDto as GetUserDto } from './dto/get.user.dto';
import { CreateUserDto } from './dto/create.user.dto';
import { saltOrRounds, SkipAuth } from './../auth/constants';
import * as bcrypt from 'bcrypt';
import { SortingParams } from './../decorators/sorting.params.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Post()
  @SkipAuth()
  async create(@Body() data: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(data.password, saltOrRounds);
    return this.usersService.create({
      username: data.username,
      email: data.email,
      hashedPassword: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    });
  }

  @Get()
  async findAll(
    @ReqUser() user,
    @Query() params: GetUserDto,
    @SortingParams([
      'username',
      'email',
      'firstName',
      'lastName'
    ]) orderBy): Promise<User[]> {
    if (user.role != UserRole.ADMIN) {
      throw new ForbiddenException();
    }
    const orderByArray = orderBy.map(order => ({ [order.property]: order.direction }));
    return this.usersService.findAll({
      where: {
        username: params.username,
        email: params.email,
        firstName: params.firstName,
        lastName: params.lastName,
        role: params.role,
      },
      orderBy: orderByArray.length ? orderByArray : { priority: 'desc' },
      take: params.take,
      skip: params.skip,
    });
  }

  @Get(':id')
  async findOne(@ReqUser() user, @Param('id') id: number): Promise<User> {
    if (user.role != UserRole.ADMIN && user.sub != id) {
      throw new ForbiddenException();
    }
    const userToGet = await this.usersService.findOne({ id: id });
    if (userToGet == null) {
      throw new NotFoundException();
    }
    return userToGet;
  }

  @Patch(':id')
  async update(@ReqUser() user, @Param('id') id: number, @Body() userData: Prisma.UserUpdateInput): Promise<User> {
    if (user.role != UserRole.ADMIN && user.sub != id) {
      throw new ForbiddenException();
    }
    const userToUpdate = await this.usersService.findOne({ id: id });
    if (userToUpdate == null) {
      throw new NotFoundException();
    }
    return this.usersService.update({
      where: { id: id },
      data: userData,
    });
  }

  @Delete(':id')
  async remove(@ReqUser() user, @Param('id') id: number): Promise<User> {
    if (user.role != UserRole.ADMIN && user.sub != id) {
      throw new ForbiddenException();
    }
    const userToDelete = await this.usersService.findOne({ id: id });
    if (userToDelete == null) {
      throw new NotFoundException();
    }
    return this.usersService.remove({ id: id });
  }
}
