#!/usr/bin/env node
/**
 * Deploy couplegames Firestore rules to photoscavenger-b16e2.
 * Requires: gcloud auth login with access to the project.
 */
import { execSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const PROJECT = 'photoscavenger-b16e2'
const RELEASE = 'cloud.firestore'
const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const rules = readFileSync(join(root, 'firestore.rules'), 'utf8')
const token = execSync('gcloud auth print-access-token', { encoding: 'utf8' }).trim()
const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
  'x-goog-user-project': PROJECT,
}

const rulesetRes = await fetch(`https://firebaserules.googleapis.com/v1/projects/${PROJECT}/rulesets`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ source: { files: [{ name: 'firestore.rules', content: rules }] } }),
})
const rulesetText = await rulesetRes.text()
if (!rulesetRes.ok) {
  console.error('Failed to create ruleset:', rulesetRes.status, rulesetText)
  process.exit(1)
}
const ruleset = JSON.parse(rulesetText)

const releaseRes = await fetch(`https://firebaserules.googleapis.com/v1/projects/${PROJECT}/releases`, {
  method: 'POST',
  headers,
  body: JSON.stringify({
    name: `projects/${PROJECT}/releases/${RELEASE}`,
    rulesetName: ruleset.name,
  }),
})
const releaseText = await releaseRes.text()
if (!releaseRes.ok) {
  console.error('Failed to release rules:', releaseRes.status, releaseText)
  process.exit(1)
}

console.log(`Deployed Firestore rules to ${PROJECT} (${RELEASE})`)
