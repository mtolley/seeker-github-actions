import * as core from '@actions/core'
import {getInputOrEnvironmentVariable} from './utils'
import axios, { AxiosResponse } from 'axios'

interface Status {
  projectStatus: {
    compliant: boolean
  }
}

async function run(): Promise<void> {
  try {
    core.info('Downloading Seeker agent from Seeker Server')
    
    const seekerServerURL = getInputOrEnvironmentVariable(
      'seekerServerUrl',
      'SEEKER_SERVER_URL'
    )
    const seekerProjectKey = getInputOrEnvironmentVariable(
      'seekerProjectKey',
      'SEEKER_PROJECT_KEY'
    )
    const seekerAPIToken = getInputOrEnvironmentVariable(
      'seekerAPIToken',
      'SEEKER_API_TOKEN'
    )
    const failBuildIfNotInCompliance = core.getBooleanInput('failBuildIfNotInCompliance')

    core.info(`Seeker Server URL: ${seekerServerURL}`)
    core.info(`Seeker Project Key: ${seekerProjectKey}`)
    
    if (!seekerServerURL) { 
      core.setFailed("The Seeker Server URL must be provided with the seekerServerURL input or via the SEEKER_SERVER_URL environment variable.")
    }
    if (!seekerProjectKey) {
      core.setFailed("The Seeker Project Key must be provided with the seekerProjectKey input or via the SEEKER_PROJECT_KEY environment variable.")
    }
    if (!seekerAPIToken) {
      core.setFailed("The Seeker API Token must be provided with the seekerAPIToken input. You should store your Seeker API Token securely as an ecrypted secret.")
    }

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

    if (res.data.projectStatus.compliant === false) {
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
