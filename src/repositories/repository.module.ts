import { Global, Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { IndexerRepository } from './indexer.repository';
import { MarketplaceRepository } from './marketplace.repository';

const providers = [UserRepository, MarketplaceRepository, IndexerRepository];

@Global()
@Module({
  providers,
  exports: [...providers],
})
export class RepositoryModule { }
