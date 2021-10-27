# components
Ui Kit for Pangolin

# development flow

1. do `yarn` in components
2. do `yarn link` in components
3. do `yarn link "@pangolindex/components"` in the project where you want to use components
4. do `yarn dev` which will watch for any files changes and recompiles files

Incase react hook violation error comes, in that case follow below steps also.

1. do `yarn link` in `<project_root>/node_modules/react`.
2. do `yarn link react` in components which will symlink react which are being used by project.

# Publish flow

- do `yarn publish` which will build the components and publish to npm.