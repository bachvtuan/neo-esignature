import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule, Http, RequestOptions } from '@angular/http';
import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app.routing';
import { SharedModule } from './shared/shared.module';
import { ApiService } from './shared/api.service';
import { AuthHttp, AuthConfig } from 'angular2-jwt';

export function authHttpServiceFactory(http: Http, options: RequestOptions) {
  return new AuthHttp( new AuthConfig({
      noTokenScheme: true,
      tokenName: 'access_token',
  }), http, options);
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    SharedModule
  ],
  providers: [
    ApiService,
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy
    },
    {
      provide: AuthHttp,
      useFactory: authHttpServiceFactory,
      deps: [ Http, RequestOptions ]
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
