import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HttpModule } from '@nestjs/axios';
import { MetabaseAuthService } from './services/metabase-auth.service';
import { ConfigModule } from '@nestjs/config';
import configuration from '../config/configuration';
import { MetabaseApiService } from './services/metabase-api.service';
import { ApiQueryService } from './services/api-query.service';
import { DatabaseRepository } from './repositories/metabase/database.repository';
import { CollectionRepository } from './repositories/metabase/collection.repository';
import { DashboardRepository } from './repositories/metabase/dashboard.repository';
import { CardRepository } from './repositories/metabase/card.repository';
import { FieldRepository } from './repositories/metabase/field.repository';
import { TableRepository } from './repositories/metabase/table.repository';
import { MetabaseUserRepository } from './repositories/metabase/metabase-user.repository';
import { DashcardRepository } from './repositories/metabase/dashcard.repository';
import { MetabaseController } from './controllers/metabase.controller';
import { InstanceModule } from './instance/instance.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstanceEntity } from './instance/instance.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { UserEntity } from './user/user.entity';
import { ModelService } from './services/model.service';
import { UtilsService } from './services/utils.service';
import { CollectionService } from './services/collection.service';
import { DatabaseService } from './services/database.service';
import { UserService } from './services/user.service';
import { DashboardService } from './services/dashboard.service';
import { DashcardService } from './services/dashcard.service';
import { CardService } from './services/card.service';
import { FieldService } from './services/field.service';
import { TableService } from './services/table.service';
import { DependencyService } from './services/dependency.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.APP_DB_HOST,
      port: parseInt(process.env.APP_DB_PORT as string),
      username: process.env.APP_DB_USER,
      password: process.env.APP_DB_PASSWORD,
      database: process.env.APP_DB_NAME,
      synchronize: false,
      entities: [InstanceEntity, UserEntity],
    }),
    InstanceModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController, MetabaseController],
  providers: [
    AppService,
    MetabaseApiService,
    MetabaseAuthService,
    ApiQueryService,
    DatabaseRepository,
    CollectionRepository,
    DashboardRepository,
    CardRepository,
    FieldRepository,
    TableRepository,
    MetabaseUserRepository,
    DashcardRepository,
    ModelService,
    UtilsService,
    CollectionService,
    DatabaseService,
    UserService,
    DashboardService,
    DashcardService,
    CardService,
    FieldService,
    TableService,
    DependencyService,
    //InstanceService,
  ],
})
export class AppModule {}
