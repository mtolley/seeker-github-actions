import * as core from '@actions/core'
import { generateSeekerComplianceReportPDF, getInputOrEnvironmentVariable } from './utils'
// import axios, { AxiosResponse } from 'axios'

// interface Status {
//   projectStatus: {
//     compliant: boolean
//   }
// }

async function run(): Promise<void> {
  try {
    core.info('Downloading Seeker compliance report from the Seeker Server')

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

   // const generateComplianceReportPDF = core.getBooleanInput('generateComplianceReportPDF')
   // const failBuildIfNotInCompliance = core.getBooleanInput('generateComplianceReportPDF')

    await generateSeekerComplianceReportPDF({
      seekerServerURL,
      seekerProjectKey,
      seekerAPIToken
    })
    
    
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
