import * as core from '@actions/core'
// import {getInputOrEnvironmentVariable} from './utils'
// import axios, { AxiosResponse } from 'axios'

// interface Status {
//   projectStatus: {
//     compliant: boolean
//   }
// }

async function run(): Promise<void> {
  try {
    core.info('Checking Seeker') 
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
