import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FrontComponent } from './front.component';
import { SharedModule } from '../shared/shared.module';

const routes = [{
    path: '',
    component: FrontComponent,
    data: {
        title: 'Front'
    }
}];

@NgModule({
    imports     : [
        RouterModule.forChild(routes),
        SharedModule,
    ],
    declarations: [
        FrontComponent,
    ]
})

export class FrontModule
{

}