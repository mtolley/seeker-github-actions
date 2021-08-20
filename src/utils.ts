import * as core from '@actions/core'
import axios, { AxiosError, AxiosResponse } from 'axios'
import { writeFileSync } from 'fs'
import * as artifact from '@actions/artifact'

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

interface Status {
  projectStatus: {
    compliant: boolean
  }
}

export interface getComplianceStatusParameters {
  seekerServerURL: string,
  seekerProjectKey: string,
  seekerAPIToken: string,
  failBuildIfNotInCompliance: boolean
}

export async function checkComplianceStatus({ 
  seekerServerURL, 
  seekerProjectKey, 
  seekerAPIToken, 
  failBuildIfNotInCompliance
}: getComplianceStatusParameters): Promise<boolean> {
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
    return false
  }  

  if (failBuildIfNotInCompliance && res.data.projectStatus.compliant === false) {
    const message = `Seeker Project ${seekerProjectKey} is not in compliance. Please see Compliance Report for more details.`
    if (failBuildIfNotInCompliance) {
      core.setFailed(message)
    } else {
      core.warning(message)
    }
  } else {
    core.info(`Seeker Project ${seekerProjectKey} is in compliance.`)
  }

  return res.data.projectStatus.compliant
}

export interface generateSeekerComplianceReportPDFParameters {
  seekerServerURL: string,
  seekerProjectKey: string,
  seekerAPIToken: string
}

export async function generateSeekerComplianceReportPDF({ 
  seekerServerURL, 
  seekerProjectKey, 
  seekerAPIToken, 
}: generateSeekerComplianceReportPDFParameters): Promise<void> {
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
}

export interface getSeekerVulnerabilitiesParameters {
  seekerServerURL: string,
  seekerProjectKey: string,
  seekerAPIToken: string,
  seekerProjectVersion?: string
  onlySeekerVerified?: boolean,
  minSeverity?: string,
  statuses?: string
}

export async function getSeekerVulnerabilities({ 
  seekerServerURL, 
  seekerProjectKey,
  seekerProjectVersion,
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
  if (seekerProjectVersion) {
    url += `&projectVersions=${seekerProjectVersion}`
  }

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

export async function uploadSeekerComplianceReport(): Promise<void> {
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
}