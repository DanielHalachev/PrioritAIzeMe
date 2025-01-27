import { IsOptional, IsString, IsIn, IsInt, Min, IsPositive, IsBoolean, IsEnum, IsDate, IsObject, Matches, IsNumber, IsNumberString, IsDecimal } from 'class-validator';
import { Priority } from '@prisma/client';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetTaskDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    title?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ format: 'int32', minimum: 1 })
    @IsOptional()
    @IsInt()
    @IsPositive()
    creatorId?: number;

    @ApiPropertyOptional({ format: 'int32', minimum: 1 })
    @IsOptional()
    @IsInt()
    @IsPositive()
    projectId?: number;

    @ApiPropertyOptional()
    @IsOptional()
    @IsBoolean()
    completed?: boolean;

    @ApiPropertyOptional({ enum: Priority })
    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;

    @ApiPropertyOptional({ format: 'date-time' })
    @IsOptional()
    @IsDate()
    created?: Date;

    @ApiPropertyOptional({ format: 'date-time' })
    @IsOptional()
    @IsDate()
    dueDate?: Date;

    @ApiPropertyOptional({ format: 'float' })
    @IsOptional()
    @IsDecimal()
    sentiment?: number;

    @ApiPropertyOptional({ format: 'float' })
    @IsOptional()
    @IsDecimal()
    normalizedSentiment?: number;

    @ApiPropertyOptional({ description: 'Order by fields in the format <[+-]><field>,...', example: '+id,-description' })
    @IsOptional()
    @IsString()
    // @Matches(/^([+-]\w+)(,[+-]\w+)*$/, { message: 'Invalid orderBy format' })
    orderBy?: string;

    @ApiPropertyOptional({ format: 'int32', minimum: 0 })
    @IsOptional()
    @IsInt()
    @Min(0)
    skip?: number = 0;

    @ApiPropertyOptional({ format: 'int32', minimum: 1 })
    @IsOptional()
    @IsInt()
    @Min(1)
    take?: number = 20;
}
