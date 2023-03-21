export class DateTemplateTagDto {
  id: string;
  name: string;
  'display-name': string;
  type = 'date';

  default?: string;

  required?: boolean;
}
