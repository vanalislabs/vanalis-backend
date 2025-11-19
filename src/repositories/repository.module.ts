import { Global, Module } from '@nestjs/common';
import { UserRepository } from './user.repository';

const providers = [UserRepository];

@Global()
@Module({
  providers,
  exports: [...providers],
})
export class RepositoryModule { }
