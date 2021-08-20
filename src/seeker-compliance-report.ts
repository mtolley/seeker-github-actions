// seeker-compliance-report
// ////////////////////////
//
// Downloads the Seeker Compliance report for the specified project and uploads
// it to the workflow results as a build artefact.

import * as core from '@actions/core'
import {generateSeekerComplianceReportPDF, getInputOrEnvironmentVariable, uploadSeekerComplianceReport} from './utils'

async function run(): Promise<void> {
  try {
    core.info('🔽 Downloading Seeker compliance report from the Seeker Server')

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

    // Generate and upload the Seeker Compliance report
    await generateSeekerComplianceReportPDF({
      seekerServerURL,
      seekerProjectKey,
      seekerAPIToken
    })
    await uploadSeekerComplianceReport()
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
