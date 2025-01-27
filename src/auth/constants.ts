import { SetMetadata } from '@nestjs/common';

export const jwtConstants = {
    // TODO fetch from system, do not put key in source code
    secret: 'Bla Bla',
}

// these two allow us to define 
// a SkipPublic() decorator, which skips
// the authorization requirement for an endpoint
export const IS_PUBLIC_KEY = 'isPublic';
export const SkipPublic = () => SetMetadata(IS_PUBLIC_KEY, true);