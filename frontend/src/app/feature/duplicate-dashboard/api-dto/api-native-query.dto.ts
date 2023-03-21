import { DimensionTemplateTag } from './api-dimension-template-tag.dto';
import { TextTemplateTag } from './api-text-template-tag.dto';

export class NativeQueryDto {
  query!: string;
  //TODO : Make sure template tags always follows below type
  'template-tags'!: DimensionTemplateTag[] | TextTemplateTag[];
}
