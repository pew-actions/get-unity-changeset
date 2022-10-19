import * as core from '@actions/core'
import { Octokit } from '@octokit/core'
import axios from 'axios'

async function findChangeset(version: string): Promise<string> {

  const unityVersionArchive = 'https://unity3d.com/get-unity/download/archive'
  const response = await axios.get(unityVersionArchive)
  if (response.status != 200) {
    throw new Error('Failed to contact Unity Download archive')
  }

  const searchPrefix = `href="unityhub://${version}/`
  const startIndex = response.data.indexOf(searchPrefix)
  if (startIndex < 0) {
    throw new Error(`Failed to find matching changeset for Unity version '${version}'`)
  }

  const href = response.data.slice(startIndex + searchPrefix.length)
  const endIndex = href.indexOf('"')
  if (endIndex < 0) {
      throw new Error(`Got a malformed unityhub link from the archive: ${response.data.slice(startIndex, 20)}`)
  }

  const changeset = href.slice(0, endIndex)
  return changeset
}

async function run(): Promise<void> {

  try {

    // Validate inputs
    const unityVersion = core.getInput('unity-version')
    if (!unityVersion) {
      throw new Error('No unity-version supplied to the action')
    }

    core.debug(`Searching for changeset to unity version: ${unityVersion}`)

    // find the matching changeset for the unity version
    const changeSet = await findChangeset(unityVersion)
    core.debug(`Found changeset: ${changeSet}`)
    core.setOutput('changeset', changeSet)
  } catch (err: any) {
    if (err instanceof Error) {
      const error = err as Error
      core.setFailed(error.message)
    }
  }
}

run()
