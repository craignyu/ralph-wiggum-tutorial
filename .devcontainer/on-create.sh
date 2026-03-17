#!/bin/bash
# on-create.sh - Runs once during prebuild creation (cached in snapshot)
# Heavy dependency installation goes here to avoid re-running on codespace open.

set -e

echo "==> Installing Copilot CLI..."
npm install -g @github/copilot

echo "==> Installing Python dependencies..."
pip install -q -r requirements.txt
pip install -q -r requirements-dev.txt

echo "==> Installing frontend dependencies..."
cd frontend && npm install --silent
cd ..

echo "==> Installing root dependencies (Playwright)..."
npm install --silent

echo "==> on-create complete!"
