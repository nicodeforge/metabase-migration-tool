import { MetabaseCoreUserDto } from './metabase-core-user.dto';

export interface MetabaseCoreUserDependencyModel {
  user: MetabaseCoreUserDto;
  existsInDestination?: boolean;
}
