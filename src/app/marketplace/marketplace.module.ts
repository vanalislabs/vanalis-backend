import { Module } from '@nestjs/common';
import { MarketplaceController } from './controller/marketplace.controller';
import { SharedModule } from 'src/shared/shared.module';
import { ProjectModule } from 'src/app/project/project.module';
import { MarketplaceService } from './service/marketplace.service';

@Module({
  imports: [SharedModule, ProjectModule],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
})
export class MarketplaceModule { }