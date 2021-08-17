import * as core from '@actions/core'
import {getInputOrEnvironmentVariable} from './utils'
import axios from 'axios'
import child_process from 'child_process'

const supportedTechnologies = [
  'JAVA',
  'DOTNETCORE',
  'DOTNET',
  'NODEJS',
  'PHP',
  'GO',
  'PYTHON'
]

function getOSFamily(): string {
  if (process.platform === "linux") return "LINUX"
  if (process.platform === "win32") return "WINDOWS"
  if (process.platform === "darwin") return "MAC"
  return "UNKNOWN"
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
    const technology = core.getInput('technology')
    
    const osFamily = getOSFamily()

    core.info(`Seeker Server URL: ${seekerServerURL}`)
    core.info(`Seeker Project Key: ${seekerProjectKey}`)
    core.info(`Technology: ${technology}`)
    
    if (!seekerServerURL) { 
      core.setFailed("The Seeker Server URL must be provided with the seekerServerURL input or via the SEEKER_SERVER_URL environment variable.")
    }
    if (!seekerProjectKey) {
      core.setFailed("The Seeker Project Key must be provided with the seekerProjectKey input or via the SEEKER_SERVER_URL environment variable.")
    }
    if (!technology) {
      core.setFailed("The Seeker agent technology must be specified via the technology input.")
    } else if (!supportedTechnologies.includes(technology)) {
      core.setFailed(`The requested technology: ${technology} is not one of the supported technologies: ${supportedTechnologies.join(',')}`)
    }

    try {
      const url = `${seekerServerURL}/rest/api/latest/installers/agents/scripts/${technology}?projectKey=${seekerProjectKey}&downloadWith=curl&osFamily=${osFamily}&flavor=DEFAULT`
      core.info(`Downloading Seeker agent from URL: ${url}`)
      const res = await axios.get(url)
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
