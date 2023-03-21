import { MetabaseDashboardDto } from './metabase-dashboard.dto';
import { ReportCardDto } from './report-card.dto';

export class ReportDashboardCardDto {
  id!: number;
  created_at!: Date;

  updated_at!: Date;

  sizeX!: number;
  sizeY!: number;

  row!: number;
  col!: number;

  card_id!: number;

  dashboard_id!: number;

  parameter_mappings!: any;

  visualization_settings!: any;

  card?: ReportCardDto;

  dashboard?: MetabaseDashboardDto;
}
