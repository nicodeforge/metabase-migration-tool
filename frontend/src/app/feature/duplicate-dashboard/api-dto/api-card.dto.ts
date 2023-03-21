import { DataSetQuery } from './api-dataset-query.dto';
import { ParameterMapping } from './api-parameter-mapping.dto';
import { ModelCreationEnum } from '../models/model-creation.enum';

class CardParameter {
  id!: string;
  type!: string;
  target!: any;

  name!: string;
  slug!: string;
}

export class ApiCardDto {
  description?: string;
  archived!: boolean;
  collection_position?: number;
  table_id?: number;
  result_metadata: any;
  database_id!: number;
  enable_embedding!: boolean;
  collection_id!: number;
  query_type!: string;
  name!: string;
  query_average_duration?: number;
  creator_id!: number;
  moderation_reviews?: any;
  updated_at!: Date;
  made_public_by_id?: number;
  embedding_params?: any;
  cache_ttl?: number;
  dataset_query!: DataSetQuery;
  id!: number;
  display!: string;
  visualization_settings: any;
  created_at!: Date;
  public_uuid?: string;

  parameter_mappings!: ParameterMapping[];

  parameters!: CardParameter[];

  createOrUpdate!: ModelCreationEnum;
  display_name?: string;
}
