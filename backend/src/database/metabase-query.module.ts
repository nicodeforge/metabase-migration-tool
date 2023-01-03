import { Global, Module } from '@nestjs/common';
import { DB_QUERY } from './db-query';
import { DbQueryService } from './db-query.service';
import { DbMetabaseStagingConnectionModule } from './metabase-staging-connection.module';
import { DbMetabaseProductionConnectionModule } from './metabase-production-connection.module';

@Global()
@Module({
  imports: [
    DbMetabaseStagingConnectionModule.forRoot(),
    DbMetabaseProductionConnectionModule.forRoot(),
  ],
  providers: [
    {
      provide: DB_QUERY,
      useClass: DbQueryService,
    },
  ],
  exports: [DB_QUERY],
})
export class MetabaseQueryModule {}
