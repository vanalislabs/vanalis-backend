import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { RepositoryModule } from './repositories/repository.module';
import { AuthModule } from './app/auth/auth.module';
import { SearchModule } from './app/search/search.module';
import { IndexerModule } from './app/indexer/indexer.module';
import { KeypairModule } from './app/keypair/keypair.module';
import { ProjectModule } from './app/project/project.module';
import { UploadModule } from './app/upload/upload.module';
import { StorageModule } from './app/storage/storage.module';
import { MarketplaceModule } from './app/marketplace/marketplace.module';
import { ActivityModule } from './app/activity/activity.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SharedModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<any>('JWT_SECRET') as any,
        signOptions: {
          expiresIn: (configService.get<any>('JWT_ACCESS_TOKEN_EXPIRATION') || '1h') as any,
        },
      }),
      inject: [ConfigService],
      global: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    }),
    RepositoryModule,
    AuthModule,
    SearchModule,
    KeypairModule,
    ProjectModule,
    UploadModule,
    StorageModule,
    MarketplaceModule,
    ActivityModule,
    IndexerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
