// download-seeker-agent.ts
// ////////////////////////
//
// Downloads the Seeker agent installer script from the Seeker API and
// runs it. This will download the agent binary itself and display instructions
// for using it in the build output.

import * as core from '@actions/core'
import {getInputOrEnvironmentVariable} from './utils'
import axios from 'axios'
import child_process from 'child_process'

async function run(): Promise<void> {
  try {
    core.info('Downloading Seeker agent from Seeker Server')
    
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
    const technology = getInputOrEnvironmentVariable(
      'seekerAPIToken',
      'SEEKER_API_TOKEN',
      true // required
    )
    const osFamily = getInputOrEnvironmentVariable(
      'osFamily',
      'SEEKER_OS_FAMILY',
      true // required
    )
    core.warning(`/rest/api/latest/installers/agents/scripts/${technology}?projectKey=${seekerProjectKey}&downloadWith=curl&osFamily=${osFamily}&flavor=DEFAULT`)
    try {
      // First download the installer script from the Seeker server
      const url = `${seekerServerURL}/rest/api/latest/installers/agents/scripts/${technology}?projectKey=${seekerProjectKey}&downloadWith=curl&osFamily=${osFamily}&flavor=DEFAULT`
      core.info(`Downloading Seeker agent from URL: ${url}`)
      const res = await axios.get(url)

      // Then execute the installer script and echo any output. 
      const commandResult = child_process.execSync(res.data.toString())
      core.info(commandResult.toString())
    } catch(error) {
        if (error.response) {
          core.error(`Seeker Server responded with error code: ${error.response.status}`)
          core.error(`Error message: ${error.response.data.message}`)
        } else {
          core.error("No response from Seeker Server")
        }
      } 
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
