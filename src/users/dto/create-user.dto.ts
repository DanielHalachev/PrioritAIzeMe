import { IsEmail, IsString } from "class-validator";

export class CreateUserDto {
    @IsEmail()
    public readonly email: string;
    @IsString()
    public readonly password: string;
    @IsString()
    public readonly firstName: string;
    @IsString()
    public readonly lastName: string;
}
