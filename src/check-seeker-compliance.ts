import * as core from '@actions/core'
import {getInputOrEnvironmentVariable} from './utils'
import axios, { AxiosResponse } from 'axios'

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
    
    const complianceStatus = await getComplianceStatus({
      seekerServerURL,
      seekerProjectKey,
      seekerAPIToken
    })

    /*
    const url = `${seekerServerURL}/rest/api/latest/projects/${seekerProjectKey}/status` 
    let res: AxiosResponse<Status>
    try {
      res = await axios.get(url, {
        headers: {
          Authorization: seekerAPIToken
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
    */

    if (failBuildIfNotInCompliance && complianceStatus === false) {
      const message = `Seeker Project ${seekerProjectKey} is not in compliance. Please see Compliance Report for more details.`
      if (failBuildIfNotInCompliance) {
        core.setFailed(message)
      } else {
        core.warning(message)
      }
    } else {
      core.info(`Seeker Project ${seekerProjectKey} is in compliance.`)
    }
     
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
