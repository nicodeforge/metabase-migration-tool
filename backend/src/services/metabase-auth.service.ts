import {
  ConsoleLogger,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { InstanceEntity } from '../instance/instance.entity';

@Injectable()
export class MetabaseAuthService {
  private instances: InstanceEntity[] = [];
  private consoleLogger: ConsoleLogger = new ConsoleLogger();

  constructor(private readonly http: HttpService) {}

  public async getMetabaseInstanceV2(
    instance: InstanceEntity,
  ): Promise<InstanceEntity> {
    if (instance.token) {
      const sessionIsValid = await this.isSessionValid(instance);
      if (sessionIsValid) {
        return instance;
      } else {
        instance.token = await this.requestToken(instance);
      }
    } else {
      instance.token = await this.requestToken(instance);
    }
    return instance;
  }

  private async requestToken(instance: InstanceEntity): Promise<string> {
    const endpoint = `${instance.url}/api/session`;
    try {
      const response = await lastValueFrom(
        this.http.post(endpoint, {
          username: instance.username,
          password: instance.password,
        }),
      );
      return response.data.id;
    } catch (e) {
      throw new Error(e);
    }
  }

  private async isSessionValid(instance: InstanceEntity): Promise<boolean> {
    if (this.instances.filter((item) => item.id === instance.id).length > 0) {
      if (
        this.instances.find((item) => instance.id === item.id).isAuthenticated
      ) {
        return true;
      }
    }

    const userRequestStatusCode = await this.requestCurrentUser(instance);

    if (userRequestStatusCode === 200) {
      instance.isAuthenticated = true;

      if (this.instances.filter((inst) => inst.id === instance.id).length > 0) {
        this.instances.find((inst) => inst.id === instance.id).isAuthenticated =
          true;
      } else {
        instance.isAuthenticated = true;
        this.instances.push(instance);
      }
    } else {
      instance.isAuthenticated = false;
    }
    return userRequestStatusCode === 200;
  }

  private async requestCurrentUser(instance: InstanceEntity): Promise<any> {
    const endpoint = `${instance.url}/api/user/current`;
    try {
      const response = await lastValueFrom(
        this.http.get(endpoint, {
          headers: {
            //TO DO : Check at which version X-Metabase-Session changed to X-Metabase-Token
            'X-Metabase-Token': `${instance.token}`,
            'X-Metabase-Session': `${instance.token}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.status;
    } catch (e) {
      if (typeof e.response != 'undefined') {
        this.consoleLogger.error(
          `ERROR : Got error when requested user on ${instance.name}. Code :  ${e.response.status}`,
        );
        return new HttpException(e.response.status, e.response.code);
      } else {
        switch (e.code) {
          case 'ECONNREFUSED':
            return new HttpException(
              'Connection refused',
              HttpStatus.SERVICE_UNAVAILABLE,
            );

          default:
            return new HttpException(
              'Unhandled Error',
              HttpStatus.REQUEST_TIMEOUT,
            );
        }
      }
    }
  }
}
