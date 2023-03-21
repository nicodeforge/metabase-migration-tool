import {
  ActivatedRouteSnapshot,
  Resolve,
  RouterStateSnapshot,
} from '@angular/router';
import { MetabaseInstanceDto } from '../dto/metabase-instance.dto';
import { MetabaseInstanceService } from './metabase-instance.service';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { MetabaseInstanceRepository } from '../repositories/metabase-instance.repository';
import { LocalStorageService } from '../../auth/services/local-storage.service';

@Injectable({
  providedIn: 'root',
})
export class InstanceResolver implements Resolve<MetabaseInstanceDto[]> {
  constructor(
    private instanceService: MetabaseInstanceService,
    private instanceRepository: MetabaseInstanceRepository,

    private localStorageService: LocalStorageService
  ) {}

  public resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MetabaseInstanceDto[] | Observable<MetabaseInstanceDto[]> {
    console.log('Resolver called');
    const instances = this.instanceService.getInstances();

    const userLocalData = this.localStorageService.getItem('userData');

    let localInstances!: MetabaseInstanceDto[];

    if (userLocalData) {
      localInstances = userLocalData['instances'];
      console.log('Got local instance ', localInstances);
    }

    if (localInstances?.length > instances?.length) {
      console.log('Returning local instances');
      this.instanceService.setInstances(localInstances);
      return localInstances;
    }

    if (localInstances?.length === 0 || !localInstances) {
      console.log('Returning remote instances');
      return this.instanceRepository.findAll();
    } else {
      console.log('Returning memory instances');
      return instances;
    }
  }
}
