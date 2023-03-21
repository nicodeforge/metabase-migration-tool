import { FieldDto } from '../dto/metabase/field.dto';

export interface MetabaseFieldDependencyModel {
  origin: FieldDto;
  existsInDestination: boolean;

  destination: FieldDto;
}
