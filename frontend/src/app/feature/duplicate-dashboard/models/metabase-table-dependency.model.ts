import { MetabaseTableDto } from '../dto/metabase-table.dto';

export interface MetabaseTableDependencyModel {
  origin: MetabaseTableDto;
  existsInDestination: boolean;

  destination: MetabaseTableDto;
}
