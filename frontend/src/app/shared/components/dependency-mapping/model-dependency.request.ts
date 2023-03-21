import { MetabaseModelTypeEnum } from '../../../feature/duplicate-dashboard/dto/model-with-dependencies.dto';

export interface ModelDependencyRequest {
  originInstanceId: string;
  destinationInstanceId: string;
  modelType: MetabaseModelTypeEnum;
  modelId: number;
}
