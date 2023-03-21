import { DashcardDto } from './dashcard.dto';
import { ModelCreationEnum } from '../../models/model-creation.enum';

class LastEditInfo {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  timestamp: Date;
}

class DashboardParameters {
  name: string;
  slug: string;
  id: string;
  type: string;
}

export class DashboardDto {
  description?: string;
  archived: boolean;
  collection_position?: number;
  ordered_cards: DashcardDto[];
  param_values?: any;
  can_write: boolean;
  enable_embedding: boolean;
  collection_id: number | 'root';
  show_in_getting_started: boolean;
  name: string;
  caveats?: any;
  collection_authority_level?: any;
  creator_id: number;
  updated_at: Date;
  made_public_by_id?: number;
  embedding_params?: any;
  cache_ttl?: any;
  id: number;
  position?: any;
  param_fields?: any;
  'last-edit-info': LastEditInfo;
  parameters: DashboardParameters[];
  created_at: Date;
  public_uuid?: string;
  points_of_interest?: any;

  createOrUpdate?: ModelCreationEnum;
}
