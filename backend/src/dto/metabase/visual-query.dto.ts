import { JoinDto } from './join.dto';

export class VisualQueryDto {
  aggregation: Array<any>;
  breakout: Array<any>;

  joins: JoinDto[];

  'order-by': Array<any>;

  filter: Array<any>;
  'source-table': number;
}
