# Seeker GitHub Actions

Add Seeker IAST from Synopsys to your GitHub actions worklows. :rocket:

Use these actions to pull down the agent binaries from the Seeker server when and where you need them, add reports to your build output or artefacts, check Compliance Policy status, and close open issues in GitHub automatically when they get fixed in the code!

If you would like to know more about building Seeker SDLC integrations you can read about the underlying concepts and API calls here [Seeker SDLC Integration](https://community.synopsys.com/s/article/Seeker-SDLC-Integration).

## Available Actions

There are multiple actions available and you don't need to use them all. Here's a quick guide:

* `download-seeker-agent` pulls down the Seeker agent from your Seeker server into your build/test environment.
* `list-seeker-vulnerabilties` writes out a summary of Seeker vulnerabilities matching your criteria.
* `check-seeker-compliance` queries the Seeker server to see whether your build is in compliance with any Compliance Policies in force for your project and - optionally - fails the workflow if not.
* `fix-undetected-vulnerabilities` automatically sets the state of any vulnerabilities that were no longer detected in the most recent version of your project to FIXED.
* `seeker-compliance-report` generates a PDF compliance report and uploads it to the build output as an artefact.
* `seeker-compliance-reporting` combines the functionality of `check-seeker-compliance` and `seeker-compliance-report` into one step.

Note that GitHub issues can be created automatically for any new Seeker vulnerabilities detected in your repo. However, you don't need GitHub actions for that. See [Seeker SDLC Integration](https://community.synopsys.com/s/article/Seeker-SDLC-Integration) for more details, and the example `create.sh` script below.

## Getting Started with Seeker and GitHub Actions

This section will walk you though the a basic - yet effective - implementation of Seeker in your GitHub actions workflows.

### Step 1 - Environment Variables

You can set these values as inputs on the individual steps if you prefer, but since they are used everywhere it can be easier to set them up at the beginning of your job(s):

```yaml
env:
  SEEKER_SERVER_URL: https://server.synopsysseeker.com:8443
  SEEKER_PROJECT_KEY: HIPPOTECH-GITHUB
  SEEKER_API_TOKEN: ${{ secrets.SEEKER_API_TOKEN }}
  SEEKER_PROJECT_VERSION: ${{ github.run_number }}
```

Note that you will need a GitHub secret to securely store your Seeker API token.

`SEEKER_PROJECT_VERSION` is optional, in case you are not using project versioning in Seeker. However, some useful features like automatically changing the status of newly fixed vulnerabilities require this. You enable and configure version management on a project-by-project basis in the Seeker UI, or use project templates to do so. 

### Step 2 - Add The Seeker Agent

Before you can add the Seeker agent to your test environment you will need to get your hands on it! There's nothing stopping you downloading the agent binaries from the Seeker UI, or via the API with `curl`, but the `download-seeker-agent` acts as a handy wrapper. You will need to specifiy two inputs:

* `technology` one of JAVA, DOTNETCORE, DOTNET, NODEJS, PHP, GO, PYTHON
* `osFamily` one of LINUX, WINDOWS, MAC

to make sure that the Seeker server gives you the right agent. This action will create a directory `./seeker` under the current working directory and dowload the agent binarie there. At this point you will need to configure your application testing environment to include the agent as usual. Here's an example using Java:

```yaml
- name: Add Seeker agent
  uses: mtolley/seeker-github-actions/download-seeker-agent@v1.1
  with:
    technology: JAVA
    osFamily: LINUX

- name: Start application for testing
  run: |
    export JAVA_TOOL_OPTIONS=-javaagent:`pwd`/seeker/seeker-agent.jar
    ./scripts/start.sh
```

### Step 3 - Testing

At this point your workflow does whatever your workflow needs to do to run those tests! Seeker should be watching in the background building up a picture of any new or old vulnerabilties detected during this test run.

### Step 4 - Making Use Of The Results

Once testing is complete you can use the remaining Seeker actions to do something useful with the results. Here's a representative example that:

* Writes a summary of any Critical or High impact vulnerabilities detected into the build output.
* Checks the Seeker Compliance status for the project and adds a PDF report to the build as an artefact.
* Fails the build if the projet is **not** compliant.
* Looks for any old vulnerabilities that were **not** detected during the most recent test run, and automatically sets their status to FIXED. And also closes any associated GitHub issues.

```yaml
- name: List Seeker Vulnerabilities
  uses: mtolley/seeker-github-actions/list-seeker-vulnerabilities@v1.1
  with:
    minSeverity: HIGH
    onlySeekerVerified: false

- name: Seeker Compliance Reporting
  uses: mtolley/seeker-github-actions/seeker-compliance-reporting@v1.1
  with:
    generateComplianceReportPDF: true
    failBuildIfNotInCompliance: true

- name: Mark Undetected Vulnerabilities As Fixed
  uses: mtolley/seeker-github-actions/fix-undetected-vulnerabilities@v1.1
  with:
    closeFixedIssues: true
    gitHubToken: ${{ secrets.GITHUB_TOKEN }}
```

### Examples

The example workflows outlined about will give you feedback in the build output and summary. e.g.

![Example GitHub Build Output](/doc/img/github-build-output.png?raw=true "Example GitHub Build Output")

and

![Example GitHub Build Summary](/relative/path/to/img.jpg?raw=true "Example GitHub Build Summary")

### Exporting Seeker Findings as GitHub Issues

Whether you want to export issues from Seeker to GitHub manually in the Seeker UI, or automatically as a result of any new findings detected during your GitHub actions workflows, you will need to enable external bug tracking integration on your Seeker server. See *Integrate External Bug Tracking Systems* in the Seeker online help, and [Seeker SDLC Integration](https://community.synopsys.com/s/article/Seeker-SDLC-Integration) on the Synopsys Community website for more details. Here's an example of a simple script that will enable this integration for GitHub issues on your Seeker server: just remember that you will need to add a little logic in this script to map the Seeker project key (SEEKER_PROJECT_KEY) that is specified for any new issues to your GitHub repo.

```bash
# create.sh
# #################################################################################
# Step 1 - Set up GitHub connection details. The GitHub token should be a carefully
# protected secret. If your repo name is not the same as your Seeker project key
# you will need to do the mapping here.
# #################################################################################
GITHUB_TOKEN=<redacted>
GITHUB_USER=<username>
GITHUB_URL=https://api.github.com/repos
GITHUB_REPO=<repository>

# ################################################################################
# Step 2 - Escape the SEEKER_TICKET_DESCRIPTION for passing to GitHub in JSON
# ################################################################################
TITLE=$(echo "$SEEKER_TICKET_SUMMARY"     | tr -d '\n' | jq -aRs)
BODY=$(echo  "$SEEKER_TICKET_DESCRIPTION" | tr -d '\n' | jq -aRs)

# ################################################################################
# Step 2 - POST the new issue to GitHub
# ################################################################################
PAYLOAD=$(printf '{"title": %s, "body": %s}' "$TITLE" "$BODY")

result=$(curl -s \
  -X POST \
  -u "$GITHUB_USER:$GITHUB_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  -d  "$PAYLOAD" \
  "${GITHUB_URL}/${GITHUB_USER}/${GITHUB_REPO}/issues")

# ################################################################################
# Step 3 - extract the URL of the new issue in GitHub
# ################################################################################
URL=$(printf  %s "$result" | jq -r '.["html_url"]')

# ################################################################################
# Step 4 - provide the extracted issue URL to Seeker via stdout
# ################################################################################
printf '<SUCCESS:{"url":"%s"}>' "$URL"
```