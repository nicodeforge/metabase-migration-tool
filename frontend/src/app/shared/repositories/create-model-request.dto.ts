import { MetabaseModelTypeEnum } from '../../feature/duplicate-dashboard/dto/model-with-dependencies.dto';
import { CreateModelDto } from './create-model.dto';

export interface CreateModelRequestDto {
  modelType: MetabaseModelTypeEnum;
  originInstanceId: string;
  destinationInstanceId: string;
  model: CreateModelDto;
}
