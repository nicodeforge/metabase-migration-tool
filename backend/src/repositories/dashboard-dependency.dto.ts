import { MetabaseCollectionDependendyModel } from './metabase-collection-dependendy.model';
import { MetabaseDatabaseDependencyModel } from './metabase-database-dependency.model';
import { MetabaseTableDependencyModel } from './metabase-table-dependency.model';
import { MetabaseCoreUserDependencyModel } from './metabase-core-user-dependency.model';

export class DashboardDependencyDto {
  collections: MetabaseCollectionDependendyModel[];

  databases: MetabaseDatabaseDependencyModel[];
  tables: MetabaseTableDependencyModel[];
  users: MetabaseCoreUserDependencyModel[];
}
