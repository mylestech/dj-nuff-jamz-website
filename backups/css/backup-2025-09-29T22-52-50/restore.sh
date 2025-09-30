#!/bin/bash
# Restore CSS backup from 2025-09-29T22-52-50

echo "🔄 Restoring DJ Nuff Jamz CSS from backup 2025-09-29T22-52-50..."

cp "/Users/mojo/dev/builds/djnuffjamz/website/backups/css/backup-2025-09-29T22-52-50/tailwind.backup" "tailwind.config.js"
cp "/Users/mojo/dev/builds/djnuffjamz/website/backups/css/backup-2025-09-29T22-52-50/sourceCSS.backup" "src/styles/main.css"

echo "✅ Files restored! Now run:"
echo "  npm run build:css:dev"
echo "  npm run verify-styling"

echo "🎉 Backup restoration complete!"
