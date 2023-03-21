import { MetabaseCoreUserDto } from './metabase-core-user.dto';
import { MetabaseDatabaseDto } from './metabase-database.dto';
import { MetabaseTableDto } from './metabase-table.dto';
import { MetabaseCollectionDto } from './metabase-collection.dto';

export class ReportCardDto {
  id!: number;
  created_at!: Date;
  updated_at!: Date;
  name!: string;
  description!: string;
  display!: string;
  dataset_query!: string;
  visualization_settings!: string;
  creator_id!: number;
  database_id!: number;
  table_id!: number;
  query_type!: string;
  archived!: boolean;
  collection_id!: number;
  public_uuid?: string;
  made_public_by_id!: number;
  enable_embedding!: boolean;
  embedding_params!: string;
  cache_ttl!: number;
  result_metadata!: string;
  collection_position!: number;

  creator?: MetabaseCoreUserDto;

  publisher?: MetabaseCoreUserDto;
  database?: MetabaseDatabaseDto;

  table!: MetabaseTableDto;

  collection!: MetabaseCollectionDto;
}
