import { ServerLoader, ServerSettings, GlobalAcceptMimesMiddleware, AuthenticatedMiddleware } from "@tsed/common";
import { $log } from "ts-log-debug";
import { GlobalErrorHandlerMiddleware } from './middlewares/GlobalErrorHandlerMiddleware';
import { AuthMiddleware } from './middlewares/AuthMiddleware';
import * as Multer from "multer";
import "@tsed/multipartfiles";

import Path = require("path");
const rootDir = Path.resolve(__dirname);

@ServerSettings({
    rootDir, // optional. By default it's equal to process.cwd()
    acceptMimes: ["application/json"],
    httpPort: 3000,
    httpsPort: 3080,
    debug: false,
    uploadDir: `${rootDir}/uploads`,
    mount: {
        '/api': `${rootDir}/controllers/**/**.js`
    },
    componentsScan: [
        `${rootDir}/services/**/**.js`,
        `${rootDir}/middlewares/**/**.js`
    ],
    multer: {
        storage: Multer.memoryStorage(),
        // limits: {
        //     fieldSize: 4096,
        //     files: 2
        // }
    },
    NeoService: {
        contractAddress: process.env.CONTRACT_ADDRESS,
        neoNodeUrl: process.env.NEO_NODE_URL,
        neoNodeVersion: process.env.NEO_NODE_VERSION
    }
})
export class Server extends ServerLoader {

    /**
     * This method let you configure the middleware required by your application to works.
     * @returns {Server}
     */
    public $onMountingMiddlewares(): void | Promise<any> {

        const cookieParser = require('cookie-parser'),
            bodyParser = require('body-parser'),
            compress = require('compression'),
            methodOverride = require('method-override'),
            morgan = require('morgan'),
            cors = require('cors');

        this.use(morgan('dev'))
            .use(cors())
            .use(GlobalAcceptMimesMiddleware)
            .use(cookieParser())
            .use(compress({}))
            .use(methodOverride())
            .use(bodyParser.json())
            .use(bodyParser.urlencoded({
                extended: true
            }));

        return null;
    }

    public $afterRoutesInit() {
        this.use(GlobalErrorHandlerMiddleware);
    }

    public $onReady() {
        $log.info('Server started...');
    }

    public $onServerInitError(err) {
        $log.error(err);
    }
}

