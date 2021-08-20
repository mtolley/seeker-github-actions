"use strict";
// download-seeker-agent.ts
// ////////////////////////
//
// Downloads the Seeker agent installer script from the Seeker API and
// runs it. This will download the agent binary itself and display instructions
// for using it in the build output.
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
const child_process_1 = __importDefault(require("child_process"));
async function run() {
    try {
        core.info('Downloading Seeker agent from Seeker Server');
        // Get the action inputs (or environment variables)
        const seekerServerURL = utils_1.getInputOrEnvironmentVariable('seekerServerUrl', 'SEEKER_SERVER_URL', true // required 
        );
        const seekerProjectKey = utils_1.getInputOrEnvironmentVariable('seekerProjectKey', 'SEEKER_PROJECT_KEY', true // required
        );
        const technology = core.getInput('technology', { required: true });
        const osFamily = core.getInput('osFamily', { required: true });
        try {
            // First download the installer script from the Seeker server
            const url = `${seekerServerURL}/rest/api/latest/installers/agents/scripts/${technology}?projectKey=${seekerProjectKey}&downloadWith=curl&osFamily=${osFamily}&flavor=DEFAULT`;
            core.info(`Downloading Seeker agent from URL: ${url}`);
            const res = await axios_1.default.get(url);
            // Then execute the installer script and echo any output. 
            const commandResult = child_process_1.default.execSync(res.data.toString());
            core.info(commandResult.toString());
        }
        catch (error) {
            if (error.response) {
                core.error(`Seeker Server responded with error code: ${error.response.status}`);
                core.error(`Error message: ${error.response.data.message}`);
            }
            else {
                core.error("No response from Seeker Server");
            }
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=download-seeker-agent.js.map