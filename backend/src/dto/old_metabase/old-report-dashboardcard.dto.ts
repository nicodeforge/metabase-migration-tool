import { OldReportCardDto } from './old-report-card.dto';
import { OldMetabaseDashboardDto } from './old-metabase-dashboard.dto';

export class OldReportDashboardcardDto {
  id: number;
  created_at: Date;

  updated_at: Date;

  sizeX: number;
  sizeY: number;

  row: number;
  col: number;

  card_id: number;

  dashboard_id: number;

  parameter_mappings: any;

  visualization_settings: any;

  card?: OldReportCardDto;

  dashboard?: OldMetabaseDashboardDto;
}
