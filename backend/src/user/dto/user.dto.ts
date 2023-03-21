import { InstanceEntity } from '../../instance/instance.entity';

export class UserDto {
  id: string;
  email: string;
  name: string;

  instances?: InstanceEntity[];

  accessToken: string;
  refreshToken: string;
}
