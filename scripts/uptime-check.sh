#!/bin/bash

# DJ Nuff Jamz Website - Uptime Monitoring Script
# Checks website availability and response times

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAINS=("djnuffjamz.com" "nuffjamz.com")
TIMEOUT=10
MAX_RESPONSE_TIME=5.0
LOG_FILE="scripts/uptime-log-$(date +%Y%m%d).txt"

echo -e "${BLUE}🌐 DJ Nuff Jamz Website - Uptime Check${NC}"
echo -e "${BLUE}=====================================${NC}"
echo -e "Timestamp: $(date)"
echo ""

# Function to check domain
check_domain() {
    local domain=$1
    local protocol=$2
    local url="${protocol}://${domain}"
    
    echo -e "${YELLOW}Checking ${url}...${NC}"
    
    # Perform the check
    response=$(curl -s -o /dev/null -w "%{http_code},%{time_total},%{time_connect},%{time_starttransfer}" \
               --max-time $TIMEOUT \
               --connect-timeout 5 \
               "$url" 2>/dev/null || echo "000,0,0,0")
    
    # Parse response
    http_code=$(echo $response | cut -d',' -f1)
    total_time=$(echo $response | cut -d',' -f2)
    connect_time=$(echo $response | cut -d',' -f3)
    ttfb=$(echo $response | cut -d',' -f4)
    
    # Convert times to milliseconds for display
    total_ms=$(echo "$total_time * 1000" | bc -l 2>/dev/null | cut -d'.' -f1)
    connect_ms=$(echo "$connect_time * 1000" | bc -l 2>/dev/null | cut -d'.' -f1)
    ttfb_ms=$(echo "$ttfb * 1000" | bc -l 2>/dev/null | cut -d'.' -f1)
    
    # Determine status
    if [ "$http_code" = "200" ]; then
        # Check response time
        if (( $(echo "$total_time > $MAX_RESPONSE_TIME" | bc -l) )); then
            echo -e "  ${YELLOW}⚠️  SLOW: HTTP $http_code - ${total_ms}ms (>${MAX_RESPONSE_TIME}s)${NC}"
            status="SLOW"
        else
            echo -e "  ${GREEN}✅ OK: HTTP $http_code - ${total_ms}ms${NC}"
            status="OK"
        fi
        echo -e "     Connect: ${connect_ms}ms | TTFB: ${ttfb_ms}ms"
    elif [ "$http_code" = "000" ]; then
        echo -e "  ${RED}❌ TIMEOUT: No response within ${TIMEOUT}s${NC}"
        status="TIMEOUT"
    elif [ "$http_code" -ge 300 ] && [ "$http_code" -lt 400 ]; then
        echo -e "  ${YELLOW}↗️  REDIRECT: HTTP $http_code - ${total_ms}ms${NC}"
        status="REDIRECT"
    else
        echo -e "  ${RED}❌ ERROR: HTTP $http_code - ${total_ms}ms${NC}"
        status="ERROR"
    fi
    
    # Log result
    echo "$(date '+%Y-%m-%d %H:%M:%S'),$url,$http_code,$total_ms,$connect_ms,$ttfb_ms,$status" >> "$LOG_FILE"
    
    return 0
}

# Function to check SSL certificate
check_ssl() {
    local domain=$1
    
    echo -e "${YELLOW}Checking SSL certificate for ${domain}...${NC}"
    
    # Get certificate expiration date
    if command -v openssl &> /dev/null; then
        cert_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | \
                   openssl x509 -noout -dates 2>/dev/null || echo "")
        
        if [ -n "$cert_info" ]; then
            expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d'=' -f2)
            if [ -n "$expiry_date" ]; then
                # Convert to epoch time for comparison
                expiry_epoch=$(date -d "$expiry_date" +%s 2>/dev/null || echo "0")
                current_epoch=$(date +%s)
                days_until_expiry=$(( (expiry_epoch - current_epoch) / 86400 ))
                
                if [ $days_until_expiry -gt 30 ]; then
                    echo -e "  ${GREEN}✅ SSL valid for $days_until_expiry days${NC}"
                elif [ $days_until_expiry -gt 7 ]; then
                    echo -e "  ${YELLOW}⚠️  SSL expires in $days_until_expiry days${NC}"
                else
                    echo -e "  ${RED}❌ SSL expires in $days_until_expiry days!${NC}"
                fi
            else
                echo -e "  ${YELLOW}⚠️  Could not parse SSL expiry date${NC}"
            fi
        else
            echo -e "  ${RED}❌ Could not retrieve SSL certificate${NC}"
        fi
    else
        echo -e "  ${YELLOW}⚠️  OpenSSL not available for SSL check${NC}"
    fi
}

# Create log file header if it doesn't exist
if [ ! -f "$LOG_FILE" ]; then
    echo "timestamp,url,http_code,response_time_ms,connect_time_ms,ttfb_ms,status" > "$LOG_FILE"
fi

# Check all domains
for domain in "${DOMAINS[@]}"; do
    echo -e "\n${BLUE}🔍 Checking domain: $domain${NC}"
    
    # Check HTTPS
    check_domain "$domain" "https"
    
    # Check SSL certificate
    check_ssl "$domain"
    
    echo ""
done

# Summary
echo -e "${BLUE}📊 Summary${NC}"
echo -e "${BLUE}=========${NC}"

# Count results from current run
current_time=$(date '+%Y-%m-%d %H:%M')
ok_count=$(grep "$current_time" "$LOG_FILE" 2>/dev/null | grep -c ",OK$" || echo "0")
error_count=$(grep "$current_time" "$LOG_FILE" 2>/dev/null | grep -E ",(ERROR|TIMEOUT)$" | wc -l || echo "0")
slow_count=$(grep "$current_time" "$LOG_FILE" 2>/dev/null | grep -c ",SLOW$" || echo "0")

echo -e "✅ Successful checks: $ok_count"
echo -e "⚠️  Slow responses: $slow_count"
echo -e "❌ Failed checks: $error_count"

# Overall status
if [ "$error_count" -gt 0 ]; then
    echo -e "\n${RED}🚨 ALERT: Some services are down!${NC}"
    exit 1
elif [ "$slow_count" -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  WARNING: Some services are responding slowly${NC}"
    exit 2
else
    echo -e "\n${GREEN}🎉 All services are operational${NC}"
    exit 0
fi
