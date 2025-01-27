import { ApiPropertyOptional } from "@nestjs/swagger";
import { Prisma } from "@prisma/client";
import { IsBoolean, IsInt, IsOptional, IsString, Matches, Min } from "class-validator";

export class GetUserQueryDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    email?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    firstName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    lastName?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    isAdmin?: boolean;

    @ApiPropertyOptional({ description: 'Order by fields in the format <[+-]><field>,...', example: '+id,-description' })
    @IsOptional()
    @Matches(/^([+-]\w+)?(,[+-]\w+)*$/, { message: 'Invalid orderBy format' })
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
