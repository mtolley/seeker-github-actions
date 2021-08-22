# Seeker GitHub Actions

Add Seeker IAST from Synopsys to your GitHub actions worklows. :rocket:

This template includes tests, linting, a validation workflow, publishing, and versioning guidance.

If you want to know more about the basic concepts behind Seeker SDLC integrations you can read about the underlying concepts and API calls here [Seeker SDLC Integration](https://community.synopsys.com/s/article/Seeker-SDLC-Integration)

## Available Actions

There are multiple actions available and you don't need to use them all. Here's a quick guide:

* `download-seeker-agent` pulls down the Seeker agent from your Seeker server into your build/test environment.
* `list-seeker-vulnerabilties` writes out a summary of Seeker vulnerabilities matching your criteria.
* `check-seeker-compliance` queries the Seeker server to see whether your build is in compliance with any Compliance Policies in force for your project and - optionally - fails the workflow if not.
* `fix-undetected-vulnerabilities` automatically sets the state of any vulnerabilities that were no longer detected in the most recent version of your project to FIXED.
* `seeker-compliance-report` generates a PDF compliance report and uploads it to the build output as an artefact.
* `seeker-compliance-reporting` combines the functionality of `check-seeker-compliance` and `seeker-compliance-report` into one step.

Note that GitHub issues can be created automatically for any new Seeker vulnerabilities detected in your repo. However, you don't need GitHub actions for that. See [Seeker SDLC Integration](https://community.synopsys.com/s/article/Seeker-SDLC-Integration) for more details, and the example `create.sh` script below.

## Code in Main

Install the dependencies

```bash
npm install
```

Run the tests :heavy_check_mark:

```bash
$ npm test

 PASS  ./index.test.js
  ✓ throws invalid number (3ms)
  ✓ wait 500 ms (504ms)
  ✓ test runs (95ms)
...
```

## Change action.yml

The action.yml defines the inputs and output for your action.

Update the action.yml with your name, description, inputs and outputs for your action.

See the [documentation](https://help.github.com/en/articles/metadata-syntax-for-github-actions)

## Change the Code

Most toolkit and CI/CD operations involve async operations so the action is run in an async function.

```javascript
const core = require('@actions/core');
...

async function run() {
  try {
      ...
  }
  catch (error) {
    core.setFailed(error.message);
  }
}

run()
```

See the [toolkit documentation](https://github.com/actions/toolkit/blob/master/README.md#packages) for the various packages.

## Package for distribution

GitHub Actions will run the entry point from the action.yml. Packaging assembles the code into one file that can be checked in to Git, enabling fast and reliable execution and preventing the need to check in node_modules.

Actions are run from GitHub repos.  Packaging the action will create a packaged action in the dist folder.

Run prepare

```bash
npm run prepare
```

Since the packaged index.js is run from the dist folder.

```bash
git add dist
```

## Create a release branch

Users shouldn't consume the action from master since that would be latest code and actions can break compatibility between major versions.

Checkin to the v1 release branch

```bash
git checkout -b v1
git commit -a -m "v1 release"
```

```bash
git push origin v1
```

Note: We recommend using the `--license` option for ncc, which will create a license file for all of the production node modules used in your project.

Your action is now published! :rocket:

See the [versioning documentation](https://github.com/actions/toolkit/blob/master/docs/action-versioning.md)

## Usage

You can now consume the action by referencing the v1 branch

```yaml
uses: actions/javascript-action@v1
with:
  milliseconds: 1000
```

See the [actions tab](https://github.com/actions/javascript-action/actions) for runs of this action! :rocket: