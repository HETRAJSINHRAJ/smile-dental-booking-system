#!/bin/bash

# Start Firebase Emulator Suite
# This script starts all Firebase emulators for local development

echo "🚀 Starting Firebase Emulator Suite..."
echo ""
echo "Emulators will be available at:"
echo "  - Emulator UI: http://localhost:4000"
echo "  - Auth: http://localhost:9099"
echo "  - Firestore: http://localhost:8080"
echo "  - Storage: http://localhost:9199"
echo ""

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

# Start emulators
firebase emulators:start --import=./emulator-data --export-on-exit
