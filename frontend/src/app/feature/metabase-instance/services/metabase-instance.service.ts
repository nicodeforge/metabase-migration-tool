import { Injectable } from '@angular/core';
import { MetabaseInstanceDto } from '../dto/metabase-instance.dto';
import { Subject } from 'rxjs';
import { LocalStorageService } from '../../auth/services/local-storage.service';

export enum InstanceRetrievalMethodEnum {
  'local' = 'local',
  'remote' = 'remote',
}

@Injectable({
  providedIn: 'root',
})
export class MetabaseInstanceService {
  private instances: MetabaseInstanceDto[] = [];

  public instancesChanged: Subject<MetabaseInstanceDto[]> = new Subject();
  constructor(private readonly localStorage: LocalStorageService) {} //private readonly instanceRepository: MetabaseInstanceRepository

  public getInstances(): MetabaseInstanceDto[] {
    return this.instances.slice();
  }

  public updateInstance(instance: MetabaseInstanceDto): void {
    console.log('Called UPDATE INSTANCE');
    console.log('Search for ', instance.id);

    const instanceToUpdateIndex = this.instances.findIndex(
      (inst) => inst.id == instance.id
    );
    if (instanceToUpdateIndex >= 0) {
      this.instances[instanceToUpdateIndex] = instance;
      console.log('Called updateInstance to update instance', instance);
      this.localStorage.updateInstance('userData', 'instances', instance);

      this.instancesChanged.next(this.instances.slice());
    } else {
      console.log(instance, 'not found in', this.instances);
    }
  }

  /*public async createInstance(
    instance: CreateInstanceDto
  ): Promise<MetabaseInstanceDto> {
    return await this.instanceRepository.save(instance);
  }

  public async connect(
    instance: MetabaseInstanceDto
  ): Promise<MetabaseInstanceDto> {
    return await this.instanceRepository.connect(instance);
  }

  public async deleteInstance(instance: MetabaseInstanceDto): Promise<any> {
    return await this.instanceRepository.delete(instance);
  }*/

  public getInstance(id: string): MetabaseInstanceDto {
    const instances = this.instances.slice();
    const instance = instances.find((instance) => {
      return instance.id === id;
    });

    if (instance) {
      return instance;
    }

    return new MetabaseInstanceDto();
    // return await this.instanceRepository.findOneById(id);
  }

  /* public async updateInstance(instance: MetabaseInstanceDto): Promise<any> {
    return await this.instanceRepository.update(instance);
  }*/

  public setInstances(instances: MetabaseInstanceDto[]) {
    this.instances = instances;

    this.instances.forEach((instance) => {
      const instanceToUpdateIndex = this.instances.findIndex(
        (inst) => inst.id === instance.id
      );
      if (instanceToUpdateIndex) {
        this.instances[instanceToUpdateIndex] = instance;

        this.localStorage.updateInstance('userData', 'instances', instance);
      }
    });

    this.instancesChanged.next(this.instances.slice());
  }

  public addInstance(instance: MetabaseInstanceDto): void {
    this.instances.push(instance);
    this.localStorage.addInstance(instance);
    this.instancesChanged.next(this.instances.slice());
  }
}
