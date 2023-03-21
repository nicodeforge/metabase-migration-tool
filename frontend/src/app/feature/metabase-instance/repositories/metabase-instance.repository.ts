import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom, Observable, tap } from 'rxjs';
import { MetabaseInstanceDto } from '../dto/metabase-instance.dto';
import { CreateInstanceDto } from '../dto/create-instance.dto';
import { MetabaseInstanceService } from '../services/metabase-instance.service';

@Injectable({ providedIn: 'root' })
export class MetabaseInstanceRepository {
  constructor(
    private readonly http: HttpClient,
    private instanceService: MetabaseInstanceService
  ) {}

  public findAll(): Observable<MetabaseInstanceDto[]> | MetabaseInstanceDto[] {
    const localInstances = this.getInstancesLocally();
    if (localInstances.length === 0) {
      return this.http
        .get<MetabaseInstanceDto[]>(`http://localhost:3100/instance`)
        .pipe(
          tap((instances) => {
            this.instanceService.setInstances(instances);
          })
        );
    } else {
      this.instanceService.setInstances(localInstances);
      return localInstances;
    }
  }
  private getInstancesLocally(): MetabaseInstanceDto[] {
    console.log('local instances called');
    const localUserData = localStorage.getItem('userData');
    let localUser: any;
    if (localUserData) {
      localUser = JSON.parse(localUserData);

      if (localUser?.instances.length > 0) {
        console.log('Got instances locally', localUser.instances);
        return localUser?.instances;
      }
    }

    return [];
  }

  public async save(instance: CreateInstanceDto): Promise<MetabaseInstanceDto> {
    return await lastValueFrom(
      this.http.post<MetabaseInstanceDto>(
        `http://localhost:3100/instance/new`,
        instance
      )
    );
  }

  public async connect(
    instance: MetabaseInstanceDto
  ): Promise<MetabaseInstanceDto> {
    return await lastValueFrom(
      this.http.post<MetabaseInstanceDto>(
        `http://localhost:3100/instance/connect`,
        instance
      )
    );
  }

  public async delete(instance: MetabaseInstanceDto): Promise<any> {
    return await lastValueFrom(
      this.http.delete<MetabaseInstanceDto>(
        `http://localhost:3100/instance/${instance.id}`
      )
    );
  }

  public async findOneById(id: string): Promise<MetabaseInstanceDto> {
    return await lastValueFrom(
      this.http.get<MetabaseInstanceDto>(
        `http://localhost:3100/instance/id/${id}`
      )
    );
  }

  public async update(instance: MetabaseInstanceDto): Promise<any> {
    return await lastValueFrom(
      this.http.put(`http://localhost:3100/instance/${instance.id}`, instance)
    );
  }
}
