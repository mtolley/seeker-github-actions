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
const utils_1 = require("./utils");
const axios_1 = __importDefault(require("axios"));
async function run() {
    try {
        core.info('Downloading Seeker agent from Seeker Server');
        const seekerServerURL = utils_1.getInputOrEnvironmentVariable('seekerServerUrl', 'SEEKER_SERVER_URL');
        const seekerProjectKey = utils_1.getInputOrEnvironmentVariable('seekerProjectKey', 'SEEKER_PROJECT_KEY');
        const seekerAPIToken = utils_1.getInputOrEnvironmentVariable('seekerAPIToken', 'SEEKER_API_TOKEN');
        const failBuildIfNotInCompliance = core.getBooleanInput('failBuildIfNotInCompliance');
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
        const url = `${seekerServerURL}/rest/api/latest/projects/${seekerProjectKey}/status`;
        let res;
        try {
            res = await axios_1.default.get(url, {
                headers: {
                    Authorization: seekerAPIToken
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
        if (res.data.projectStatus.compliant === false) {
            const message = `Seeker Project ${seekerProjectKey} is not in compliance. Please see Compliance Report for more details.`;
            if (failBuildIfNotInCompliance) {
                core.setFailed(message);
            }
            else {
                core.warning(message);
            }
        }
        else {
            core.info(`Seeker Project ${seekerProjectKey} is in compliance.`);
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=check-seeker-compliance.js.map