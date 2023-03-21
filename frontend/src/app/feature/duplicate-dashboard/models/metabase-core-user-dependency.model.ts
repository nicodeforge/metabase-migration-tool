import { MetabaseCoreUserDto } from '../dto/metabase-core-user.dto';

export class MetabaseCoreUserDependencyModel {
  origin!: MetabaseCoreUserDto;
  existsInDestination!: boolean;
  isMapped: boolean = false;
  destination!: MetabaseCoreUserDto;
}
