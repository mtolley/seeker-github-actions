import * as core from '@actions/core'
import {getInputOrEnvironmentVariable, checkComplianceStatus} from './utils'

async function run(): Promise<void> {
  try {
    core.info('Checking Seeker Compliance Policy status')
    
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
