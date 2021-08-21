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

import * as core from '@actions/core'
import * as github from '@actions/github'
import {getInputOrEnvironmentVariable} from './utils'


async function run(): Promise<void> {
  try {
    core.info('ℹ️ ?Checking for vulnerabilties that may have been fixed in this commit.')
    
    // Get the action inputs (or environment variables)

    const gitHubToken = getInputOrEnvironmentVariable(
      'gitHubToken',
      'GITHUB_TOKEN',
      false // only required if closeFixedIssues is set to true
    )

    const octokit = github.getOctokit(gitHubToken) 
    const ownerSlashRepo = process.env.GITHUB_REPOSITORY as string 
    const [owner, repo] = ownerSlashRepo.split('/')
    //    'https://github.com/mtolley/hippotech-front-seeker-actions/issues/9'
    core.info('one')
    const response = await octokit.rest.issues.createComment({
      owner,
      repo,
      issue_number: parseInt("9"),
      body: 'Hello universe!'
    })
    core.info(response.toString())
    core.info('two')
  } catch(e) {
    core.info(e.toString())
  }
}

run()
