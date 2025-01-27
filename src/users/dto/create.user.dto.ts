import { ApiProperty } from "@nestjs/swagger";
import { User, UserRole } from "@prisma/client";
import { IsBoolean, IsEmail, IsEnum, IsString } from "class-validator";

export class CreateUserDto {
    @ApiProperty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsString()
    email: string;

    @ApiProperty()
    @IsString()
    password: string;

    @ApiProperty()
    @IsString()
    firstName: string;

    @ApiProperty()
    @IsString()
    lastName: string;

    @ApiProperty({ enum: UserRole, default: UserRole.USER })
    @IsEnum(UserRole)
    role: UserRole = UserRole.USER;
}