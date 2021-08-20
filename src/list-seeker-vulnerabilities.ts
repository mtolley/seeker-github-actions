import * as core from '@actions/core'
import {getInputOrEnvironmentVariable, getSeekerVulnerabilities} from './utils'
import axios, { AxiosResponse } from 'axios'

interface Vulnerability {
  Owner: string,
  ProjectKey: string,
  ItemKey: string,
  CheckerKey: string,
  VulnerabilityName: string,
  Severity: string,
  ticketUrls: string,
  URL: string,
  SourceName: string,
  SourceType: string,
  CodeLocation: string,
  StackTrace: string,
  VerificationTag: string,
  DetectionCount: string,
  FirstDetectionTime: string,
  LastDetectionTime: string,
  Status: string,
  OWASP2013: string,
  "PCI-DSS": string,
  "CWE-SANS": string,
  OWASP2017: string,
  GDPR: string,
  CAPEC: string,
  LastDetectionURL: string,
  SeekerServerLink: string,
  CustomTags: string,
  LatestVersion: string
}

async function run(): Promise<void> {
  try {
    core.info('Downloading Vulnerabilities from the Seeker server...')
    
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
    const seekerProjectVersion = getInputOrEnvironmentVariable(
      'seekerProjectVersion',
      'SEEKER_PROJECT_VERSION',
      false // optional, as versioning might not be available for this project
    )

    const onlySeekerVerified = core.getBooleanInput('onlySeekerVerified')
    const statuses = core.getInput('statuses') || "DETECTED"
    const minSeverity = core.getInput('minSeverity') || ""
    
    if (minSeverity) {
      if (minSeverity !== 'CRITICAL' && 
          minSeverity !== 'HIGH' && 
          minSeverity !== 'MEDIUM' &&
          minSeverity !== 'LOW' &&
          minSeverity !== 'INFORMATIVE') {
            core.error(`Invalid value for minSeverity provided: ${minSeverity}. Permitted values are CRITICAL, HIGH, MEDIUM, LOW, and INFORMATIVE`)
          }
    }

    const vulns = await getSeekerVulnerabilities({
      seekerServerURL,
      seekerProjectKey,
      seekerAPIToken,
      statuses,
      onlySeekerVerified,
      minSeverity,
      seekerProjectVersion
    })

    // let url = `${seekerServerURL}/rest/api/latest/vulnerabilities?format=JSON&language=en&projectKeys=${seekerProjectKey}&includeHttpHeaders=false&includeHttpParams=false&includeDescription=false&includeRemediation=false&includeSummary=false&includeVerificationProof=false&includeTriageEvents=false&includeComments=false`
    // if (onlySeekerVerified.toLowerCase() === 'true') {
    //   url += '&onlySeekerVerified=true'
    // }
    // if (minSeverity) {
    //   url += `&minSeverity=${minSeverity}`
    // }
    // if (statuses) {
    //   url += `&statuses=${statuses}`
    // }

    // core.info(url)
    // core.info(`Downloading Seeker vulnerabilities matching specified criteria from: ${url}`) 
    // let res: AxiosResponse<Vulnerability[]>
    // try {
    //   res = await axios.get(url, {
    //     headers: {
    //       Authorization: seekerAPIToken
    //     }
    //   })
    // } catch(error) {
    //   if (error.response) {
    //     core.error(`Seeker Server responded with error code: ${error.response.status}`)
    //     core.error(`Error message: ${error.response.data.message}`)
    //   } else {
    //     core.error("No response from Seeker Server")
    //     core.error(error)
    //   }
    //   return
    // }  

    // const vulns: Vulnerability[] = res.data
    for (const v of vulns) {
      core.warning(`Seeker Vulnerability ${v.ItemKey} ${v.VulnerabilityName} ${v.URL}`)
    }
     
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
