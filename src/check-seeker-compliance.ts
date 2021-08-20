// check-seeker-compliance.ts
// //////////////////////////
//
// Calls the Seeker API for the specified project to determine whether that
// project is currently in compliance with any assigned Compliance Policies
// or not. The Compliance status is written to the action output. Optionally,
// if failBuildIfNotInCompliance is true, the action will fail.

import * as core from '@actions/core'
import {getInputOrEnvironmentVariable, checkComplianceStatus} from './utils'

async function run(): Promise<void> {
  try {
    core.info('ℹ️ Checking Seeker Compliance Policy status')
    
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
    const failBuildIfNotInCompliance = core.getBooleanInput('failBuildIfNotInCompliance')
    
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
