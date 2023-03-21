import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  public async findOne(
    email: string,
    withInstances = false,
  ): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: {
        email: email,
      },
      relations: {
        instances: withInstances,
      },
    });
  }

  public async findOneById(
    userId: string,
    withInstances = false,
  ): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: {
        id: userId,
      },
      relations: {
        instances: withInstances,
      },
    });
  }

  public async create(user: CreateUserDto): Promise<any> {
    return await this.userRepository.save(user);
  }

  public async update(userId: string, partialEntity: Record<string, any>) {
    console.log(
      `Will update user #${userId} with ${JSON.stringify(partialEntity)}`,
    );
    return await this.userRepository.update(
      {
        id: userId,
      },
      partialEntity,
    );
  }
}
