// list-seeker-vulnerabilities
// ///////////////////////////
// 
// Lists vulnerabilities from the Seeker server apply these filters:
//
// * Project key
// * (Optional) Project version
// * (Optional) Only Seeker-Verified vulnerabilities
// * (Optional) Statuses (defaults to DETECTED)
// * (Optional) Minimum Severity
//
// The default use case for list-seeker-vulnerabilities is to output a list of
// currently detected vulnerabilities for the specified project.

import * as core from '@actions/core'
import {getInputOrEnvironmentVariable, getSeekerVulnerabilities} from './utils'

async function run(): Promise<void> {
  try {
    core.info('Downloading Vulnerabilities from the Seeker server...')
    
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
      false // optional, as versioning might not be available for this project
    )

    const onlySeekerVerified = core.getBooleanInput('onlySeekerVerified')
    const statuses = core.getInput('statuses') || "DETECTED"
    const minSeverity = core.getInput('minSeverity') || ""
    
    if (minSeverity) {
      if (minSeverity !== 'CRITICAL' && 
          minSeverity !== 'HIGH' && 
          minSeverity !== 'MEDIUM' &&
          minSeverity !== 'LOW' &&
          minSeverity !== 'INFORMATIVE') {
            core.error(`Invalid value for minSeverity provided: ${minSeverity}. Permitted values are CRITICAL, HIGH, MEDIUM, LOW, and INFORMATIVE`)
          }
    }

    const vulns = await getSeekerVulnerabilities({
      seekerServerURL,
      seekerProjectKey,
      seekerAPIToken,
      statuses,
      onlySeekerVerified,
      minSeverity,
      seekerProjectVersion
    })

    for (const v of vulns) {
      core.warning(`Seeker Vulnerability ${v.ItemKey} ${v.VulnerabilityName} URL: ${v.URL} ${v.SeekerServerLink}`)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
