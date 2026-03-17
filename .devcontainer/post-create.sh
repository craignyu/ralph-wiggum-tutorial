#!/bin/bash
# Post-create script for devcontainer
# Runs script/setup after container creation

set -e

echo "Running post-create setup..."
script/setup
echo "Post-create setup complete!"
