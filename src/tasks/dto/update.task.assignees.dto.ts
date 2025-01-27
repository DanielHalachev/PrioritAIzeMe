import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber } from "class-validator";

export class UpdateTaskAssigneesDto {
    @ApiProperty({ type: Int32Array })
    @IsNumber({}, { each: true })
    assignees: number[];
}