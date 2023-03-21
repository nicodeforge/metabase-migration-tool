import { MetabaseCollectionDependencyModel } from '../models/metabase-collection-dependency.model';
import { MetabaseDatabaseDependencyModel } from '../models/metabase-database-dependency.model';
import { MetabaseTableDependencyModel } from '../models/metabase-table-dependency.model';
import { MetabaseCoreUserDependencyModel } from '../models/metabase-core-user-dependency.model';
import { ApiFieldDto } from './api-field.dto';

class MetabaseFieldDependencyModel {
  origin!: ApiFieldDto;
  existsInDestination?: boolean;
  destination?: ApiFieldDto;
}

export class ApiModelDependencyDto {
  collections!: MetabaseCollectionDependencyModel[];

  databases!: MetabaseDatabaseDependencyModel[];
  tables!: MetabaseTableDependencyModel[];
  users!: MetabaseCoreUserDependencyModel[];

  fields!: MetabaseFieldDependencyModel[];
}
