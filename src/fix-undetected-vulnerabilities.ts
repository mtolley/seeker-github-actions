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
import axios from 'axios'
import {getInputOrEnvironmentVariable, getSeekerVulnerabilities} from './utils'
import * as querystring from 'querystring'

async function run(): Promise<void> {
  try {
    core.info('ℹ️ Exporting newly-detected vulnerabilities that match certain criteria')
    
    // Get the action inputs (or environment variables)
    const seekerServerURL = getInputOrEnvironmentVariable(
      'seekerServerUrl',
      'SEEKER_SERVER_URL',
      true // required 
    )
    const seekerProjectKey = getInputOrEnvironmentVariable(
      'seekerProjectKey',
      'SEEKER_PROJECT_KEY',
      true // required
    )
    const seekerAPIToken = getInputOrEnvironmentVariable(
      'seekerAPIToken',
      'SEEKER_API_TOKEN',
      true // required
    )
    const seekerProjectVersion = getInputOrEnvironmentVariable(
      'seekerProjectVersion',
      'SEEKER_PROJECT_VERSION',
      true // required
    )
    const closeFixedIssues = core.getBooleanInput('closeFixedIssues')
    const gitHubToken = getInputOrEnvironmentVariable(
      'gitHubToken',
      'GITHUB_TOKEN',
      false // only required if closeFixedIssues is set to true
    )

    // Download all the vulnerabilities for the project that are currently still in the 
    // DETECTED state in the Seeker server.
    let vulns = await getSeekerVulnerabilities({
      seekerServerURL,
      seekerProjectKey,
      seekerAPIToken,
      statuses: "DETECTED"
    })

    // Identify only the vulnerabilities that were NOT detected during the most recent test run
    vulns = vulns.filter(v => v.LatestVersion !== seekerProjectVersion)

    if (vulns.length > 0) {
      core.info('👏 Vulnerabilities identified that have not been detected in the current version. The status for these vulnerabilities will be set to FIXED automatically.')
      for (const v of vulns) {
        core.info(v.ItemKey)
      }
    
      const bulkUpdate = {
        vulnerabilityKeys: vulns.map(v => v.ItemKey).join(','),
        status: 'FIXED',
        comment: `Automatically setting status to FIXED as this defect was NOT detected during testing for version ${seekerProjectVersion}`
      }

      const url = `${seekerServerURL}/rest/api/latest/vulnerabilities/triage/bulk`
      try {
        axios({
          method: 'post',
          url,
          data: querystring.stringify(bulkUpdate),
          headers: {
            Authorization: seekerAPIToken,
            'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
          }
        })
      } catch(error) {
        if (error.response) {
          core.error(`Seeker Server responded with error code: ${error.response.status}`)
          core.error(`Error message: ${error.response.data.message}`)
        } else {
          core.error("No response from Seeker Server")
          core.error(error)
        }
        return
      }

      if (closeFixedIssues) {
        // It's easier to use the GitHub API directly to close the issue
        const octokit = github.getOctokit(gitHubToken)
      
        const ownerSlashRepo = process.env.GITHUB_REPOSITORY as string 
        const [owner, repo] = ownerSlashRepo.split('/')

        const workflow = process.env['GITHUB_WORKFLOW'] as string
        const runNumber = process.env['GITHUB_RUN_NUMBER'] as string
        const commit = process.env['GITHUB_SHA'] as string
        
        for (const v of vulns) {
          if (v.ticketUrls) {
            const issue_number = v.ticketUrls.substr(v.ticketUrls.lastIndexOf('/')+1)
            
            let response = await octokit.request(`PATCH ${v.ticketUrls}`, {
              owner: 'octocat',
              repo: 'hello-world',
              issue_number: 42,
              state: 'closed'
            })

            if (response.status !== 200) {
              core.error(`PATCH response: ${response.status}`)
              core.error(response.toString())
            }

            response = await octokit.request(`POST ${v.ticketUrls}/comments`, {
              owner,
              repo,
              issue_number,
              body: `Issue automatically closed fix-undetected-vulnerabilities in workflow: ${workflow} run number: ${runNumber} for commit: ${commit} because this vulnerabilty was not detected during the latest test run.`
            })
            core.info(response.toString())

            // Then add a comment
            // await axios({
            //   method: 'post',
            //   url: v.ticketUrls,
            //   data: querystring.stringify({ state : "closed" }),
            //   headers: {
            //     Authorization: seekerAPIToken,
            //     'content-type': 'application/x-www-form-urlencoded;charset=utf-8'
            //   }           
            // }) 
          }
        }
      }
    } else {
      core.info('No DETECTED vulnerabilities were identified as FIXED (non detected) for this version.')
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
