import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Priority } from "@prisma/client";
import { IsBoolean, IsDate, IsEnum, IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateTaskDto {
    @ApiProperty()
    @IsString()
    title: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ format: 'date-time' })
    @IsOptional()
    @IsDate()
    dueDate?: Date;

    @ApiPropertyOptional({ default: false })
    @IsOptional()
    @IsBoolean()
    completed?: boolean = false;

    @ApiPropertyOptional({ enum: Priority, default: Priority.NONE })
    @IsOptional()
    @IsEnum(Priority)
    priority?: Priority;
}