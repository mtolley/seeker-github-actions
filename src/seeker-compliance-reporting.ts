// seeker-compliance-reporting
// ///////////////////////////
//
// This action encapsulates the seeker-compliance-report and check-seeker-compliance
// actions. It checks Seeker Policy compliance and depending on the input values
// will do one or both of the following:
//
// * Generate the Compliance Report PDF and upload it as a build artefact.
// * Fail the build if the specified project is not in compliance.

import * as core from '@actions/core'
import { checkComplianceStatus, generateSeekerComplianceReportPDF, getInputOrEnvironmentVariable } from './utils'

async function run(): Promise<void> {
  try {
    core.info('🔽 Downloading Seeker compliance report from the Seeker Server')

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

    const generateComplianceReportPDFInput = core.getBooleanInput('generateComplianceReportPDF')
    const failBuildIfNotInCompliance = core.getBooleanInput('failBuildIfNotInCompliance')

    core.info('one')
    if (generateComplianceReportPDFInput) {
      core.info('one')
      await generateSeekerComplianceReportPDF({
        seekerServerURL,
        seekerProjectKey,
        seekerAPIToken
      })
    }

    await checkComplianceStatus({
      seekerServerURL,
      seekerProjectKey,
      seekerAPIToken,
      failBuildIfNotInCompliance
    })   
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
