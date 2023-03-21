import { JoinDto } from './join.dto';

export class VisualQueryDto {
  aggregation: Array<any>;
  breakout: Array<any>;

  joins: JoinDto[];

  'source-table': number;
}
