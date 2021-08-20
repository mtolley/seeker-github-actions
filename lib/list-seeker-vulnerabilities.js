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
async function run() {
    try {
        core.info('Downloading Vulnerabilities from the Seeker server...');
        // Get the action inputs (or environment variables)
        const seekerServerURL = utils_1.getInputOrEnvironmentVariable('seekerServerUrl', 'SEEKER_SERVER_URL', true // required 
        );
        const seekerProjectKey = utils_1.getInputOrEnvironmentVariable('seekerProjectKey', 'SEEKER_PROJECT_KEY', true // required
        );
        const seekerAPIToken = utils_1.getInputOrEnvironmentVariable('seekerAPIToken', 'SEEKER_API_TOKEN', true // required
        );
        const seekerProjectVersion = utils_1.getInputOrEnvironmentVariable('seekerProjectVersion', 'SEEKER_PROJECT_VERSION', false // optional, as versioning might not be available for this project
        );
        const onlySeekerVerified = core.getBooleanInput('onlySeekerVerified');
        const statuses = core.getInput('statuses') || "DETECTED";
        const minSeverity = core.getInput('minSeverity') || "";
        if (minSeverity) {
            if (minSeverity !== 'CRITICAL' &&
                minSeverity !== 'HIGH' &&
                minSeverity !== 'MEDIUM' &&
                minSeverity !== 'LOW' &&
                minSeverity !== 'INFORMATIVE') {
                core.error(`Invalid value for minSeverity provided: ${minSeverity}. Permitted values are CRITICAL, HIGH, MEDIUM, LOW, and INFORMATIVE`);
            }
        }
        const vulns = await utils_1.getSeekerVulnerabilities({
            seekerServerURL,
            seekerProjectKey,
            seekerAPIToken,
            statuses,
            onlySeekerVerified,
            minSeverity,
            seekerProjectVersion
        });
        // let url = `${seekerServerURL}/rest/api/latest/vulnerabilities?format=JSON&language=en&projectKeys=${seekerProjectKey}&includeHttpHeaders=false&includeHttpParams=false&includeDescription=false&includeRemediation=false&includeSummary=false&includeVerificationProof=false&includeTriageEvents=false&includeComments=false`
        // if (onlySeekerVerified.toLowerCase() === 'true') {
        //   url += '&onlySeekerVerified=true'
        // }
        // if (minSeverity) {
        //   url += `&minSeverity=${minSeverity}`
        // }
        // if (statuses) {
        //   url += `&statuses=${statuses}`
        // }
        // core.info(url)
        // core.info(`Downloading Seeker vulnerabilities matching specified criteria from: ${url}`) 
        // let res: AxiosResponse<Vulnerability[]>
        // try {
        //   res = await axios.get(url, {
        //     headers: {
        //       Authorization: seekerAPIToken
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
        // const vulns: Vulnerability[] = res.data
        for (const v of vulns) {
            core.warning(`Seeker Vulnerability ${v.ItemKey} ${v.VulnerabilityName} ${v.URL}`);
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=list-seeker-vulnerabilities.js.map