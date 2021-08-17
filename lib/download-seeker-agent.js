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
const child_process_1 = __importDefault(require("child_process"));
const supportedTechnologies = [
    'JAVA',
    'DOTNETCORE',
    'DOTNET',
    'NODEJS',
    'PHP',
    'GO',
    'PYTHON'
];
function getOSFamily() {
    if (process.platform === "linux")
        return "LINUX";
    if (process.platform === "win32")
        return "WINDOWS";
    if (process.platform === "darwin")
        return "MAC";
    return "UNKNOWN";
}
async function run() {
    try {
        core.info('Downloading Seeker agent from Seeker Server');
        const seekerServerURL = utils_1.getInputOrEnvironmentVariable('seekerServerUrl', 'SEEKER_SERVER_URL');
        const seekerProjectKey = utils_1.getInputOrEnvironmentVariable('seekerProjectKey', 'SEEKER_PROJECT_KEY');
        const technology = core.getInput('technology');
        const osFamily = getOSFamily();
        core.info(`Seeker Server URL: ${seekerServerURL}`);
        core.info(`Seeker Project Key: ${seekerProjectKey}`);
        core.info(`Technology: ${technology}`);
        if (!seekerServerURL) {
            core.setFailed("The Seeker Server URL must be provided with the seekerServerURL input or via the SEEKER_SERVER_URL environment variable.");
        }
        if (!seekerProjectKey) {
            core.setFailed("The Seeker Project Key must be provided with the seekerProjectKey input or via the SEEKER_SERVER_URL environment variable.");
        }
        if (!technology) {
            core.setFailed("The Seeker agent technology must be specified via the technology input.");
        }
        else if (!supportedTechnologies.includes(technology)) {
            core.setFailed(`The requested technology: ${technology} is not one of the supported technologies: ${supportedTechnologies.join(',')}`);
        }
        try {
            const url = `${seekerServerURL}/rest/api/latest/installers/agents/scripts/${technology}?projectKey=${seekerProjectKey}&downloadWith=curl&osFamily=${osFamily}&flavor=DEFAULT`;
            core.info(`Downloading Seeker agent from URL: ${url}`);
            const res = await axios_1.default.get(url);
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