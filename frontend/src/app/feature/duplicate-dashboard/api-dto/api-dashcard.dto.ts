import { ParameterMapping } from './api-parameter-mapping.dto';
import { ApiCardDto } from './api-card.dto';

export class ApiDashcardDto {
  size_x!: number;
  series!: Array<any>;
  collection_authority_level?: any;
  card!: ApiCardDto;
  updated_at!: Date;
  col!: number;
  id!: number;
  parameter_mappings!: ParameterMapping[];
  card_id!: number;
  visualization_settings!: any;
  dashboard_id!: number;
  created_at!: Date;
  size_y!: number;
  row!: number;
}
