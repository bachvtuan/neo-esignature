import * as Express from "express";
import { IMiddleware, OverrideMiddleware, AuthenticatedMiddleware, Request, Response, Next, EndpointInfo, EndpointMetadata, Req, ServerSettingsService } from "@tsed/common";
import { Forbidden } from "ts-httpexceptions";
import { $log } from "ts-log-debug";

@OverrideMiddleware(AuthenticatedMiddleware)
export class AuthMiddleware {

    constructor() {}

    async use( 
        @EndpointInfo() endpoint: EndpointMetadata,
        @Req() request: Express.Request,
    ) {
        let options = endpoint.store.get(AuthenticatedMiddleware);

        if (!options || !options.role) {
            options = {role: 'basic'}
        }

        switch (options.role) {
            case 'basic': await this.authBasic(endpoint, request); break;
            default: throw new Forbidden("Forbidden");
        }
    }

    private async authBasic(endpoint: EndpointMetadata, request: Express.Request) {
        let auth = request.get('authorization');
        if (!auth) {
            throw new Forbidden("Forbidden");
        }

        let credentials = this.decodeBasicAuth(auth);
        if (!credentials) {
            throw new Forbidden("Forbidden");
        }

        if (
            credentials.username != process.env.API_AUTH_BASIC_USERNAME ||
            credentials.password != process.env.API_AUTH_BASIC_PASSWORD
        ) {
            throw new Forbidden("Forbidden");
        }
    }

    private decodeBasicAuth(auth: string) {
        let authParts = auth.split(' ');
        if (!authParts || authParts.length != 2 || authParts[0].toLowerCase() != 'basic') {
            return null;
        }

        let plainCredentials = new Buffer(authParts[1], 'base64').toString();
        if (!plainCredentials) {
            return null;
        }
        
        let credentials = plainCredentials.split(':');
        if (!credentials || credentials.length != 2) {
            return null;
        }

        return {username: credentials[0], password: credentials[1]};
    }
}