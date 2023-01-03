import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MetabaseQueryModule } from './database/metabase-query.module';
import { MetabaseRepository } from './repositories/metabase.repository';
import { MetabaseService } from './services/metabase.service';

@Module({
  imports: [MetabaseQueryModule],
  controllers: [AppController],
  providers: [AppService, MetabaseRepository, MetabaseService],
})
export class AppModule {}
