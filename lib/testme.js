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
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const utils_1 = require("./utils");
async function run() {
    try {
        core.info('ℹ️ ?Checking for vulnerabilties that may have been fixed in this commit.');
        // Get the action inputs (or environment variables)
        const gitHubToken = utils_1.getInputOrEnvironmentVariable('gitHubToken', 'GITHUB_TOKEN', false // only required if closeFixedIssues is set to true
        );
        const octokit = github.getOctokit(gitHubToken);
        const ownerSlashRepo = process.env.GITHUB_REPOSITORY;
        const [owner, repo] = ownerSlashRepo.split('/');
        //    'https://github.com/mtolley/hippotech-front-seeker-actions/issues/9'
        core.info('one');
        const response = await octokit.rest.issues.createComment({
            owner,
            repo,
            issue_number: parseInt("9"),
            body: 'Hello universe!'
        });
        core.info(response.toString());
        core.info('two');
    }
    catch (e) {
        core.info(e.toString());
    }
}
run();
//# sourceMappingURL=testme.js.map