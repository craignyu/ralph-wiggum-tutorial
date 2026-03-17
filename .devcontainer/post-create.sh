#!/bin/bash
# post-create.sh - Runs when user opens a codespace (after prebuild snapshot)
# Keep this lightweight — only user-specific setup that can't be prebuilt.

set -e

echo "==> Installing pre-commit hooks..."
pre-commit install 2>/dev/null || echo "Pre-commit not configured yet"

echo "==> post-create complete!"
