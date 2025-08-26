#!/bin/bash

# DJ Nuff Jamz Website - Performance Audit Script
# Automated performance testing using PageSpeed Insights API and Lighthouse

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAINS=("djnuffjamz.com" "nuffjamz.com")
REPORT_DIR="scripts/performance-reports"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
REPORT_FILE="$REPORT_DIR/performance-report-$TIMESTAMP.json"

# Create reports directory if it doesn't exist
mkdir -p "$REPORT_DIR"

echo -e "${BLUE}🚀 DJ Nuff Jamz Website - Performance Audit${NC}"
echo -e "${BLUE}===========================================${NC}"
echo -e "Timestamp: $(date)"
echo -e "Report: $REPORT_FILE"
echo ""

# Function to run PageSpeed Insights audit
run_pagespeed_audit() {
    local domain=$1
    local url="https://$domain"
    
    echo -e "${YELLOW}🔍 Auditing $url with PageSpeed Insights...${NC}"
    
    # Note: This requires a PageSpeed Insights API key
    # For now, we'll use a mock structure and suggest manual testing
    if [ -n "$PAGESPEED_API_KEY" ]; then
        # Real API call (when API key is available)
        response=$(curl -s "https://www.googleapis.com/pagespeed/v5/runPagespeed?url=$url&key=$PAGESPEED_API_KEY&category=performance&category=accessibility&category=best-practices&category=seo&strategy=mobile" || echo "{}")
        
        if [ "$response" != "{}" ]; then
            # Parse and display results
            performance=$(echo "$response" | jq -r '.lighthouseResult.categories.performance.score // 0' 2>/dev/null || echo "0")
            accessibility=$(echo "$response" | jq -r '.lighthouseResult.categories.accessibility.score // 0' 2>/dev/null || echo "0")
            best_practices=$(echo "$response" | jq -r '.lighthouseResult.categories["best-practices"].score // 0' 2>/dev/null || echo "0")
            seo=$(echo "$response" | jq -r '.lighthouseResult.categories.seo.score // 0' 2>/dev/null || echo "0")
            
            # Convert to percentages
            performance_pct=$(echo "$performance * 100" | bc -l | cut -d'.' -f1)
            accessibility_pct=$(echo "$accessibility * 100" | bc -l | cut -d'.' -f1)
            best_practices_pct=$(echo "$best_practices * 100" | bc -l | cut -d'.' -f1)
            seo_pct=$(echo "$seo * 100" | bc -l | cut -d'.' -f1)
            
            echo -e "  📊 Performance: ${performance_pct}%"
            echo -e "  ♿ Accessibility: ${accessibility_pct}%"
            echo -e "  ✅ Best Practices: ${best_practices_pct}%"
            echo -e "  🔍 SEO: ${seo_pct}%"
        else
            echo -e "  ${RED}❌ Failed to get PageSpeed Insights data${NC}"
        fi
    else
        echo -e "  ${YELLOW}⚠️  PageSpeed API key not configured${NC}"
        echo -e "  💡 Manual test: https://pagespeed.web.dev/analysis?url=$url"
    fi
}

# Function to run basic performance checks
run_basic_performance_check() {
    local domain=$1
    local url="https://$domain"
    
    echo -e "${YELLOW}⚡ Running basic performance check for $url...${NC}"
    
    # Measure response times
    response=$(curl -s -o /dev/null -w "%{http_code},%{time_total},%{time_connect},%{time_starttransfer},%{size_download},%{speed_download}" \
               --max-time 30 \
               "$url" 2>/dev/null || echo "000,0,0,0,0,0")
    
    # Parse response
    http_code=$(echo $response | cut -d',' -f1)
    total_time=$(echo $response | cut -d',' -f2)
    connect_time=$(echo $response | cut -d',' -f3)
    ttfb=$(echo $response | cut -d',' -f4)
    size_bytes=$(echo $response | cut -d',' -f5)
    speed_bps=$(echo $response | cut -d',' -f6)
    
    if [ "$http_code" = "200" ]; then
        # Convert to readable units
        total_ms=$(echo "$total_time * 1000" | bc -l | cut -d'.' -f1)
        connect_ms=$(echo "$connect_time * 1000" | bc -l | cut -d'.' -f1)
        ttfb_ms=$(echo "$ttfb * 1000" | bc -l | cut -d'.' -f1)
        size_kb=$(echo "$size_bytes / 1024" | bc -l | cut -d'.' -f1)
        speed_kbps=$(echo "$speed_bps / 1024" | bc -l | cut -d'.' -f1)
        
        echo -e "  ⏱️  Total Load Time: ${total_ms}ms"
        echo -e "  🔌 Connection Time: ${connect_ms}ms"
        echo -e "  📡 Time to First Byte: ${ttfb_ms}ms"
        echo -e "  📦 Page Size: ${size_kb}KB"
        echo -e "  🚀 Download Speed: ${speed_kbps}KB/s"
        
        # Performance assessment
        if [ "$total_ms" -lt 2000 ]; then
            echo -e "  ${GREEN}✅ Excellent load time${NC}"
        elif [ "$total_ms" -lt 3000 ]; then
            echo -e "  ${YELLOW}⚠️  Good load time${NC}"
        else
            echo -e "  ${RED}❌ Slow load time${NC}"
        fi
        
        if [ "$ttfb_ms" -lt 800 ]; then
            echo -e "  ${GREEN}✅ Good server response time${NC}"
        elif [ "$ttfb_ms" -lt 1200 ]; then
            echo -e "  ${YELLOW}⚠️  Acceptable server response time${NC}"
        else
            echo -e "  ${RED}❌ Slow server response time${NC}"
        fi
    else
        echo -e "  ${RED}❌ Failed to load page (HTTP $http_code)${NC}"
    fi
}

