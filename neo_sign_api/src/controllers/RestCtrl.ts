import { Controller, Get, RouteService } from "@tsed/common";
import { Express } from "express";

@Controller("/rest")
export class RestCtrl {

    constructor(private routeService: RouteService) {}

    @Get("/")
    public getRoutes() {
        return this.routeService.getAll();
    }
}   