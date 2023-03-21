import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InstanceEntity } from './instance.entity';
import { Repository, UpdateResult } from 'typeorm';
import { MetabaseAuthService } from '../services/metabase-auth.service';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class InstanceService {
  constructor(
    @InjectRepository(InstanceEntity)
    private instanceRepository: Repository<InstanceEntity>,
    private userService: UserService,

    private readonly metabaseAuth: MetabaseAuthService,
  ) {}

  public async findAll(user: UserEntity): Promise<InstanceEntity[]> {
    return this.instanceRepository.find({
      where: {
        user: user,
      },
    });
  }

  public async findById(instanceId: string): Promise<InstanceEntity> {
    return this.instanceRepository.findOne({
      where: {
        id: instanceId,
      },
    });
  }

  public async findByName(name: string): Promise<InstanceEntity> {
    return this.instanceRepository.findOne({
      where: {
        name: name,
      },
    });
  }

  public async save(
    user: UserEntity,
    instance: InstanceEntity,
  ): Promise<InstanceEntity> {
    instance.user = user;
    return await this.instanceRepository.save(instance);
  }

  public async update(
    user: UserEntity,
    instance: InstanceEntity,
  ): Promise<UpdateResult> {
    /*if (instance.user != user) {
      throw new BadRequestException(
        `Cannot update instance ${instance.name}. It belongs to another user.`,
      );
    }*/
    const update = await this.instanceRepository.update(
      {
        id: instance.id,
      },
      {
        username: instance?.username,
        name: instance?.name,
        token: instance?.token,
        url: instance?.url,
      },
    );
    console.log(`Update result : ${JSON.stringify(update)}`);
    return update;
  }

  public async connect(
    user: UserEntity,
    instance: InstanceEntity,
  ): Promise<InstanceEntity> {
    console.log(`Connecting to instance ${instance.name}`);
    instance = await this.metabaseAuth.getMetabaseInstanceV2(instance);

    await this.update(user, instance);
    console.log(`Returning instance ${JSON.stringify(instance)}`);
    return instance;
  }

  public async delete(user: UserEntity, instanceId: string): Promise<any> {
    const deleteResult = await this.instanceRepository.delete({
      id: instanceId,
      user: user,
    });

    console.log(
      `Deleted instance ${instanceId} and returned ${JSON.stringify(
        deleteResult,
      )}`,
    );

    return deleteResult;
  }
}
