import { ApiDashboardDto } from '../../feature/duplicate-dashboard/api-dto/api-dashboard.dto';
import { ApiCardDto } from '../../feature/duplicate-dashboard/api-dto/api-card.dto';

enum CreateModelStatusEnum {
  'ok',
  'ko',
}

export interface CreateModelResponseDto {
  status: CreateModelStatusEnum;
  url?: string;
  model: ApiDashboardDto | ApiCardDto;
}
