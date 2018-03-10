import { RouterModule, Routes } from "@angular/router";
import { FrontComponent } from "./pages/front.component";
import { NgModule } from "@angular/core";

const routes: Routes = [
    { path: 'home', loadChildren: "./pages/front.module#FrontModule" },
    {
        path: '**',
        redirectTo: 'home',
        pathMatch: 'full',
    },
]


@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule],
  })
  export class AppRoutingModule {
}