import * as core from '@actions/core'
import axios, { AxiosError, AxiosResponse } from 'axios'

export interface Vulnerability {
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

export function getInputOrEnvironmentVariable(
  inputName: string,
  envVar: string,
  required = true
): string { 
  const result = core.getInput(inputName) || process.env[envVar] || ""
  if (required && !result) {
    core.setFailed(`You must provide either the input parameter ${inputName} or environment variable ${envVar}`)
  }
  return result
}

export function getInputOrEnvironmentVariableBoolean(
  inputName: string,
  envVar: string
): boolean { 
  const value = core.getInput(inputName) || process.env[envVar] || ""
  return value.toUpperCase() === 'TRUE'
}

export function handleAxiosError(error: AxiosError): void {
  if (error.response) {
    core.error(`Seeker Server responded with error code: ${error.response.status}`)
    core.error(`Error message: ${error.response.data.message}`)
  } else {
    core.error("No response from Seeker Server")
    core.error(error)
  }
}

export interface getSeekerVulnerabilitiesParameters {
  seekerServerURL: string,
  seekerProjectKey: string,
  seekerAPIToken: string,
  onlySeekerVerified?: boolean,
  minSeverity?: string,
  statuses?: string
}

export async function getSeekerVulnerabilities({ 
  seekerServerURL, 
  seekerProjectKey, 
  seekerAPIToken, 
  onlySeekerVerified, 
  minSeverity, 
  statuses 
}: getSeekerVulnerabilitiesParameters): Promise<Vulnerability[]> {
  // Every request to the Vulnerabilities API needs the Seeker Server URL, the Project key, and the API token
  let url = `${seekerServerURL}/rest/api/latest/vulnerabilities?format=JSON&language=en&projectKeys=${seekerProjectKey}&includeHttpHeaders=false&includeHttpParams=false&includeDescription=false&includeRemediation=false&includeSummary=false&includeVerificationProof=false&includeTriageEvents=false&includeComments=false`
  
  // Only add these filters to the URL if they are actually specified
  if (onlySeekerVerified === true) {
    url += '&onlySeekerVerified=true'
  }
  if (minSeverity) {
    url += `&minSeverity=${minSeverity}`
  }
  if (statuses) {
    url += `&statuses=${statuses}`
  }

  core.info(url)
  core.info(`Downloading Seeker vulnerabilities matching specified criteria from: ${url}`) 
  let res: AxiosResponse<Vulnerability[]>
  try {
    res = await axios.get(url, {
      headers: {
        Authorization: seekerAPIToken
      }
    })
  } catch(error) {
    handleAxiosError(error as AxiosError)
    return []
  }  
  return res.data
}