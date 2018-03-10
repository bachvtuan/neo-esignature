import { Component, OnInit } from '@angular/core';
import { fuseAnimations } from '../shared/animations';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../shared/api.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { AwaitDialogComponent, AwaitDialogData } from '../components/await-dialog/await-dialog.component';
import { ResponseContentType, RequestOptions, Headers, Http } from '@angular/http';
import { environment } from '../../environments/environment';


import 'rxjs/Rx' ;
import { DomSanitizer } from '@angular/platform-browser';
@Component({
  styleUrls: ['./front.component.scss'],
  templateUrl: 'front.component.html',
  animations : fuseAnimations
})
export class FrontComponent implements OnInit {
    public formUpload: FormGroup;
    public formVerify: FormGroup;
    public loading: boolean = false;
    public awaitDialog: {
        dialog: MatDialogRef<AwaitDialogComponent>, 
        opened: boolean
    };
    public timedOut: boolean;
    private signatureTimeoutTime = 15000;

    private signatureParams: {
        address: string,
        filehash: string,
        title?: string,
        description?: string,
        firstname?: string,
        lastname?: string,
    };

    public verifyData;
    public verificationStatus: "invalid" | "valid";

    constructor(
        formBuilder: FormBuilder,
        public dialog: MatDialog,
        private apiService: ApiService,
        private http: Http,
        private sanitizer: DomSanitizer
    ) {
        this.formUpload = formBuilder.group({
            address: [null, Validators.required],
            file: [null, Validators.required],
            title: [null],
            description: [null],
            firstname: [null],
            lastname: [null],
        });

        this.formVerify = formBuilder.group({
            address: [null, Validators.required],
            file: [null, Validators.required],
            signature: [null]
        });
    }

    ngOnInit() {
        this.awaitDialog = {
            dialog: null, 
            opened: false
        };
    }

    onFileChange(event, form: FormGroup, name = 'file'){
        if (!form || !form.get(name)){
            return;
        }
        if (event.target.files && event.target.files.length > 0){
            form.get(name).setValue(event.target.files[0]);
        }
    }

    async sign(event){
        if (!this.formUpload.valid){
            return;
        }
        this.timedOut = false;
        this.loading = true;
        let data = new FormData();
        for (let key of Object.keys(this.formUpload.value)){
            data.append(key, this.formUpload.value[key]);
        }

        try {
            let result = <any>await this.apiService.post_public('/sign', data);
            if (result.status == "success"){
                this.openDialog({
                    action: 'sign',
                    params: [result.address, result.fileHash, result.signatureHash],
                    contractHash: result.contractHash
                });
                setTimeout(() => {this.getStatus(result.key, null)}, this.signatureTimeoutTime);
                this.signatureParams = {
                    address: result.address,
                    filehash: result.fileHash
                };
                if (this.formUpload.value.title){
                    this.signatureParams.title = this.formUpload.value.title;
                }
                if (this.formUpload.value.firstname){
                    this.signatureParams.firstname = this.formUpload.value.firstname;
                }
                if (this.formUpload.value.description){
                    this.signatureParams.description = this.formUpload.value.description;
                }
                if (this.formUpload.value.lastname){
                    this.signatureParams.lastname = this.formUpload.value.lastname;
                }
            }
        } catch(err) {
            this.handleErrorResponse(err);
            console.error(err);
        }
        
        this.loading = false;
    }

    async verify(event){
        if (!this.formVerify.valid){
            return;
        }
        this.timedOut = false;
        this.loading = true;
        let data = new FormData();
        for (let key of Object.keys(this.formVerify.value)){
            data.append(key, this.formVerify.value[key]);
        }

        try {
            let result = <any>await this.apiService.post_public('/verify', data);
            console.log(result);
            if (result.status == "valid" || result.status == "invalid"){
                this.verificationStatus = result.status;
            } else {
                return this.handleErrorResponse(result);
            }

            if (result.data){
                let verifyDataText = "";
                for (let name of Object.keys(result.data)){
                    if (name == 'metaData'){
                        for (let meta of Object.keys(result.data[name])){
                            verifyDataText += "  " + name + ": " + result.data[name][meta] + "\r\n";
                        }
                    } else {
                        verifyDataText += "  " + name + ": " + result.data[name] + "\r\n";
                    }
                    
                }
                if (verifyDataText.length > 0){
                    verifyDataText = verifyDataText.substr(0, verifyDataText.length - 2);
                }

                this.verifyData = verifyDataText;
            }
        } catch(err) {
            this.handleErrorResponse(err);
            console.error(err);
        }
        
        this.loading = false;
    }

    async getStatus(code: string, retries = 0){
        if (this.timedOut){
            return;
        }
        try {
            let result = <any>await this.apiService.get_public('/signature/' + code);
            
            switch(result.status){
                case "invalid": {
                    return setTimeout(() => {this.getStatus(code, retries)}, this.signatureTimeoutTime);
                }
                case "error": {
                    return this.handleErrorResponse(result);
                }
                case "success": {
                    let url = await this.downloadSignatureFile(this.signatureParams);
                    console.log(url);
                    if (url){
                        return this.awaitDialog.dialog.componentInstance.setDone(url);
                    }
                    // do not break, let it go to default handling
                }
                default: {
                    // got here, that is weird, probably pending but lets set it as retry
                    if (retries < 20){
                        setTimeout(() => {this.getStatus(code, retries + 1)}, this.signatureTimeoutTime);
                    } else {
                        this.awaitDialog.dialog.componentInstance.setFailed("Server error occured");
                    }
                }
            }
        } catch(err) {
            if (!err || err.reason == "server" && retries < 5){
                setTimeout(() => {this.getStatus(code, retries + 1)}, this.signatureTimeoutTime * 2);
            } else {
                this.handleErrorResponse(err);
            }
            console.log(err);
        }
    }

    openDialog(data: AwaitDialogData, code?: string){
        this.awaitDialog.dialog = this.dialog.open(AwaitDialogComponent, {
            width: '90%',
            maxHeight: '70%',
            disableClose: true,
            data: data
        });
        this.awaitDialog.opened = true;

        this.awaitDialog.dialog.afterClosed().subscribe(c => {
            this.awaitDialog.opened = false;
        });

        this.awaitDialog.dialog.componentInstance.timeout.subscribe(t => {
            this.timedOut = true;
        });

        this.awaitDialog.dialog.componentInstance.linkClick.subscribe(t => {
            if (!this.signatureParams){
                return;
            }

            this.downloadSignatureFile(this.signatureParams);
        });
    }

    downloadSignatureFile(params){
        return new Promise(async (resolve, reject) => {
            try {

                let res = await <any>this.apiService.post_public('/signatureFile', params);
                let blob = new Blob( [JSON.stringify(res)], { type: "application/octet-stream"} );
                
                let fileReader = new FileReader();
                fileReader.onload = (evt) => {
                    let res = evt.target['result'];
                    return resolve(this.sanitizer.bypassSecurityTrustUrl(res));
                };
                fileReader.readAsDataURL(blob);
    
            } catch(err) {
                this.handleErrorResponse(err);
                console.error(err);
            }
        });
    }

    handleErrorResponse(err){
        let reason;
        if (err.reason == "validation"){
            reason = err.message;
        }

        if (!reason){
            reason = 'Server error occured';
        }

        if (!this.awaitDialog.opened){
            this.openDialog({
                action: null,
                params: null,
                contractHash: null,
                status: 'fail',
                failReason: reason
            });
        } else {
            this.awaitDialog.dialog.componentInstance.setFailed(err.message);
        }
    }
}
