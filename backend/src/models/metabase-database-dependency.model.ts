import { OldMetabaseDatabaseDto } from '../dto/old_metabase/old-metabase-database.dto';

export interface MetabaseDatabaseDependencyModel {
  origin: OldMetabaseDatabaseDto;
  existsInDestination?: boolean;
  destination?: OldMetabaseDatabaseDto;
}
