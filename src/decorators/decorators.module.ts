import { Module } from '@nestjs/common';
import { SortingParams } from './sorting.params.decorator';
import { ReqUser } from './user.decorator';

@Module({
    // exports: [SortingParams, ReqUser]
})
export class DecoratorsModule { }
