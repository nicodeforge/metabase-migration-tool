import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InstanceService } from './instance.service';
import { InstanceEntity } from './instance.entity';
import { UpdateResult } from 'typeorm';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { Request } from 'express';
import { UserService } from '../user/user.service';
import { UserEntity } from '../user/user.entity';

@Controller('instance')
export class InstanceController {
  constructor(
    private instanceService: InstanceService,
    private userService: UserService,
  ) {}

  @UseGuards(AccessTokenGuard)
  @Get('')
  public async getAllInstances(@Req() req: Request): Promise<InstanceEntity[]> {
    const userId = req.user['sub'];
    const user = await this.getUser(userId);
    return await this.instanceService?.findAll(user);
  }

  @UseGuards(AccessTokenGuard)
  @Get(':name')
  public async getInstanceByName(
    @Param('name') name: string,
  ): Promise<InstanceEntity> {
    return await this.instanceService?.findByName(name);
  }

  @UseGuards(AccessTokenGuard)
  @Get('id/:instanceId')
  public async getInstanceById(
    @Param('instanceId') instanceId: string,
  ): Promise<InstanceEntity> {
    return await this.instanceService?.findById(instanceId);
  }

  @UseGuards(AccessTokenGuard)
  @Post('new')
  public async saveInstance(
    @Body() instance: InstanceEntity,
    @Req() req: Request,
  ): Promise<InstanceEntity> {
    const userId = req.user['sub'];
    const user = await this.getUser(userId);
    return this.instanceService.save(user, instance);
  }
  @UseGuards(AccessTokenGuard)
  @Post('connect')
  public async connectInstance(
    @Body() instance: InstanceEntity,
    @Req() req: Request,
  ): Promise<InstanceEntity> {
    const userId = req.user['sub'];
    const user = await this.getUser(userId);
    return await this.instanceService.connect(user, instance);
  }
  @UseGuards(AccessTokenGuard)
  @Put(':id')
  public async updateInstance(
    @Body() instance: InstanceEntity,
    @Req() req: Request,
  ): Promise<UpdateResult> {
    console.log('UPDATE ', req.user);
    const userId = req.user['sub'];
    const user = await this.getUser(userId);
    return await this.instanceService.update(user, instance);
  }
  @UseGuards(AccessTokenGuard)
  @Delete(':instanceId')
  public async deleteInstance(
    @Param('instanceId') instanceId: string,
    @Req() req: Request,
  ): Promise<any> {
    const userId = req.user['sub'];
    const user = await this.getUser(userId);
    return await this.instanceService.delete(user, instanceId);
  }

  private async getUser(userId: string): Promise<UserEntity> {
    return await this.userService.findOneById(userId);
  }
}
