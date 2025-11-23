import { Module } from '@nestjs/common';
import { MarketplaceController } from './controller/marketplace.controller';
import { MarketplaceRepository } from 'src/repositories/marketplace.repository';
import { SharedModule } from 'src/shared/shared.module';
import { ProjectModule } from 'src/app/project/project.module';

@Module({
  imports: [SharedModule, ProjectModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceRepository],
  exports: [MarketplaceRepository],
})
export class MarketplaceModule {}