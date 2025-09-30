#!/bin/bash
# Restore CSS and HTML backup from 2025-09-29T23-17-15

echo "🔄 Restoring DJ Nuff Jamz styling from backup 2025-09-29T23-17-15..."

cp "/Users/mojo/dev/builds/djnuffjamz/website/backups/css/backup-2025-09-29T23-17-15/tailwind.backup" "tailwind.config.js"
cp "/Users/mojo/dev/builds/djnuffjamz/website/backups/css/backup-2025-09-29T23-17-15/sourceCSS.backup" "src/styles/main.css"
cp "/Users/mojo/dev/builds/djnuffjamz/website/backups/css/backup-2025-09-29T23-17-15/indexHTML.backup" "public/index.html"

echo "✅ Files restored! Now run:"
echo "  npm run build:css:dev"
echo "  npm run verify-styling"

echo "🎉 Backup restoration complete!"
echo "📋 Restored files:"
echo "  - tailwind.config.js"
echo "  - src/styles/main.css"  
echo "  - public/index.html"
