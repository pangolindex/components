# Releasing

## 📸 Snapshot releases (snapshot.yaml)

[Snapshot releases](https://github.com/changesets/changesets/blob/main/docs/snapshot-releases.md) are a way to test your changes in a consuming project without publishing a new version. You can create a snapshot from your pull request if:
- CI is passing on your branch
- Your branch has **at least one** pending [changeset](https://github.com/Honeycomb-finance/components/blob/main/.github/CONTRIBUTING.md#adding-a-changeset)

### 📦 Honeycomb npm packages

1. Add a comment with the `/snapshot` slash command in your feature branch PR
3. The github-actions bot will react to your comment with 👀 once the `snapshot.yml` workflow is running, then react with a 🚀 and post a comment listing install commands for the snapshots of each npm package that will be included in the next version release

## Version releases (release.yaml)

Honeycomb uses [Changesets](https://github.com/changesets/changesets) to handle releasing new versions of the packages in the `Honeycomb-finance/components` repository.

We have a [GitHub action](https://github.com/Honeycomb-finance/components/.github/workflows/release.yaml) that:
- Creates a `changeset-release/main` branch and opens a PR titled **"[Version Packages](https://github.com/Honeycomb-finance/components/pulls?q=is%3Apr+version+packages+is%3Aopen)"** that always has an up-to-date run of `changeset version`
- Keeps the `changeset-release/main` branch up to date whenever a pull request is merged to `main`
- Performs a release when the `changeset-release/main` branch merged into the `main` branch
- Recreates the `changeset-release/main` branch after the release is complete and opens a new **"[Version Packages](https://github.com/Honeycomb-finance/components/pulls?q=is%3Apr+version+packages+is%3Aopen)"** PR

## Prerelease (pre-release.yaml)

A prerelease PR is created by [Auto Update Github Action](https://github.com/Honeycomb-finance/components/blob/main/.github/docs/RELEASING.md#auto-update-dev-to-main-pr) when merging work with changesets into the `dev` branch.

Add a comment `/pre-release` to this PR, a new prerelease is created with the `rc` dist tag.

The github-actions bot will react to your comment with 👀 once the `pre-release.yml` workflow is running, then react with a 🚀 and post a comment listing install commands for the pre-release of each npm package that will be included in the next version release

You can learn more about [prerelease support using Changesets here](https://github.com/changesets/changesets/blob/main/docs/prereleases.md).

## Auto Update dev to main PR

We have a [github action](https://github.com/Honeycomb-finance/components/.github/workflows/create-or-update-dev-pr.yml) that:
- Create PR ( from dev to main ) whenever your PR will be merged to dev branch.
- Keeps PR up to date whenever new pull request is merged to `dev`.
- This PR will contain summary of all the changes that are going to be merged to `main` branch.
