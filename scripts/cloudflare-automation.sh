#!/bin/bash

# Cloudflare CDN Setup Automation Script
# Automates Cloudflare configuration using API calls

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="djnuffjamz.com"
VERCEL_IP="76.76.19.61"
VERCEL_CNAME="cname.vercel-dns.com"

echo -e "${BLUE}🚀 Cloudflare CDN Setup Automation${NC}"
echo -e "${BLUE}===================================${NC}\n"

# Check if required environment variables are set
check_env_vars() {
    if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
        echo -e "${RED}❌ Error: CLOUDFLARE_API_TOKEN environment variable not set${NC}"
        echo -e "${YELLOW}💡 Get your API token from: https://dash.cloudflare.com/profile/api-tokens${NC}"
        echo -e "${YELLOW}   Create token with Zone:Edit permissions${NC}"
        exit 1
    fi
    
    if [ -z "$CLOUDFLARE_ZONE_ID" ]; then
        echo -e "${RED}❌ Error: CLOUDFLARE_ZONE_ID environment variable not set${NC}"
        echo -e "${YELLOW}💡 Find your Zone ID in Cloudflare dashboard for ${DOMAIN}${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Environment variables configured${NC}"
}

# Test Cloudflare API connection
test_api_connection() {
    echo -e "\n${BLUE}🔌 Testing Cloudflare API connection...${NC}"
    
    response=$(curl -s -X GET "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json")
    
    if echo "$response" | grep -q '"success":true'; then
        echo -e "${GREEN}✅ API connection successful${NC}"
        domain_name=$(echo "$response" | jq -r '.result.name')
        echo -e "${GREEN}📍 Connected to zone: ${domain_name}${NC}"
    else
        echo -e "${RED}❌ API connection failed${NC}"
        echo -e "${RED}Response: $response${NC}"
        exit 1
    fi
}

# Create DNS records
create_dns_records() {
    echo -e "\n${BLUE}🌐 Creating DNS records...${NC}"
    
    # A record for root domain
    echo -e "${YELLOW}Creating A record for @ -> ${VERCEL_IP}${NC}"
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{
            "type": "A",
            "name": "@",
            "content": "'${VERCEL_IP}'",
            "ttl": 1,
            "proxied": true,
            "comment": "Primary domain pointing to Vercel"
        }' | jq -r '.success'
    
    # A record for www subdomain
    echo -e "${YELLOW}Creating A record for www -> ${VERCEL_IP}${NC}"
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{
            "type": "A",
            "name": "www",
            "content": "'${VERCEL_IP}'",
            "ttl": 1,
            "proxied": true,
            "comment": "WWW subdomain pointing to Vercel"
        }' | jq -r '.success'
    
    echo -e "${GREEN}✅ DNS records created${NC}"
}

# Configure page rules
create_page_rules() {
    echo -e "\n${BLUE}📋 Creating page rules...${NC}"
    
    # CSS caching rule
    echo -e "${YELLOW}Creating CSS caching rule${NC}"
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/pagerules" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{
            "targets": [{"target": "url", "constraint": {"operator": "matches", "value": "'${DOMAIN}'/css/*"}}],
            "actions": [
                {"id": "cache_level", "value": "cache_everything"},
                {"id": "edge_cache_ttl", "value": 31536000},
                {"id": "browser_cache_ttl", "value": 31536000}
            ],
            "priority": 1,
            "status": "active"
        }' | jq -r '.success'
    
    # Assets caching rule
    echo -e "${YELLOW}Creating assets caching rule${NC}"
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/pagerules" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{
            "targets": [{"target": "url", "constraint": {"operator": "matches", "value": "'${DOMAIN}'/assets/*"}}],
            "actions": [
                {"id": "cache_level", "value": "cache_everything"},
                {"id": "edge_cache_ttl", "value": 2592000},
                {"id": "browser_cache_ttl", "value": 2592000}
            ],
            "priority": 2,
            "status": "active"
        }' | jq -r '.success'
    
    # HTML caching rule
    echo -e "${YELLOW}Creating HTML caching rule${NC}"
    curl -s -X POST "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/pagerules" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{
            "targets": [{"target": "url", "constraint": {"operator": "matches", "value": "'${DOMAIN}'/*"}}],
            "actions": [
                {"id": "cache_level", "value": "cache_everything"},
                {"id": "edge_cache_ttl", "value": 7200},
                {"id": "browser_cache_ttl", "value": 14400}
            ],
            "priority": 3,
            "status": "active"
        }' | jq -r '.success'
    
    echo -e "${GREEN}✅ Page rules configured${NC}"
}

