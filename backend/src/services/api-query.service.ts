import { Injectable } from '@nestjs/common';
import { lastValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class ApiQueryService {
  constructor(private readonly http: HttpService) {}
  public async processGetRequest(
    endpoint: string,
    token: string,
  ): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.http.get(endpoint, {
          headers: {
            'X-Metabase-Session': `${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      //console.log(response.statusText, response.dashboard);
      return response.data ?? null;
    } catch (e) {
      console.log(
        'Processing GET request on : ' +
          endpoint +
          ' returned code : ' +
          e.response.status,
      );
    }
  }

  public async processPutRequest(
    endpoint: string,
    payload: Record<any, any>,
    token: string,
  ): Promise<any> {
    try {
      console.log(
        `sending PUT request on ${endpoint} with payload : ${JSON.stringify(
          payload,
        )}`,
      );
      const response = await lastValueFrom(
        this.http.put(endpoint, payload, {
          headers: {
            'X-Metabase-Session': `${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      //console.log(response.statusText, response.dashboard);
      return response.data ?? null;
    } catch (e) {
      console.log(
        'Processing PUT request on : ' +
          endpoint +
          ' with payload : ' +
          JSON.stringify(payload) +
          ' returned code : ' +
          e.response.status,
      );
    }
  }

  public async processDeleteRequest(
    endpoint: string,
    token: string,
  ): Promise<void> {
    try {
      console.log(`PRocessing DELETE request on endpoint: ${endpoint}`);
      await lastValueFrom(
        this.http.delete(endpoint, {
          headers: {
            'X-Metabase-Session': `${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );
    } catch (e) {
      console.log(
        'Processing DELETE request on : ' +
          endpoint +
          ' returned code : ' +
          e.response.status,
      );
    }
  }

  public async processPostReqest(
    endpoint: string,
    payload: Record<any, any>,
    token: string,
  ): Promise<any> {
    try {
      const response = await lastValueFrom(
        this.http.post(endpoint, payload, {
          headers: {
            'X-Metabase-Session': `${token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      //console.log(response.statusText, response.dashboard);
      return response.data ?? null;
    } catch (e) {
      console.log(
        'Processing POST request on : ' +
          endpoint +
          ' with payload : ' +
          JSON.stringify(payload) +
          ' returned code : ' +
          e.response.status,
      );
    }
  }
}
