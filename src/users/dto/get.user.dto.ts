import { ApiPropertyOptional } from "@nestjs/swagger";
import { Prisma, UserRole } from "@prisma/client";
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Matches, Min } from "class-validator";

export class GetUserQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    username?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional({ enum: UserRole })
    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @ApiPropertyOptional({ description: 'Order by fields in the format <[+-]><field>,...', example: '+id,-description' })
    @IsOptional()
    // @Matches(/^([+-]\w+)?(,[+-]\w+)*$/, { message: 'Invalid orderBy format' })
    orderBy?: string;

    @ApiPropertyOptional({ format: 'int32', minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    skip: number = 0;

    @ApiPropertyOptional({ format: 'int32', minimum: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    take: number = 20;
}
