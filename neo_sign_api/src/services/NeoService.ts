import { Service, ServerSettingsService } from "@tsed/common";

import Neon, { rpc, sc, u } from '@cityofzion/neon-js'

@Service()
export class NeoService  {

    private contractAddress: string;
    private client: rpc.RPCClient;

    constructor(private serverSettings: ServerSettingsService) {
        let settings = <any>this.serverSettings.get('NeoService');

        this.contractAddress = settings.contractAddress;
        this.client = new rpc.RPCClient(settings.neoNodeUrl, settings.neoNodeVersion);
    }

    public async singOnly(address:string, fileHash:string, encodedMetadata:string) {
        let query = rpc.Query.invoke(this.getContractAddress(), 
            sc.ContractParam.string('signonly'),
            sc.ContractParam.array(
                sc.ContractParam.byteArray(address, null),
                sc.ContractParam.byteArray(fileHash, null),
                sc.ContractParam.byteArray(encodedMetadata, null)
            )
        );

        let result = await this.client.execute(query);
        return result.result.stack[0].value;
    }

    public async getDocKey(address:string, fileHash:string, encodedMetadata:string) {
        let paramArray: any;

        if (encodedMetadata == null) {
            paramArray = sc.ContractParam.array(
                sc.ContractParam.byteArray(address, null),
                sc.ContractParam.byteArray(fileHash, null),
            )
        } else {
            paramArray = sc.ContractParam.array(
                sc.ContractParam.byteArray(address, null),
                sc.ContractParam.byteArray(fileHash, null),
                sc.ContractParam.byteArray(encodedMetadata, null)
            )
        }

        let query = rpc.Query.invoke(this.getContractAddress(), 
            sc.ContractParam.string('getdockey'),
            paramArray
        );

        let result = await this.client.execute(query);
        return result.result.stack[0].value;
    }

    public async getDoc(address:string, fileHash:string, encodedMetadata:string) {
        let paramArray: any;

        if (encodedMetadata == null) {
            paramArray = sc.ContractParam.array(
                sc.ContractParam.byteArray(address, null),
                sc.ContractParam.byteArray(fileHash, null),
            )
        } else {
            paramArray = sc.ContractParam.array(
                sc.ContractParam.byteArray(address, null),
                sc.ContractParam.byteArray(fileHash, null),
                sc.ContractParam.byteArray(encodedMetadata, null)
            )
        }

        let query = rpc.Query.invoke(this.getContractAddress(), 
            sc.ContractParam.string('getdoc'),
            paramArray
        );

        let result = await this.client.execute(query);
        return result.result.stack[0].value;
    }

    public async getDocTimestamp(address:string, fileHash:string, encodedMetadata:string) {
        let paramArray: any;

        if (encodedMetadata == null) {
            paramArray = sc.ContractParam.array(
                sc.ContractParam.byteArray(address, null),
                sc.ContractParam.byteArray(fileHash, null),
            )
        } else {
            paramArray = sc.ContractParam.array(
                sc.ContractParam.byteArray(address, null),
                sc.ContractParam.byteArray(fileHash, null),
                sc.ContractParam.byteArray(encodedMetadata, null)
            )
        }

        let query = rpc.Query.invoke(this.getContractAddress(), 
            sc.ContractParam.string('getdoctimestamp'),
            paramArray
        );

        let result = await this.client.execute(query);

        if (result.result.stack[0].value) {

            return parseInt(u.reverseHex(result.result.stack[0].value), 16);
        }

        return null;
    }

    public async getStorage(key:string) {
        let query = Neon.create.query({id: 1, method: 'getstorage', params: [this.getContractAddress(), key]});
        let result = await this.client.execute(query);

        return result.result;
    }

    public getAddressHashScript(address: string) {
        return (<any>sc.ContractParam.byteArray(address, 'address')).value;
    }

    public async validateAddress(address: string) {
        return await this.client.validateAddress(address);
    }

    public getContractAddress(): string {
        return this.contractAddress;
    }
}