import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstanceEntity } from './instance.entity';
import { InstanceService } from './instance.service';
import { InstanceController } from './instance.controller';
import { MetabaseAuthService } from '../services/metabase-auth.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([InstanceEntity]), HttpModule, UserModule],
  providers: [InstanceService, MetabaseAuthService, ConfigService],
  controllers: [InstanceController],
  exports: [TypeOrmModule, InstanceService],
})
export class InstanceModule {}
