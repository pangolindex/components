const { Octokit } = require("@octokit/rest");

// declare global {
//   namespace NodeJS {
//     interface ProcessEnv {
//       GITHUB_REPOSITORY: string;
//       GITHUB_REPOSITORY_OWNER: string;
//       GITHUB_TOKEN?: string;
//       PR_NUMBER: string;
//     }
//   }
// }

const repo = process.env.GITHUB_REPOSITORY;
const repoName = repo?.split("/")?.[1];
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER;
const token = process.env.GITHUB_TOKEN;
const head = "dev";
const base = "master";

async function createOrUpdatePR() {
  const octokit = new Octokit({
    auth: token,
  });

  // Get PRs from dev to main
  console.log(`Getting list of PRs from ${head} to ${base}...`);
  const { data: prs } = await octokit.pulls.list({
    owner: repoOwner,
    repo: repoName,
    state: "open",
    base,
    head: `${repoOwner}:${head}`,
  });

  console.log(`Fetched ${prs.length} open PR(s) from ${head} to ${base}`);

  const prFromDevToMain = prs?.[0];
  const prNumber = prFromDevToMain ? prFromDevToMain.number : null;
  const prBody = prFromDevToMain ? prFromDevToMain.body : "";

  if (!prNumber) {
    console.log(
      `PR from ${head} to ${base} doesn't exist! Creating a new PR...`
    );
    // Create PR
    await octokit.pulls.create({
      owner: repoOwner,
      repo: repoName,
      title: "Release PR",
      head: `${repoOwner}:${head}`,
      base,
      body: `This PR was opened by the .github/workflows/create-or-update-dev-pr.yaml workflow. When you're ready to do a release, you can merge this which will create a release PR to ${base} branch. If you're not ready to do a release yet, that's fine, whenever you add more changesets to dev, this PR will be updated.\n\n## Summary\n\n- #${process.env.PR_NUMBER}`,
    });
    console.log(`Created new PR from ${head} to ${base}`);
  } else {
    // Update PR
    console.log(
      `PR from ${head} to ${base} found! Updating PR #${prNumber}...`
    );
    await octokit.pulls.update({
      owner: repoOwner,
      repo: repoName,
      pull_number: prNumber,
      body: `${prBody}\n\n- #${process.env.PR_NUMBER}`,
    });
    console.log(`Updated PR #${prNumber}`);
  }
}

createOrUpdatePR().catch((error) => {
  console.error(`Error occurred during the process: ${error.message}`);
});
