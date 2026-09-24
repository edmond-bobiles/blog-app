#!/usr/bin/env bash
set -euo pipefail

VENV_DIR="backend/.venv"

echo "🐍 Creating Python virtual environment in $VENV_DIR …"
python3 -m venv "$VENV_DIR"

echo "📦 Installing Python dependencies …"
"$VENV_DIR/bin/pip" install --upgrade pip
"$VENV_DIR/bin/pip" install -r backend/requirements.txt

echo ""
echo "✅ Setup complete.  Run:  npm run dev"
