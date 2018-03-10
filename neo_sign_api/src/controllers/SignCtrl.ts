import { Controller, Post, Get, Put, Delete, Required, BodyParams, Authenticated, Request, PathParams, Req, Res, Next } from "@tsed/common";
import * as express from "express";
import { Express } from "express";
import { BadRequest } from "ts-httpexceptions";
import { $log } from "ts-log-debug"
import * as Multer from "multer";
import { MultipartFile } from "@tsed/multipartfiles";
import * as crypto from 'crypto';
import { NeoService } from "../services/NeoService";

type MulterFile = Express.Multer.File;



@Controller("/")
export class SignCtrl {

    constructor(
        private neoService: NeoService
    ) {}

    @Get("/signature/:key")
    public async signature(
        @PathParams('key') key: string
    ): Promise<any> {
        let hash = await this.neoService.getStorage(key);

        if (hash) {
            return {
                status: 'success',
                hash: hash
            };
        }

        return {
            status: 'invalid'
        };
        
    }

    @Post("/signaturefile")
    public async signatureFile(
        @BodyParams('address') addressScriptHash: string,
        @BodyParams('title') title: string,
        @BodyParams('description') description: string,
        @BodyParams('firstname') firstname: string,
        @BodyParams('lastname') lastname: string,
        @BodyParams('filehash') fileHash: string,
        @Next() next: express.NextFunction,
        @Res() response: express.Response
    ): Promise<any> {

        let metaDataHash = this.getMetaDataHash(addressScriptHash, {
            title: title,
            description: description,
            firstname: firstname,
            lastname: lastname
        });

        let signatureHash = await this.neoService.singOnly(addressScriptHash, fileHash, metaDataHash);
        let docKeyHash    = await this.neoService.getDocKey(signatureHash, fileHash, metaDataHash);
        let docHash       = await this.neoService.getDoc(addressScriptHash, fileHash, metaDataHash);
        let timeStamp     = await this.neoService.getDocTimestamp(addressScriptHash, fileHash, signatureHash);

        let signatureFile = {
            key: docKeyHash,
            addressScriptHash: addressScriptHash,
            contractScriptHash: this.neoService.getContractAddress(),
            signatureHash: signatureHash,
            fileHash: fileHash,
            metaDataHash: metaDataHash,
            docHash: docHash,
            metaData: {
                title: title,
                description: description,
                firstname: firstname,
                lastname: lastname
            },
            timestamp: timeStamp
        };

        console.log(signatureFile);

        response.setHeader('Content-disposition', 'attachment; filename=signature.json');
        response.setHeader('Content-type', 'application/octet-stream');
        response.send(Buffer.from(JSON.stringify(signatureFile)));
        next();
    }

    @Post("/sign")
    public async sign(
        @MultipartFile() file: MulterFile,
        @Required() @BodyParams('address') address: string,
        @BodyParams('title') title: string,
        @BodyParams('description') description: string,
        @BodyParams('firstname') firstname: string,
        @BodyParams('lastname') lastname: string
    ): Promise<any> {
        let validAddress = await this.neoService.validateAddress(address);

        if (!validAddress) {
            throw(new BadRequest(JSON.stringify({
                status: "error",
                reason: "validation",
                message: "Invalid address provided"
            })));
        }

        let addressScriptHash = this.neoService.getAddressHashScript(address);
        let fileHash = crypto.createHash('sha256').update(file.buffer).update(addressScriptHash).digest('hex');

        let metaDataHash = this.getMetaDataHash(addressScriptHash, {
            title: title,
            description: description,
            firstname: firstname,
            lastname: lastname
        });
        
        let signatureHash = await this.neoService.singOnly(addressScriptHash, fileHash, metaDataHash);
        let dockKeyHash   = await this.neoService.getDocKey(addressScriptHash, fileHash, metaDataHash);

        return {
            status: 'success',
            key: dockKeyHash,
            fileHash: fileHash,
            signatureHash: signatureHash,
            address: addressScriptHash,
            contractHash: this.neoService.getContractAddress(),            
        };
    }

    @Post("/verify")
    public async verify(
        @MultipartFile() files: MulterFile[],
        @Required() @BodyParams('address') address: string
    ): Promise<any> {

        let file = null;
        let signatureFile = null;
        let validAddress = await this.neoService.validateAddress(address);
        
        if (!validAddress) {
            throw(new BadRequest(JSON.stringify({
                status: "error",
                reason: "validation",
                message: "Invalid address provided"
            })));
        }

        for (let f of files) {
            if (f.fieldname == 'file') {
                file = f;
            } else if (f.fieldname == 'signature') {
                signatureFile = f;
            }
        }
        
        if (signatureFile.mimetype !== 'application/json' && signatureFile.mimetype !== 'application/octet-stream') {
            return {status: 'invalid', message: 'Invalid signature file type'};
        }

        let signatureFileData = JSON.parse(signatureFile.buffer);
        let addressScriptHash = this.neoService.getAddressHashScript(address);

        let metaDataHash      = this.getMetaDataHash(addressScriptHash, signatureFileData.metaData);
        if (signatureFileData['metaDataHash'] !== metaDataHash) {
            return {status: 'invalid', message: 'metaDataHash does not match', data: signatureFileData};
        }

        let fileHash = crypto.createHash('sha256').update(file.buffer).update(addressScriptHash).digest('hex');
        if (signatureFileData['fileHash'] !== fileHash) {
            return {status: 'invalid', message: 'fileHash does not match', data: signatureFileData};
        }

        let signatureHash = await this.neoService.singOnly(addressScriptHash, fileHash, metaDataHash);
        if (signatureFileData['signatureHash'] !== signatureHash) {
            return {status: 'invalid', message: 'signatureHash does not match', data: signatureFileData};
        }

        let docKeyHash   = await this.neoService.getDocKey(signatureHash, fileHash, metaDataHash);
        if (signatureFileData['key'] !== docKeyHash) {
            return {status: 'invalid', message: 'key does not match', data: signatureFileData};
        }

        let docHash      = await this.neoService.getDoc(addressScriptHash, fileHash, metaDataHash);
        if (signatureFileData['docHash'] !== docHash) {
            return {status: 'invalid', message: 'docHash does not match', data: signatureFileData};
        }

        let timeStamp     = await this.neoService.getDocTimestamp(addressScriptHash, fileHash, signatureHash);
        if (signatureFileData['timestamp'] != timeStamp) {
            return {status: 'invalid', message: 'timeStamp does not match', data: signatureFileData};
        }

        return {status: 'valid', data: signatureFileData};
    }

    private getMetaDataHash(addressScriptHash:string, data: any) {
        if (!data) {
            return null;
        }

        let metaData: any = null;

        for (let key of Object.keys(data)) {
            if (!data[key]) {
                continue;
            }

            if (!metaData) {
                metaData = {};
            }

            metaData[key] = data[key];
        }

        if (metaData == null) {
            return null;
        }
        
        return crypto.createHash('sha256').update(addressScriptHash).update(JSON.stringify(metaData)).digest('hex');
    }

}