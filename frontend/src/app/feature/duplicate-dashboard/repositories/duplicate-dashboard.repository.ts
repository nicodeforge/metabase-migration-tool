import { HttpClient } from '@angular/common/http';
import { InstanceEnum } from './instance.enum';
import { lastValueFrom, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ApiDashboardWithDependenciesDto } from '../api-dto/api-dashboard-with-dependencies.dto';
import { CreateApiDashboardDto } from '../api-dto/create-api-dashboard.dto';
import { ApiDashboardDto } from '../api-dto/api-dashboard.dto';
import { MetabaseCoreUserDto } from '../dto/metabase-core-user.dto';
import { DashboardDependencyRequest } from './dashboard-dependency.request';
import { SaveDashboardRequest } from './save-dashboard.request';
import { DatabaseCheckSchemaRequest } from '../components/copy-dashboard-across-instance/database-check-schema.request';
import { DatabaseSchemaEqualityInterface } from './database-schema-equality.interface';

@Injectable()
export class DuplicateDashboardRepository {
  constructor(private readonly http: HttpClient) {}
  public getDashboardDependency(
    payload: DashboardDependencyRequest
  ): Observable<ApiDashboardWithDependenciesDto> {
    return this.http.post<ApiDashboardWithDependenciesDto>(
      `http://localhost:3100/metabase/dashboard/duplicate`,
      payload
    );
  }

  public async saveDashboard(
    saveDashboardRequest: SaveDashboardRequest
    /*originInstance: InstanceEnum,
    destinationInstance: InstanceEnum,
    dashboard: CreateApiDashboardDto*/
  ): Promise<any> {
    return await lastValueFrom(
      this.http.post<CreateApiDashboardDto>(
        `http://localhost:3100/metabase/dashboard/save`,
        saveDashboardRequest
      )
    );
  }

  public async getAllDashboards(instanceId: string) {
    return await lastValueFrom(
      this.http.get<ApiDashboardDto[]>(
        `http://localhost:3100/metabase/${instanceId}/dashboards`
      )
    );
  }

  async getTest() {
    return this.http.get<any>(`http://localhost:3100/test`).subscribe();
  }

  public async getDatabasesSchemasAreSame(
    databaseSchemaCheckRequest: DatabaseCheckSchemaRequest
  ): Promise<DatabaseSchemaEqualityInterface> {
    return await lastValueFrom(
      this.http.post<DatabaseSchemaEqualityInterface>(
        `http://localhost:3100/metabase/check_schemas`,
        databaseSchemaCheckRequest
      )
    );
  }

  public async getAllUsers(
    instance: InstanceEnum
  ): Promise<MetabaseCoreUserDto[]> {
    return await lastValueFrom(
      this.http.get<MetabaseCoreUserDto[]>(
        `http://localhost:3100/metabase/${instance}/users`
      )
    );
  }
}
