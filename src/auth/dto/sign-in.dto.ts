import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString } from "class-validator";

export class SignInDto {
    @IsEmail()
    public readonly email: string;
    @IsString()
    public readonly password: string;
}