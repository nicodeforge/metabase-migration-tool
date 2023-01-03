import { MetabaseTableDto } from './metabase-table.dto';

export interface MetabaseTableDependencyModel {
  table: MetabaseTableDto;
  existsInDestination?: boolean;
}
