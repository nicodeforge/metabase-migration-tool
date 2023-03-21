import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { UserEntity } from '../user/user.entity';

@Entity({
  name: 'instance',
})
export class InstanceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: false,
  })
  username: string;

  password: string;

  @Column({
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  url: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  token: string;

  @ManyToOne(() => UserEntity, (user) => user.instances, {
    nullable: false,
    cascade: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  user: UserEntity;

  isAuthenticated: boolean;
}
