import * as core from '@actions/core'
import * as github from '@actions/github'

import {
  statusColor,
  StatusColorKey,
  statusImage,
  StatusImageKey,
  statusMessage,
  StatusMessageKey
} from './statusIndication'

const gitHubIconUrl =
  'https://raw.githubusercontent.com/SimonScholz/google-chat-action/main/assets/github-cat-128.png'
const gitBranchIconUrl =
  'https://raw.githubusercontent.com/SimonScholz/google-chat-action/main/assets/git-branch-128.png'

export function createCardV2Section(): object[] {
  const additionalSections = core.getInput('additionalSections')
  const additionalSectionsJson = JSON.parse(additionalSections)
  const defaultCardV2Section = createDefaultCardV2Section()

  return defaultCardV2Section.concat(additionalSectionsJson)
}

export function createDefaultCardV2Section(): object[] {
  const repoPath = `${github.context.repo.owner}/${github.context.repo.repo}`
  const collapsibleDefaultSection = core.getBooleanInput(
    'collapsibleDefaultSection'
  )
  const uncollapsibleWidgetsCount = getNumberResultAndValidate(
    'uncollapsibleWidgetsCount'
  )

  const defaultCardV2Section = [
    {
      collapsible: collapsibleDefaultSection,
      uncollapsibleWidgetsCount,
      widgets: [{}]
    }
  ]

  const jobStatus = core.getInput('jobStatus')

  if (jobStatus) {
    defaultCardV2Section[0].widgets.push({
      decoratedText: {
        startIcon: {
          iconUrl: statusImage[jobStatus as StatusImageKey]
        },
        text: `<font color="${statusColor[jobStatus as StatusColorKey]}">${
          statusMessage[jobStatus as StatusMessageKey]
        }</font>`
      }
    })
  }

  const repoUrl = `https://github.com/${repoPath}`
  const commitOrPullUrl =
    github.context.eventName === 'push'
      ? `https://github.com/${repoPath}/commit/${github.context.sha}`
      : `https://github.com/${repoPath}/pull/${github.context.issue.number}`
  const actionRunUrl = `https://github.com/${repoPath}/actions/runs/${github.context.runId}`

  defaultCardV2Section[0].widgets.push(
    {
      decoratedText: {
        startIcon: {
          iconUrl: gitHubIconUrl
        },
        text: `<a href="${repoUrl}">${repoUrl}</a>`
      }
    },
    {
      decoratedText: {
        startIcon: {
          iconUrl: gitBranchIconUrl
        },
        text: `Go to ${
          github.context.eventName === 'push' ? 'commit' : 'pull request'
        }: <a href="${commitOrPullUrl}">${commitOrPullUrl}</a>`
      }
    },
    {
      decoratedText: {
        startIcon: {
          knownIcon: 'STAR'
        },
        text: `Action run: <a href="${actionRunUrl}">${actionRunUrl}</a>`
      }
    }
  )

  return defaultCardV2Section
}

function getNumberResultAndValidate(propertyName?: string): number | undefined {
  if (!propertyName) {
    return undefined
  }

  const value = core.getInput(propertyName)
  const number = Number(value)
  if (isNaN(number)) {
    throw new Error(`${propertyName} needs to be a number`)
  }

  return getNumberOrUndefined(value)
}

function getNumberOrUndefined(value: string): number | undefined {
  if (!value || value === '') return undefined

  const result = Number(value)
  if (isNaN(result)) return undefined
  return result
}
