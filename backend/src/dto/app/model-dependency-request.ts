import { MetabaseModelTypeEnum } from '../../controllers/metabase-model-type.enum';

export interface ModelDependencyRequest {
  originInstanceId: string;
  destinationInstanceId: string;
  modelType: MetabaseModelTypeEnum;
  modelId: number;
}
