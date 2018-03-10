import { environment } from '../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, RequestOptionsArgs, Response } from '@angular/http';
import { AuthHttp } from 'angular2-jwt';

import 'rxjs/add/operator/toPromise';

@Injectable()
export class ApiService {
  constructor(private http: Http, private authHttp: AuthHttp, private router: Router) {
  }

  private isUnauthorized(status: number): boolean {
    return status === 0 || status === 401 || status === 403;
  }

  private onHttpRequest(response: Observable<Response>): Promise<Response> {
    return new Promise((resolve, reject) => {
      response.toPromise().then(res => {
        resolve(res.json());
      }).catch(err => {
        if (err.status && this.isUnauthorized(err.status)){
          this.router.navigate(['/logout']);
          return reject(err);
        }
        return reject(err);
      });
    });
  }

  public get(endpoint:string, options?:object): Promise<Response> {
    return this.callMethod('get', endpoint, null, options);
  }

  public get_public(endpoint:string, options?:object): Promise<Response> {
    return this.callMethod('get', endpoint, null, options, true);
  }

  public post(endpoint:string, data:any, options?:object): Promise<Response> {
    return this.callMethod('post', endpoint, data, options);
  }

  public post_public(endpoint:string, data:any, options?:object): Promise<Response> {
    return this.callMethod('post', endpoint, data, options, true);
  }
  
  public put(endpoint:string, data:any, options?:object): Promise<Response> {
    return this.callMethod('put', endpoint, data, options);
  }

  public patch(endpoint:string, data:any, options?:object): Promise<Response> {
    return this.callMethod('patch', endpoint, data, options);
  }

  public delete(endpoint:string, options?:object): Promise<Response> {
    return this.callMethod('delete', endpoint, null, options);
  }

  private callMethod(method: string, endpoint: string, data?: any, options?:object, unsafe?: boolean): Promise<Response> {
    let httpClient: AuthHttp | Http;
    if (unsafe){
      httpClient = this.http;
    } else {
      httpClient = this.authHttp;
    }
    
    let requestOptions  = null;
    let headers: Headers;

    requestOptions = new RequestOptions({ headers: headers });

    switch (method) {
      case 'get':
        return this.onHttpRequest(httpClient.get(environment.API_BASE_URL + endpoint, requestOptions));
      case 'post':
        return this.onHttpRequest(httpClient.post(environment.API_BASE_URL + endpoint, data, requestOptions));
      case 'put':
        return this.onHttpRequest(httpClient.put(environment.API_BASE_URL + endpoint, data, requestOptions));
      case 'patch':
        return this.onHttpRequest(httpClient.patch(environment.API_BASE_URL + endpoint, data, requestOptions));
      case 'delete':
        return this.onHttpRequest(httpClient.delete(environment.API_BASE_URL + endpoint, requestOptions));
      default:
        console.error('API method not provided!')
    }
  }
}