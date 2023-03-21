import { CreateApiDashboardDto } from '../api-dto/create-api-dashboard.dto';

export class SaveDashboardRequest {
  originInstanceId!: string;
  destinationInstanceId!: string;
  dashboard!: CreateApiDashboardDto;
}
