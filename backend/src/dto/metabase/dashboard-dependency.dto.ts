import { MetabaseCollectionDependencyModel } from '../../models/metabase-collection-dependency.model';
import { MetabaseDatabaseDependencyModel } from '../../models/metabase-database-dependency.model';
import { MetabaseCoreUserDependencyModel } from '../../models/metabase-core-user-dependency.model';

export class DashboardDependencyDto {
  collections: MetabaseCollectionDependencyModel[];

  databases: MetabaseDatabaseDependencyModel[];
  users: MetabaseCoreUserDependencyModel[];
}
