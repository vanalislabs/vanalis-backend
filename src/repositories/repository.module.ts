import { Global, Module } from '@nestjs/common';
const providers = [];

@Global()
@Module({
  providers,
  exports: [...providers],
})
export class RepositoryModule { }
