import * as core from '@actions/core'
import {getInputOrEnvironmentVariable} from './utils'
import axios, { AxiosResponse } from 'axios'
import { writeFileSync } from 'fs'
import * as artifact from '@actions/artifact'

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
    
    let res: AxiosResponse
    const url = `${seekerServerURL}/rest/api/latest/reports/compliances/export?projectKeys=${seekerProjectKey}`
    try {
      res = await axios.get(url, {
        responseType: 'arraybuffer',
        headers: {
          Authorization: seekerAPIToken,
          Accept: 'application/pdf'
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
    writeFileSync('seeker-compliance-report.pdf', res.data)

    core.info('Uploading the Seeker Compliance Report PDF as a build artefact')
    const artifactClient = artifact.create()
    const artifactName = 'seeker-compliance-report'
    const files = [
        'seeker-compliance-report.pdf'
    ]
    const rootDirectory = process.cwd()
    const options = {
        continueOnError: true
    }

    await artifactClient.uploadArtifact(artifactName, files, rootDirectory, options)
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
