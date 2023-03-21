export class DimensionTemplateTag {
  id!: string;
  name!: string;
  'display-name'!: string;
  type!: 'dimension';
  dimension!: [string, number, any | null];
  'widget-type'!: string;
  default?: any;
}
