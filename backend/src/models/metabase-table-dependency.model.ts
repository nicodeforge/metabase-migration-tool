import { OldMetabaseTableDto } from '../dto/old_metabase/old-metabase-table.dto';

export interface MetabaseTableDependencyModel {
  origin: OldMetabaseTableDto;
  existsInDestination?: boolean;

  destination?: OldMetabaseTableDto;
}
