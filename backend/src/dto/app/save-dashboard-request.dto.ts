import { CreateDashboardDto } from '../metabase/create-dashboard.dto';

export class SaveDashboardRequestDto {
  originInstanceId!: string;
  destinationInstanceId!: string;
  dashboard!: CreateDashboardDto;
}
