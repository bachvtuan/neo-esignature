import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { MaterialModule } from './material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FuseIfOnDomDirective } from '../dirrectives/fuse-if-on-dom/fuse-if-on-dom.directive';
import { AwaitDialogComponent } from '../components/await-dialog/await-dialog.component';

@NgModule({
    declarations: [
        FuseIfOnDomDirective,
        AwaitDialogComponent
    ],
    imports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule
    ],
    exports: [
        CommonModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        FlexLayoutModule,
        FuseIfOnDomDirective
    ],
    providers: [

    ],
    entryComponents: [
        AwaitDialogComponent
    ]
})
export class SharedModule { }
