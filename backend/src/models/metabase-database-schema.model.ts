export interface MetabaseDatabaseSchemaModel {
  description?: string;
  entity_type: string;
  schema: string;
  show_in_getting_started: boolean;
  name: string;
  caveats?: any;
  updated_at: Date;
  entity_name?: string;
  active: boolean;
  id: number;
  db_id: number;
  visibility_type?: string;
  field_order: string;
  display_name: string;
  created_at: Date;
  points_of_interest?: any;
}
