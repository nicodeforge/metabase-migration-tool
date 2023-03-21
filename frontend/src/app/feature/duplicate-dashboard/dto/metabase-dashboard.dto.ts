import { MetabaseCollectionDto } from './metabase-collection.dto';
import { MetabaseCoreUserDto } from './metabase-core-user.dto';

export class MetabaseDashboardDto {
  id!: number;
  //report_dashboard_cards!: OldReportDashboardcardDto[];

  created_at!: Date;
  updated_at!: Date;
  name!: string;
  description!: string;
  creator_id!: number;
  parameters!: string;
  points_of_interest!: string;
  caveats!: string;
  show_in_getting_started!: boolean;
  public_uuid!: string;
  made_public_by_id!: number;
  enable_embedding!: boolean;
  embedding_params!: string;
  archived!: boolean;
  position!: number;
  collection_id!: number;
  collection_position!: number;
  cache_ttl!: number;

  creator!: MetabaseCoreUserDto;
  made_public_by!: MetabaseCoreUserDto;
  collection!: MetabaseCollectionDto;
}
