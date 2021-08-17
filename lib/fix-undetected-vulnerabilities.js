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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("./utils");
//import axios, { AxiosError, AxiosResponse } from 'axios'
const querystring = __importStar(require("querystring"));
async function run() {
    try {
        core.info('Exporting newly-detected vulnerabilities that match certain criteria');
        const seekerServerURL = utils_1.getInputOrEnvironmentVariable('seekerServerUrl', 'SEEKER_SERVER_URL');
        const seekerProjectKey = utils_1.getInputOrEnvironmentVariable('seekerProjectKey', 'SEEKER_PROJECT_KEY');
        const seekerAPIToken = utils_1.getInputOrEnvironmentVariable('seekerAPIToken', 'SEEKER_API_TOKEN');
        const seekerProjectVersion = utils_1.getInputOrEnvironmentVariable('seekerProjectVersion', 'SEEKER_PROJECT_VERSION');
        core.info(`Seeker Server URL: ${seekerServerURL}`);
        core.info(`Seeker Project Key: ${seekerProjectKey}`);
        if (!seekerServerURL) {
            core.setFailed("The Seeker Server URL must be provided with the seekerServerURL input or via the SEEKER_SERVER_URL environment variable.");
        }
        if (!seekerProjectKey) {
            core.setFailed("The Seeker Project Key must be provided with the seekerProjectKey input or via the SEEKER_PROJECT_KEY environment variable.");
        }
        if (!seekerAPIToken) {
            core.setFailed("The Seeker API Token must be provided with the seekerAPIToken input. You should store your Seeker API Token securely as an ecrypted secret.");
        }
        if (!seekerProjectVersion) {
            core.setFailed("The Seeker Project Version must be specified with the seekerProjectVersion input or via the SEEKER_PROJECT_VERSION environment varaible.");
        }
        let vulns = await utils_1.getSeekerVulnerabilities({
            seekerServerURL,
            seekerProjectKey,
            seekerAPIToken,
            statuses: "DETECTED"
        });
        // Identify the vulnerabilities that were not detected during the most recent test run
        vulns = vulns.filter(v => v.LatestVersion !== seekerProjectVersion);
        if (vulns.length > 0) {
            core.info('Vulnerabilities identified that have not been detected in the current version');
            for (const v of vulns) {
                core.info(v.ItemKey);
            }
            // And set their status to FIXED automatically.
            const bulkUpdate = {
                vulnerabilityKeys: vulns.map(v => v.ItemKey).join(','),
                status: 'FIXED',
                comment: `Automatically setting status to FIXED as this defect was NOT detected during testing for version ${seekerProjectVersion}`
            };
            const url = `${seekerServerURL}/rest/api/latest/vulnerabilities/triage/bulk`;
            try {
                axios_1.default({
                    method: 'post',
                    url,
                    data: querystring.stringify(bulkUpdate),
                    headers: {
                        Authorization: seekerAPIToken,
                        'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
                    }
                });
            }
            catch (error) {
                if (error.response) {
                    core.error(`Seeker Server responded with error code: ${error.response.status}`);
                    core.error(`Error message: ${error.response.data.message}`);
                }
                else {
                    core.error("No response from Seeker Server");
                    core.error(error);
                }
                return;
            }
        }
        else {
            core.info('No DETECTED vulnerabilities were identified as FIXED (non detected) for this version.');
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=fix-undetected-vulnerabilities.js.map