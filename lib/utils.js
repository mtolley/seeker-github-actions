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
exports.uploadSeekerComplianceReport = exports.getSeekerVulnerabilities = exports.generateSeekerComplianceReportPDF = exports.checkComplianceStatus = exports.handleAxiosError = exports.getInputOrEnvironmentVariableBoolean = exports.getInputOrEnvironmentVariable = void 0;
const core = __importStar(require("@actions/core"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const artifact = __importStar(require("@actions/artifact"));
function getInputOrEnvironmentVariable(inputName, envVar, required = true) {
    const result = core.getInput(inputName) || process.env[envVar] || "";
    if (required && !result) {
        core.setFailed(`You must provide either the input parameter ${inputName} or environment variable ${envVar}`);
    }
    return result;
}
exports.getInputOrEnvironmentVariable = getInputOrEnvironmentVariable;
function getInputOrEnvironmentVariableBoolean(inputName, envVar) {
    const value = core.getInput(inputName) || process.env[envVar] || "";
    return value.toUpperCase() === 'TRUE';
}
exports.getInputOrEnvironmentVariableBoolean = getInputOrEnvironmentVariableBoolean;
function handleAxiosError(error) {
    if (error.response) {
        core.error(`Seeker Server responded with error code: ${error.response.status}`);
        core.error(`Error message: ${error.response.data.message}`);
    }
    else {
        core.error("No response from Seeker Server");
        core.error(error);
    }
}
exports.handleAxiosError = handleAxiosError;
async function checkComplianceStatus({ seekerServerURL, seekerProjectKey, seekerAPIToken, failBuildIfNotInCompliance }) {
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
        return false;
    }
    if (failBuildIfNotInCompliance && res.data.projectStatus.compliant === false) {
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
    return res.data.projectStatus.compliant;
}
exports.checkComplianceStatus = checkComplianceStatus;
async function generateSeekerComplianceReportPDF({ seekerServerURL, seekerProjectKey, seekerAPIToken, }) {
    let res;
    const url = `${seekerServerURL}/rest/api/latest/reports/compliances/export?projectKeys=${seekerProjectKey}`;
    try {
        res = await axios_1.default.get(url, {
            responseType: 'arraybuffer',
            headers: {
                Authorization: seekerAPIToken,
                Accept: 'application/pdf'
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
    fs_1.writeFileSync('seeker-compliance-report.pdf', res.data);
}
exports.generateSeekerComplianceReportPDF = generateSeekerComplianceReportPDF;
async function getSeekerVulnerabilities({ seekerServerURL, seekerProjectKey, seekerProjectVersion, seekerAPIToken, onlySeekerVerified, minSeverity, statuses }) {
    // Every request to the Vulnerabilities API needs the Seeker Server URL, the Project key, and the API token
    let url = `${seekerServerURL}/rest/api/latest/vulnerabilities?format=JSON&language=en&projectKeys=${seekerProjectKey}&includeHttpHeaders=false&includeHttpParams=false&includeDescription=false&includeRemediation=false&includeSummary=false&includeVerificationProof=false&includeTriageEvents=false&includeComments=false`;
    // Only add these filters to the URL if they are actually specified
    if (onlySeekerVerified === true) {
        url += '&onlySeekerVerified=true';
    }
    if (minSeverity) {
        url += `&minSeverity=${minSeverity}`;
    }
    if (statuses) {
        url += `&statuses=${statuses}`;
    }
    if (seekerProjectVersion) {
        url += `&projectVersions=${seekerProjectVersion}`;
    }
    core.info(`Downloading Seeker vulnerabilities matching specified criteria from: ${url}`);
    let res;
    try {
        res = await axios_1.default.get(url, {
            headers: {
                Authorization: seekerAPIToken
            }
        });
    }
    catch (error) {
        handleAxiosError(error);
        return [];
    }
    return res.data;
}
exports.getSeekerVulnerabilities = getSeekerVulnerabilities;
async function uploadSeekerComplianceReport() {
    core.info('Uploading the Seeker Compliance Report PDF as a build artefact');
    const artifactClient = artifact.create();
    const artifactName = 'seeker-compliance-report';
    const files = [
        'seeker-compliance-report.pdf'
    ];
    const rootDirectory = process.cwd();
    const options = {
        continueOnError: true
    };
    await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options);
}
exports.uploadSeekerComplianceReport = uploadSeekerComplianceReport;
//# sourceMappingURL=utils.js.map