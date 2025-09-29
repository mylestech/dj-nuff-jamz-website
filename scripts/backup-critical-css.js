#!/usr/bin/env node

/**
 * CSS Backup System for DJ Nuff Jamz Website
 * 
 * Creates timestamped backups of critical CSS configurations
 * to enable quick recovery if styling gets lost.
 */

const fs = require('fs');
const path = require('path');

const BACKUP_DIR = path.join(__dirname, '../backups/css');
const SOURCE_FILES = {
    tailwind: path.join(__dirname, '../tailwind.config.js'),
    sourceCSS: path.join(__dirname, '../src/styles/main.css'),
    compiledCSS: path.join(__dirname, '../public/css/style.css')
};

function ensureBackupDir() {
    if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
        console.log('📁 Created backup directory:', BACKUP_DIR);
    }
}

function createBackup() {
    ensureBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const backupSubDir = path.join(BACKUP_DIR, `backup-${timestamp}`);
    
    fs.mkdirSync(backupSubDir);
    
    // Backup all critical files
    Object.entries(SOURCE_FILES).forEach(([name, filePath]) => {
        if (fs.existsSync(filePath)) {
            const backupPath = path.join(backupSubDir, `${name}.backup`);
            fs.copyFileSync(filePath, backupPath);
            console.log(`✅ Backed up ${name}: ${path.basename(filePath)}`);
        } else {
            console.warn(`⚠️  Warning: ${filePath} does not exist`);
        }
    });
    
    // Create a restore script
    const restoreScript = `#!/bin/bash
# Restore CSS backup from ${timestamp}

echo "🔄 Restoring DJ Nuff Jamz CSS from backup ${timestamp}..."

cp "${backupSubDir}/tailwind.backup" "tailwind.config.js"
cp "${backupSubDir}/sourceCSS.backup" "src/styles/main.css"

echo "✅ Files restored! Now run:"
echo "  npm run build:css:dev"
echo "  npm run verify-styling"

echo "🎉 Backup restoration complete!"
`;
    
    const restoreScriptPath = path.join(backupSubDir, 'restore.sh');
    fs.writeFileSync(restoreScriptPath, restoreScript);
    fs.chmodSync(restoreScriptPath, 0o755);
    
    console.log('\n🎉 Backup created successfully!');
    console.log('📍 Location:', backupSubDir);
    console.log('🔄 To restore later, run:', path.join(backupSubDir, 'restore.sh'));
    
    return backupSubDir;
}

function listBackups() {
    if (!fs.existsSync(BACKUP_DIR)) {
        console.log('📁 No backups found (backup directory does not exist)');
        return [];
    }
    
    const backups = fs.readdirSync(BACKUP_DIR)
        .filter(dir => dir.startsWith('backup-'))
        .sort()
        .reverse(); // Most recent first
    
    if (backups.length === 0) {
        console.log('📁 No CSS backups found');
        return [];
    }
    
    console.log(`📁 Found ${backups.length} CSS backup(s):`);
    backups.forEach((backup, index) => {
        const backupPath = path.join(BACKUP_DIR, backup);
        const stats = fs.statSync(backupPath);
        const timestamp = backup.replace('backup-', '').replace(/-/g, ':');
        console.log(`  ${index + 1}. ${timestamp} (${stats.ctime.toLocaleDateString()})`);
    });
    
    return backups;
}

function cleanOldBackups(keepCount = 10) {
    if (!fs.existsSync(BACKUP_DIR)) return;
    
    const backups = fs.readdirSync(BACKUP_DIR)
        .filter(dir => dir.startsWith('backup-'))
        .map(dir => ({
            name: dir,
            path: path.join(BACKUP_DIR, dir),
            time: fs.statSync(path.join(BACKUP_DIR, dir)).ctime
        }))
        .sort((a, b) => b.time - a.time); // Newest first
    
    if (backups.length > keepCount) {
        const toDelete = backups.slice(keepCount);
        console.log(`🧹 Cleaning up ${toDelete.length} old backup(s)...`);
        
        toDelete.forEach(backup => {
            fs.rmSync(backup.path, { recursive: true });
            console.log(`  🗑️  Deleted: ${backup.name}`);
        });
    }
}

function main() {
    const command = process.argv[2];
    
    console.log('💾 DJ Nuff Jamz CSS Backup System');
    console.log('=================================\n');
    
    switch (command) {
        case 'create':
            createBackup();
            cleanOldBackups();
            break;
            
        case 'list':
            listBackups();
            break;
            
        case 'clean':
            const keepCount = parseInt(process.argv[3]) || 5;
            cleanOldBackups(keepCount);
            break;
            
        default:
            console.log('Usage:');
            console.log('  npm run backup-css create  - Create new backup');
            console.log('  npm run backup-css list    - List existing backups');
            console.log('  npm run backup-css clean   - Clean old backups (keep 5)');
            console.log('  npm run backup-css clean 3 - Clean old backups (keep 3)');
            break;
    }
}

if (require.main === module) {
    main();
}

module.exports = { createBackup, listBackups, cleanOldBackups };
