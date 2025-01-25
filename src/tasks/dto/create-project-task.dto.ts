import { Priority } from "../entities/priority.enum";
import { IsBoolean, IsDate, IsEnum, IsNumber, IsOptional, IsPositive, IsString } from "class-validator";

export class CreateProjectTaskDto {
    @IsString()
    public readonly title: string;
    @IsString()
    @IsOptional()
    public readonly description?: string;
    @IsDate()
    @IsOptional()
    public readonly dueDate?: Date;
    @IsBoolean()
    @IsOptional()
    public readonly completed?: boolean;
    @IsEnum(Priority)
    @IsOptional()
    public readonly priority?: Priority;
    @IsNumber()
    @IsPositive()
    @IsOptional()
    public readonly project?: number;
}
