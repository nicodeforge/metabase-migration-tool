import { MetabaseCollectionDependencyModel } from '../models/metabase-collection-dependency.model';
import { MetabaseDatabaseDependencyModel } from '../models/metabase-database-dependency.model';
import { MetabaseTableDependencyModel } from '../models/metabase-table-dependency.model';
import { MetabaseCoreUserDependencyModel } from '../models/metabase-core-user-dependency.model';

export class ModelDependencyDto {
  collections!: MetabaseCollectionDependencyModel[];

  databases!: MetabaseDatabaseDependencyModel[];
  tables!: MetabaseTableDependencyModel[];
  users!: MetabaseCoreUserDependencyModel[];
}
