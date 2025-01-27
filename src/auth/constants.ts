import { SetMetadata } from '@nestjs/common';
import e from 'express';

export const jwtConstants = {
    secret: process.env.JWT_SECRET,
}

export const saltOrRounds = 10;

// these two allow us to define 
// a SkipPublic() decorator, which skips
// the authorization requirement for an endpoint
export const IS_PUBLIC_KEY = 'isPublic';
export const SkipAuth = () => SetMetadata(IS_PUBLIC_KEY, true);