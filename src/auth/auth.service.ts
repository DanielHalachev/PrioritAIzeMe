import { HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private userService: UsersService,
        private jwtService: JwtService) { }

    async signIn(email: string, password: string): Promise<{ access_token: string }> {
        const user = await this.userService.findOne({ email });
        // TODO Use password hash, not pure password
        // Compare the hashes
        // if (user?.password !== password) {
        //     throw new UnauthorizedException();
        // }
        if (user == null) {
            throw new HttpException("I don't know", 500);
        }
        const payload = { sub: user.id, username: user.email, admin: user.isAdmin };
        return {
            access_token: await this.jwtService.signAsync(payload),
        }
    }
}
