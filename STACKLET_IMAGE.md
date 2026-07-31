# Stacklet Superset image

This fork builds a Stacklet-specific Superset image and publishes it to a
container registry.

## What is built

The `stacklet` target in the root [`Dockerfile`](./Dockerfile): the upstream
`lean` stage plus the `postgres` and `fastmcp` extras (Postgres connectivity
and the MCP server). Image dependencies are managed through pyproject extras,
not a separate requirements file.

## How it is published

[`.github/workflows/stacklet-image.yml`](./.github/workflows/stacklet-image.yml)
builds and pushes on:

- pushes to `stacklet/integration`
- pull requests from collaborators targeting `stacklet/integration`

Authentication uses GitHub OIDC; the role and registry are supplied through
repository Actions variables (`AWS_REGION`, `PUBLISH_ROLE_ARN`, `ECR_REGISTRY`,
`ECR_REPOSITORY`), so no long-lived credentials are stored in the repo. The
workflow no-ops where those variables are not configured.

## Tagging

Images are tagged with the fork commit SHA:

```
<repository>:<superset-fork-sha>
```

Pushes to `stacklet/integration` use the branch commit SHA; pull request runs
use the PR head SHA. The registry repository is immutable, so a build is
skipped when an image already exists for that SHA.

Each image also carries OCI labels: `org.opencontainers.image.source`,
`org.opencontainers.image.revision`, `io.stacklet.superset.upstream_version`,
and `io.stacklet.superset.stacklet_ref`.

The full commit SHA baked into the image is shown in the sidebar's user menu
(under the Superset version), so the exact running image can be identified
from the UI.
