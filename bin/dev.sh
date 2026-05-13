#!/bin/bash
# Run the bundled CLI (ESM + JSON import attributes are not supported by plain ts-node here).
# Build first: moon run cli:build   or   (cd apps/cli && pnpm exec tsup)
# Use "$@" to pass all additional command line arguments to your script
node apps/cli/dist/cli.mjs "$@"
