import { Global, Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { IndexerRepository } from './indexer.repository';

const providers = [UserRepository, IndexerRepository];

@Global()
@Module({
  providers,
  exports: [...providers],
})
export class RepositoryModule { }
