import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ModelDependencyRequest } from '../components/dependency-mapping/model-dependency.request';
import { lastValueFrom, Observable } from 'rxjs';
import { ModelWithDependenciesDto } from '../../feature/duplicate-dashboard/dto/model-with-dependencies.dto';
import { DatabaseCheckSchemaRequest } from '../../feature/duplicate-dashboard/components/copy-dashboard-across-instance/database-check-schema.request';
import { DatabaseSchemaEqualityInterface } from '../../feature/duplicate-dashboard/repositories/database-schema-equality.interface';
import { CreateModelRequestDto } from './create-model-request.dto';

@Injectable({
  providedIn: 'root',
})
export class ModelRepository {
  constructor(private readonly http: HttpClient) {}

  public getModelWithDependencies(
    modelDependencyRequest: ModelDependencyRequest
  ): Observable<ModelWithDependenciesDto> {
    console.log('getModelDependencies-repo');

    return this.http.post<ModelWithDependenciesDto>(
      `http://localhost:3100/metabase/model-with-dependencies`,
      modelDependencyRequest
    );
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

  public saveModel(saveModelRequest: CreateModelRequestDto): Observable<any> {
    return this.http.post(
      `http://localhost:3100/metabase/model/save`,
      saveModelRequest
    );
  }
}
