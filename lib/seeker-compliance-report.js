"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const utils_1 = require("./utils");
// import axios, { AxiosResponse } from 'axios'
// import { writeFileSync } from 'fs'
async function run() {
    try {
        core.info('Downloading Seeker compliance report from the Seeker Server');
        const seekerServerURL = utils_1.getInputOrEnvironmentVariable('seekerServerUrl', 'SEEKER_SERVER_URL', true // required 
        );
        const seekerProjectKey = utils_1.getInputOrEnvironmentVariable('seekerProjectKey', 'SEEKER_PROJECT_KEY', true // required
        );
        const seekerAPIToken = utils_1.getInputOrEnvironmentVariable('seekerAPIToken', 'SEEKER_API_TOKEN', true // required
        );
        // let res: AxiosResponse
        // const url = `${seekerServerURL}/rest/api/latest/reports/compliances/export?projectKeys=${seekerProjectKey}`
        // try {
        //   res = await axios.get(url, {
        //     responseType: 'arraybuffer',
        //     headers: {
        //       Authorization: seekerAPIToken,
        //       Accept: 'application/pdf'
        //     }
        //   })
        // } catch(error) {
        //   if (error.response) {
        //     core.error(`Seeker Server responded with error code: ${error.response.status}`)
        //     core.error(`Error message: ${error.response.data.message}`)
        //   } else {
        //     core.error("No response from Seeker Server")
        //     core.error(error)
        //   }
        //   return
        // }  
        // writeFileSync('seeker-compliance-report.pdf', res.data)  
        await utils_1.generateSeekerComplianceReportPDF({
            seekerServerURL,
            seekerProjectKey,
            seekerAPIToken
        });
        await utils_1.uploadSeekerComplianceReport();
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=seeker-compliance-report.js.map