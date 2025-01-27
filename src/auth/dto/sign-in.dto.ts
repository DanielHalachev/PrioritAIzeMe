import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class SignInDto {
    @ApiProperty()
    @IsString()
    public readonly username: string;
    @ApiProperty()
    @IsString()
    public readonly password: string;
}