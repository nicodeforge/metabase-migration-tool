import { DimensionTemplateTag } from './dimension-template-tag.dto';
import { TextTemplateTag } from './text-template-tag.dto';
import { NumericTemplateTag } from './numeric-template-tag.dto';
import { DateTemplateTagDto } from './date-template-tag.dto';

export class NativeQueryDto {
  query: string;
  /*'template-tags':
    | DimensionTemplateTag[]
    | TextTemplateTag[]
    | NumericTemplateTag[]
    | DateTemplateTagDto[];*/
  'template-tags': Array<
    | DimensionTemplateTag
    | TextTemplateTag
    | NumericTemplateTag
    | DateTemplateTagDto
  >;
}
