import { MetabaseDatabaseDto } from './metabase-database.dto';

export interface MetabaseDatabaseDependencyModel {
  database: MetabaseDatabaseDto;
  existsInDestination?: boolean;
}