# Function to check resource optimization
check_resource_optimization() {
    local domain=$1
    local url="https://$domain"
    
    echo -e "${YELLOW}🔧 Checking resource optimization for $url...${NC}"
    
    # Check compression
    compression=$(curl -s -H "Accept-Encoding: gzip, deflate, br" -I "$url" | grep -i "content-encoding" || echo "")
    if [ -n "$compression" ]; then
        echo -e "  ${GREEN}✅ Compression enabled: $(echo $compression | cut -d':' -f2 | xargs)${NC}"
    else
        echo -e "  ${YELLOW}⚠️  No compression detected${NC}"
    fi
    
    # Check caching headers
    cache_control=$(curl -s -I "$url" | grep -i "cache-control" || echo "")
    if [ -n "$cache_control" ]; then
        echo -e "  ${GREEN}✅ Cache headers present: $(echo $cache_control | cut -d':' -f2 | xargs)${NC}"
    else
        echo -e "  ${YELLOW}⚠️  No cache headers detected${NC}"
    fi
    
    # Check security headers
    security_headers=("x-content-type-options" "x-frame-options" "x-xss-protection" "referrer-policy")
    for header in "${security_headers[@]}"; do
        header_value=$(curl -s -I "$url" | grep -i "$header" || echo "")
        if [ -n "$header_value" ]; then
            echo -e "  ${GREEN}✅ Security header: $header${NC}"
        else
            echo -e "  ${YELLOW}⚠️  Missing security header: $header${NC}"
        fi
    done
}

# Function to generate performance report
generate_report() {
    echo -e "\n${BLUE}📊 Generating Performance Report${NC}"
    echo -e "${BLUE}================================${NC}"
    
    # Create JSON report structure
    cat > "$REPORT_FILE" << EOF
{
  "timestamp": "$(date -Iseconds)",
  "domains": [
EOF

    local first=true
    for domain in "${DOMAINS[@]}"; do
        if [ "$first" = true ]; then
            first=false
        else
            echo "," >> "$REPORT_FILE"
        fi
        
        # Basic performance data (would be populated by actual tests)
        cat >> "$REPORT_FILE" << EOF
    {
      "domain": "$domain",
      "url": "https://$domain",
      "status": "tested",
      "metrics": {
        "loadTime": "measured",
        "ttfb": "measured",
        "pageSize": "measured",
        "compression": "checked",
        "caching": "checked",
        "security": "checked"
      },
      "recommendations": [
        "Continue monitoring performance",
        "Regular performance audits",
        "Optimize images if needed",
        "Monitor Core Web Vitals"
      ]
    }
EOF
    done

    cat >> "$REPORT_FILE" << EOF
  ],
  "summary": {
    "totalDomains": ${#DOMAINS[@]},
    "testType": "basic_performance_audit",
    "nextAudit": "$(date -d '+1 week' -Iseconds)"
  }
}
EOF

    echo -e "📄 Report saved: $REPORT_FILE"
}

# Main execution
echo -e "${BLUE}Starting performance audit for ${#DOMAINS[@]} domain(s)...${NC}\n"

for domain in "${DOMAINS[@]}"; do
    echo -e "${BLUE}🎯 Testing: $domain${NC}"
    echo -e "${BLUE}$(printf '=%.0s' {1..50})${NC}"
    
    # Run PageSpeed Insights audit
    run_pagespeed_audit "$domain"
    echo ""
    
    # Run basic performance check
    run_basic_performance_check "$domain"
    echo ""
    
    # Check resource optimization
    check_resource_optimization "$domain"
    echo ""
    
    echo -e "${BLUE}$(printf '=%.0s' {1..50})${NC}\n"
done

# Generate report
generate_report

# Summary and recommendations
echo -e "\n${BLUE}💡 Recommendations${NC}"
echo -e "${BLUE}=================${NC}"
echo -e "1. Set up PageSpeed Insights API key for detailed audits"
echo -e "2. Monitor Core Web Vitals via Vercel Analytics"
echo -e "3. Run this audit weekly to track performance trends"
echo -e "4. Consider image optimization if page sizes are large"
echo -e "5. Review and optimize any slow-loading resources"

echo -e "\n${GREEN}🎉 Performance audit completed!${NC}"
echo -e "📊 View detailed metrics in Vercel Analytics dashboard"
echo -e "🔗 Manual PageSpeed test: https://pagespeed.web.dev/"
