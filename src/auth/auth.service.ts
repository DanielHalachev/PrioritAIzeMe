import { HttpException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './../users/users.service';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService) { }

    async signIn(username: string, password: string): Promise<{ access_token: string }> {
        const user = await this.userService.findOne({ username: username });
        if (user == null) {
            throw new NotFoundException();
        }

        const isMatch = await bcrypt.compare(password, user.hashedPassword);
        if (isMatch == false) {
            throw new UnauthorizedException();
        }

        const payload = { sub: user.id, username: user.username, email: user.email, role: user.role };
        return {
            access_token: await this.jwtService.signAsync(payload),
        }
    }
}
