import { MetabaseCoreUserDto } from '../dto/metabase/metabase-core-user.dto';

export interface MetabaseCoreUserDependencyModel {
  origin: MetabaseCoreUserDto;
  existsInDestination?: boolean;

  destination?: MetabaseCoreUserDto;
}
