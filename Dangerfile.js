const fs = require('fs')
const path = require('path')
const danger = require('danger')
const _ = require('lodash')
const validateMessage = require('validate-commit-msg')
// simple regex matcher to detect usage of helper function and its type signature
const hotMatch = /\bhot\(/gi
const hotSignatureMatch = /\bimport \{.*?hot.*?\} from '.*?\/helpers\/marble-testing'/gi

const coldMatch = /\bcold\(/gi
const coldSignatureMatch = /\bimport \{.*?cold.*?\} from '.*?\/helpers\/marble-testing'/gi

let errorCount = 0

// Warn when PR size is large
const bigPRThreshold = 600
if (danger.github.pr.additions + danger.github.pr.deletions > bigPRThreshold) {
  danger.warn(':exclamation: Big PR (' + ++errorCount + ')')
  danger.markdown(
    '> (' +
      errorCount +
      ') : Pull Request size seems relatively large. If Pull Request contains multiple changes, split each into separate PR will helps faster, easier review.'
  )
}

// Check test exclusion (.only) is included
const modifiedSpecFiles = danger.git.modified_files.filter(function (filePath) {
  return filePath.match(/-spec.(js|jsx|ts|tsx)$/gi)
})

const testFilesIncludeExclusion = modifiedSpecFiles.reduce(function (
  acc,
  value
) {
  const content = fs.readFileSync(value).toString()
  const invalid =
    _.includes(content, 'it.only') || _.includes(content, 'describe.only')
  if (invalid) {
    acc.push(path.basename(value))
  }
  return acc
},
[])

if (testFilesIncludeExclusion.length > 0) {
  danger.fail('an `only` was left in tests (' + testFilesIncludeExclusion + ')')
}

// Check test cases missing type signature import for test marble helper functions
const testFilesMissingTypes = modifiedSpecFiles.reduce(function (acc, value) {
  const content = fs.readFileSync(value).toString()

  const hotFnMatchesWithoutTypes =
    content.match(hotMatch) && !content.match(hotSignatureMatch)
  const coldFnMatchesWithoutTypes =
    content.match(coldMatch) && !content.match(coldSignatureMatch)

  if (hotFnMatchesWithoutTypes || coldFnMatchesWithoutTypes) {
    acc.push(path.basename(value))
  }

  return acc
}, [])

if (testFilesMissingTypes.length > 0) {
  danger.fail(
    'missing type definition import in tests (' +
      testFilesMissingTypes +
      ') (' +
      ++errorCount +
      ')'
  )
  danger.markdown(
    '> (' +
      errorCount +
      ') : It seems updated test cases uses test scheduler interface `hot`, `cold` but miss to import type signature for those.'
  )
}

// validate commit message in PR if it conforms conventional change log, notify if it doesn't.
const messageConventionValid = danger.git.commits.reduce(function (acc, value) {
  const valid = validateMessage(value.message)
  return valid && acc
}, true)

if (!messageConventionValid) {
  danger.warn(
    'commit message does not follows conventional change log (' +
      ++errorCount +
      ')'
  )
  danger.markdown(
    '> (' +
      errorCount +
      ') : RxJS uses conventional change log to generate changelog automatically. It seems some of commit messages are not following those, please check [contributing guideline](https://github.com/ReactiveX/rxjs/blob/master/CONTRIBUTING.md#commit-message-format) and update commit messages.'
  )
}
