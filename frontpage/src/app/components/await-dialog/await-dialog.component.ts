import { Component, OnInit, Inject, Output, EventEmitter } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Observable } from 'rxjs/Rx';

export type AwaitDialogStatus = "pending" | "done" | "fail";

export interface AwaitDialogData{
    action: 'sign' | 'verify',
    params: string[],
    contractHash: string,
    status?: AwaitDialogStatus,
    failReason?: string
}

@Component({
    selector   : 'await-dialog',
    templateUrl: './await-dialog.component.html',
    styleUrls: ['./await-dialog.component.scss']
})

export class AwaitDialogComponent implements OnInit
{
    @Output() timeout: EventEmitter<void> = new EventEmitter<void>();
    @Output() linkClick: EventEmitter<void> = new EventEmitter<void>(); 
    
    public status: AwaitDialogStatus;
    public failReason: string;
    public time = {
        subscription: null,
        timer: Observable.timer(0, 1000),
        startTime: null,
        timeLeft: '00:00',
        timeLeftPercent: 0
    }

    public downloadUrl: string;

    constructor(
        public dialogRef: MatDialogRef<AwaitDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: AwaitDialogData
    ){}

    ngOnInit(){
        if (this.data.status){
            this.status = this.data.status;
        } else {
            this.status = "pending";
        }

        if (this.data.failReason){
            this.failReason = this.data.failReason;
        }
        
        this.time.startTime = new Date();
        this.time.subscription = this.time.timer.subscribe(t => {
            let timeLeft = this.time.startTime.getTime() + 600000 - new Date().getTime();
            if (timeLeft < 100){
              this.time.subscription.unsubscribe();
              this.setFailed('ran out of time');
              return;
            }
            let seconds = Math.floor((timeLeft / 1000) % 60);
            let minutes = Math.floor((timeLeft / (60 * 1000)) % 60);
            let minutesStr = (minutes < 10) ? "0" + minutes : minutes;
            let timeLeftStr = minutesStr + ":" + ((seconds < 10) ? "0" + seconds : seconds);
            this.time.timeLeftPercent = Number((timeLeft / (6000)).toFixed(2));
            this.time.timeLeft = timeLeftStr;
        });
    }

    setDone(url){
        this.status = "done";
        this.downloadUrl = url;
        this.time.subscription.unsubscribe();
    }

    setFailed(reason: string){
        this.status = "fail";
        this.failReason = reason;
        this.dialogRef.disableClose = false;
        this.timeout.emit();
    }

    close(){
        this.dialogRef.close();
    }

    openLink(){
        this.linkClick.emit();
    }

}
