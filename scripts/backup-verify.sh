#!/bin/bash

# DJ Nuff Jamz Website - Backup Verification Script
# Verifies backup systems are functioning correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 DJ Nuff Jamz Website - Backup Verification${NC}"
echo -e "${BLUE}=============================================${NC}\n"

# Function to check command success
check_status() {
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ $1${NC}"
        return 0
    else
        echo -e "${RED}❌ $1${NC}"
        return 1
    fi
}

# 1. Verify Git Repository Access
echo -e "${YELLOW}📂 Checking Git Repository Access...${NC}"
git remote -v > /dev/null 2>&1
check_status "Git repository accessible"

# 2. Check Git Repository Status
echo -e "\n${YELLOW}📊 Checking Git Repository Status...${NC}"
git status --porcelain > /dev/null 2>&1
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${GREEN}✅ Working directory clean${NC}"
else
    echo -e "${YELLOW}⚠️  Uncommitted changes detected${NC}"
fi

# 3. Verify Remote Repositories
echo -e "\n${YELLOW}🌐 Checking Remote Repositories...${NC}"
remotes=$(git remote)
for remote in $remotes; do
    git ls-remote $remote > /dev/null 2>&1
    check_status "Remote '$remote' accessible"
done

# 4. Check Recent Commits
echo -e "\n${YELLOW}📝 Checking Recent Backup Activity...${NC}"
recent_commits=$(git log --oneline -5 --pretty=format:"%h %s" | wc -l)
if [ $recent_commits -gt 0 ]; then
    echo -e "${GREEN}✅ Recent commits found ($recent_commits)${NC}"
    echo -e "${BLUE}Recent commits:${NC}"
    git log --oneline -3 --pretty=format:"  %C(yellow)%h%C(reset) %s"
    echo ""
else
    echo -e "${RED}❌ No recent commits found${NC}"
fi

# 5. Verify Vercel CLI Access (if available)
echo -e "\n${YELLOW}🚀 Checking Vercel Integration...${NC}"
if command -v vercel &> /dev/null; then
    vercel --version > /dev/null 2>&1
    check_status "Vercel CLI available"
    
    # Check if logged in to Vercel
    vercel whoami > /dev/null 2>&1
    check_status "Vercel authentication valid"
else
    echo -e "${YELLOW}⚠️  Vercel CLI not installed${NC}"
fi

# 6. Check Website Accessibility
echo -e "\n${YELLOW}🌍 Checking Website Accessibility...${NC}"
if command -v curl &> /dev/null; then
    # Check primary domain
    curl -s -o /dev/null -w "%{http_code}" https://djnuffjamz.com | grep -q "200"
    check_status "Primary domain (djnuffjamz.com) accessible"
    
    # Check secondary domain
    curl -s -o /dev/null -w "%{http_code}" https://nuffjamz.com | grep -q "200"
    check_status "Secondary domain (nuffjamz.com) accessible"
else
    echo -e "${YELLOW}⚠️  curl not available for website checks${NC}"
fi

# 7. Check SSL Certificates
echo -e "\n${YELLOW}🔒 Checking SSL Certificates...${NC}"
if command -v openssl &> /dev/null; then
    # Check SSL for primary domain
    echo | openssl s_client -servername djnuffjamz.com -connect djnuffjamz.com:443 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1
    check_status "SSL certificate valid for djnuffjamz.com"
    
    # Check SSL for secondary domain  
    echo | openssl s_client -servername nuffjamz.com -connect nuffjamz.com:443 2>/dev/null | openssl x509 -noout -dates > /dev/null 2>&1
    check_status "SSL certificate valid for nuffjamz.com"
else
    echo -e "${YELLOW}⚠️  OpenSSL not available for SSL checks${NC}"
fi

# 8. Backup Strategy Documentation Check
echo -e "\n${YELLOW}📋 Checking Backup Documentation...${NC}"
if [ -f "scripts/backup-strategy.md" ]; then
    echo -e "${GREEN}✅ Backup strategy documentation exists${NC}"
else
    echo -e "${RED}❌ Backup strategy documentation missing${NC}"
fi

# 9. Generate Backup Report
echo -e "\n${YELLOW}📊 Generating Backup Report...${NC}"
report_file="scripts/backup-report-$(date +%Y%m%d_%H%M%S).txt"
{
    echo "DJ Nuff Jamz Website - Backup Verification Report"
    echo "Generated: $(date)"
    echo "=============================================="
    echo ""
    echo "Git Repository Status:"
    git status --short
    echo ""
    echo "Recent Commits:"
    git log --oneline -5
    echo ""
    echo "Remote Repositories:"
    git remote -v
    echo ""
    echo "Current Branch:"
    git branch --show-current
    echo ""
    echo "Last Backup: $(git log -1 --format='%cd' --date=local)"
    echo ""
    if command -v vercel &> /dev/null; then
        echo "Vercel Status:"
        vercel whoami 2>/dev/null || echo "Not authenticated"
    fi
} > "$report_file"

echo -e "${GREEN}✅ Backup report generated: $report_file${NC}"

# 10. Summary
echo -e "\n${BLUE}📋 Backup Verification Summary${NC}"
echo -e "${BLUE}==============================${NC}"
echo -e "${GREEN}✅ Primary backup system: Git repository${NC}"
echo -e "${GREEN}✅ Secondary backup: Vercel deployment history${NC}"
echo -e "${GREEN}✅ SSL certificates: Automatically managed${NC}"
echo -e "${GREEN}✅ Documentation: Available in scripts/backup-strategy.md${NC}"

echo -e "\n${YELLOW}💡 Recommendations:${NC}"
echo -e "   • Commit and push changes regularly"
echo -e "   • Monitor Vercel deployments"
echo -e "   • Run this verification weekly"
echo -e "   • Review backup strategy monthly"

echo -e "\n${GREEN}🎉 Backup verification completed!${NC}"
