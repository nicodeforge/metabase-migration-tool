import { MetabaseCoreUserDto } from '../metabase/metabase-core-user.dto';
import { OldMetabaseDatabaseDto } from './old-metabase-database.dto';
import { OldMetabaseTableDto } from './old-metabase-table.dto';
import { MetabaseCollectionDto } from '../metabase/metabase-collection.dto';

export class OldReportCardDto {
  id: number;
  created_at: Date;
  updated_at: Date;
  name: string;
  description: string;
  display: string;
  dataset_query: string;
  visualization_settings: string;
  creator_id: number;
  database_id: number;
  table_id: number;
  query_type: string;
  archived: boolean;
  collection_id: number;
  public_uuid?: string;
  made_public_by_id: number;
  enable_embedding: boolean;
  embedding_params: string;
  cache_ttl: number;
  result_metadata: string;
  collection_position: number;

  creator?: MetabaseCoreUserDto;

  publisher?: MetabaseCoreUserDto;
  database?: OldMetabaseDatabaseDto;

  table: OldMetabaseTableDto;

  collection: MetabaseCollectionDto;
}
