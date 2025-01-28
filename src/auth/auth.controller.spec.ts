import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { PrismaModule } from './../prisma/prisma.module';
import { AuthService } from './auth.service';
import { UsersModule } from './../users/users.module';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      imports: [PrismaModule, UsersModule],
      providers: [AuthService, JwtService]
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });


  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
