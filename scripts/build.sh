#!/usr/bin/env sh
# Copies only the public app files into dist/ for deployment, so internal docs
# (README, SETUP), database scripts and server functions are never served.
set -e
rm -rf dist
mkdir -p dist
cp index.html app.js styles.css sw.js manifest.json icon.svg \
   landing.html privacy.html terms.html refund.html _headers dist/
echo "Built dist/ with $(ls dist | wc -l) files"
