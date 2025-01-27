import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsInt, IsOptional, IsPositive, IsString, isString, Matches, Min } from "class-validator";

export class GetProjectDto {
    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    name?: string;

    @ApiPropertyOptional()
    @IsOptional()
    @IsString()
    description?: string;

    @ApiPropertyOptional({ format: 'int32', minimum: 1 })
    @IsOptional()
    @IsInt()
    @IsPositive()
    ownerId?: number;

    @ApiPropertyOptional({ description: 'Order by fields in the format <[+-]><field>,...', example: '+id,-description' })
    @IsOptional()
    // @Matches(/^([+-]\w+)?(,[+-]\w+)*$/, { message: 'Invalid orderBy format' })
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