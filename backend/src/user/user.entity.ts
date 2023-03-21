import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { InstanceEntity } from '../instance/instance.entity';

@Entity({
  name: 'user',
})
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  email: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  password: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'refresh_token',
  })
  refreshToken;
  @OneToMany(() => InstanceEntity, (instance) => instance.user, {
    nullable: true,
  })
  instances: InstanceEntity[];
}
