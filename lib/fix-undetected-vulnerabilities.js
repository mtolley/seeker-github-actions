"use strict";
// fix-undetected-vulnerabilities
// //////////////////////////////
//
// Search for any vulnerabilities in the project that currently have a status of 
// DETECTED but which were not detected during testing of the specified version of
// the project. If any such vulnerabilties are found, set the Status to FIXED.
//
// Version detection must be enable for the project or project template in Seeker
// and the current version must be specified as an input to this action (or via
// the environment variable SEEKER_PROJECT_VERSION).
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
const github = __importStar(require("@actions/github"));
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("./utils");
const querystring = __importStar(require("querystring"));
async function run() {
    try {
        core.info('ℹ️ ?Checking for vulnerabilties that may have been fixed in this commit.');
        // Get the action inputs (or environment variables)
        const seekerServerURL = utils_1.getInputOrEnvironmentVariable('seekerServerUrl', 'SEEKER_SERVER_URL', true // required 
        );
        const seekerProjectKey = utils_1.getInputOrEnvironmentVariable('seekerProjectKey', 'SEEKER_PROJECT_KEY', true // required
        );
        const seekerAPIToken = utils_1.getInputOrEnvironmentVariable('seekerAPIToken', 'SEEKER_API_TOKEN', true // required
        );
        const seekerProjectVersion = utils_1.getInputOrEnvironmentVariable('seekerProjectVersion', 'SEEKER_PROJECT_VERSION', true // required
        );
        const closeFixedIssues = core.getBooleanInput('closeFixedIssues');
        const gitHubToken = utils_1.getInputOrEnvironmentVariable('gitHubToken', 'GITHUB_TOKEN', false // only required if closeFixedIssues is set to true
        );
        ////
        ////
        // const octokit = github.getOctokit(gitHubToken) 
        // const ownerSlashRepo = process.env.GITHUB_REPOSITORY as string 
        // const [owner, repo] = ownerSlashRepo.split('/')
        // //    'https://github.com/mtolley/hippotech-front-seeker-actions/issues/9'
        // core.info('one')
        // const response = await octokit.rest.issues.createComment({
        //   owner,
        //   repo,
        //   issue_number: parseInt("9"),
        //   body: 'Hello universe!'
        // })
        // core.info(response.toString())
        // core.info('two')
        ////
        ////
        // Download all the vulnerabilities for the project that are currently still in the 
        // DETECTED state in the Seeker server.
        let vulns = await utils_1.getSeekerVulnerabilities({
            seekerServerURL,
            seekerProjectKey,
            seekerAPIToken,
            statuses: "DETECTED"
        });
        // Identify only the vulnerabilities that were NOT detected during the most recent test run
        vulns = vulns.filter(v => v.LatestVersion !== seekerProjectVersion);
        if (vulns.length > 0) {
            core.info('👏 Vulnerabilities identified that have not been detected in the current version. The status for these vulnerabilities will be set to FIXED automatically.');
            for (const v of vulns) {
                core.info(v.ItemKey);
            }
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
            if (closeFixedIssues) {
                core.info('xxx');
                // // It's easier to use the GitHub API directly to close the issue
                const octokit = github.getOctokit(gitHubToken);
                const context = github.context;
                const commit = process.env['GITHUB_SHA'];
                for (const v of vulns) {
                    if (v.ticketUrls) {
                        const issue_number = parseInt(v.ticketUrls.substr(v.ticketUrls.lastIndexOf('/') + 1));
                        const createCommentResponse = await octokit.rest.issues.createComment({
                            ...context.repo,
                            issue_number,
                            body: `Issue automatically closed fix-undetected-vulnerabilities in workflow: ${context.workflow} run number: ${context.runNumber} for commit: ${commit} because this vulnerabilty was not detected during the latest test run.`
                        });
                        core.info(createCommentResponse.status.toString());
                        const updateIssueResponse = await octokit.rest.issues.update({
                            ...context.repo,
                            issue_number,
                            state: 'closed'
                        });
                        core.info(updateIssueResponse.status.toString());
                    }
                }
            }
        }
        else {
            core.info('ℹ️ No DETECTED vulnerabilities were identified as FIXED (non detected) for this version.');
        }
    }
    catch (error) {
        core.setFailed(error.message);
    }
}
run();
//# sourceMappingURL=fix-undetected-vulnerabilities.js.map