# Configure performance settings
configure_performance() {
    echo -e "\n${BLUE}⚡ Configuring performance settings...${NC}"
    
    # Enable minification
    echo -e "${YELLOW}Enabling CSS/JS/HTML minification${NC}"
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/minify" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{
            "value": {
                "css": "on",
                "html": "on",
                "js": "on"
            }
        }' | jq -r '.success'
    
    # Enable Brotli compression
    echo -e "${YELLOW}Enabling Brotli compression${NC}"
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/brotli" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -r '.success'
    
    # Enable Rocket Loader
    echo -e "${YELLOW}Enabling Rocket Loader${NC}"
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/rocket_loader" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -r '.success'
    
    echo -e "${GREEN}✅ Performance settings configured${NC}"
}

# Configure security settings
configure_security() {
    echo -e "\n${BLUE}🔒 Configuring security settings...${NC}"
    
    # Set SSL mode to Full (strict)
    echo -e "${YELLOW}Setting SSL mode to Full (strict)${NC}"
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/ssl" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"value": "full"}' | jq -r '.success'
    
    # Enable Always Use HTTPS
    echo -e "${YELLOW}Enabling Always Use HTTPS${NC}"
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/always_use_https" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"value": "on"}' | jq -r '.success'
    
    # Set minimum TLS version
    echo -e "${YELLOW}Setting minimum TLS version to 1.2${NC}"
    curl -s -X PATCH "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/settings/min_tls_version" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data '{"value": "1.2"}' | jq -r '.success'
    
    echo -e "${GREEN}✅ Security settings configured${NC}"
}

# Test the setup
test_setup() {
    echo -e "\n${BLUE}🧪 Testing CDN setup...${NC}"
    
    echo -e "${YELLOW}Running performance test...${NC}"
    if command -v node &> /dev/null; then
        node scripts/test-cloudflare-performance.js
    else
        echo -e "${YELLOW}Node.js not found, skipping automated performance test${NC}"
        echo -e "${YELLOW}Manual test: Open https://${DOMAIN} and check CF-Ray header${NC}"
    fi
}

# Main execution
main() {
    echo -e "${BLUE}Starting Cloudflare CDN setup for ${DOMAIN}...${NC}\n"
    
    # Check dependencies
    if ! command -v curl &> /dev/null; then
        echo -e "${RED}❌ curl is required but not installed${NC}"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        echo -e "${RED}❌ jq is required but not installed${NC}"
        echo -e "${YELLOW}Install with: brew install jq (macOS) or apt-get install jq (Ubuntu)${NC}"
        exit 1
    fi
    
    # Run setup steps
    check_env_vars
    test_api_connection
    create_dns_records
    create_page_rules
    configure_performance
    configure_security
    
    echo -e "\n${GREEN}🎉 Cloudflare CDN setup completed successfully!${NC}"
    echo -e "${GREEN}📊 DNS propagation may take 24-48 hours${NC}"
    echo -e "${GREEN}🔍 Monitor setup at: https://dash.cloudflare.com${NC}"
    
    test_setup
}

# Show usage if --help or -h
if [[ "$1" == "--help" || "$1" == "-h" ]]; then
    echo "Cloudflare CDN Setup Automation"
    echo "Usage: $0"
    echo ""
    echo "Required environment variables:"
    echo "  CLOUDFLARE_API_TOKEN - Your Cloudflare API token"
    echo "  CLOUDFLARE_ZONE_ID   - Zone ID for ${DOMAIN}"
    echo ""
    echo "Example:"
    echo "  export CLOUDFLARE_API_TOKEN='your-token-here'"
    echo "  export CLOUDFLARE_ZONE_ID='your-zone-id-here'"
    echo "  $0"
    exit 0
fi

# Run main function
main "$@"
