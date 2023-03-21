import { ParameterMapping } from './parameter-mapping.dto';
import { CardDto } from './card.dto';

export class DashcardDto {
  series: Array<any>;
  collection_authority_level?: any;
  card?: CardDto;
  updated_at?: Date;
  col: number;
  id: number;
  parameter_mappings: ParameterMapping[];
  card_id?: number;
  visualization_settings?: any;
  dashboard_id?: number;
  created_at?: Date;
  row: number;

  size_x?: number;

  sizeX?: number;

  size_y?: number;
  sizeY?: number;

  isRemoved?: boolean;
}
