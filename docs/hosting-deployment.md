# Hosting & Deployment Documentation

## 🚀 Vercel Hosting Platform

### Platform Overview
- **Provider**: Vercel (vercel.com)
- **Plan**: Pro Plan (for custom domains and advanced features)
- **Account**: croaks-projects-209ddc18
- **Project**: dj-nuff-jamz-website
- **Node Version**: 22.x (latest LTS)

### Key Features
- ✅ **Global Edge Network**: 100+ edge locations worldwide
- ✅ **Automatic SSL**: Free SSL certificates with auto-renewal
- ✅ **Git Integration**: Automatic deployments from GitHub
- ✅ **Preview Deployments**: Unique URLs for every commit
- ✅ **Analytics**: Built-in performance and usage analytics
- ✅ **Edge Functions**: Serverless functions at the edge (future use)

## 🌐 Domain Configuration

### Primary Domains
| Domain | Type | Status | SSL | CDN |
|--------|------|--------|-----|-----|
| djnuffjamz.com | Primary | ✅ Active | ✅ Auto | ✅ Vercel Edge |
| nuffjamz.com | Secondary | ✅ Active | ✅ Auto | ✅ Vercel Edge |

### DNS Configuration
```
# DNS Records at NameCheap
Type: A       Host: @       Value: 76.76.21.21       TTL: Auto
Type: A       Host: www     Value: 76.76.21.21       TTL: Auto
Type: CNAME   Host: *       Value: cname.vercel-dns.com   TTL: Auto
```

### SSL Certificate Management
- **Provider**: Vercel (Let's Encrypt)
- **Type**: Domain Validated (DV)
- **Renewal**: Automatic (30 days before expiration)
- **Grade**: A+ (SSL Labs rating)
- **Protocols**: TLS 1.2, TLS 1.3

## 🏗️ Environment Architecture

### Environment Structure
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ Branch: develop │    │ Branch: staging │    │ Branch: main    │
│ Auto-deploy: ✅  │    │ Auto-deploy: ✅  │    │ Auto-deploy: ✅  │
│ Cache: 5min     │    │ Cache: 1hr      │    │ Cache: 1yr      │
│ Debug: ON       │    │ Debug: ON       │    │ Debug: OFF      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Environment-Specific Configurations

#### Production Environment
- **Configuration File**: `vercel.json`
- **Branch**: `main`
- **URLs**: djnuffjamz.com, nuffjamz.com
- **Caching**: Aggressive (1 year for assets)
- **Analytics**: Full tracking enabled
- **Error Reporting**: Production mode
- **Security Headers**: All enabled

#### Staging Environment
- **Configuration File**: `vercel.staging.json`
- **Branch**: `staging`
- **URLs**: Auto-generated preview URLs
- **Caching**: Medium (1 hour)
- **Analytics**: Staging tracking
- **Error Reporting**: Debug mode
- **Security Headers**: All enabled

#### Development Environment
- **Configuration File**: `vercel.development.json`
- **Branch**: `development`
- **URLs**: Auto-generated preview URLs
- **Caching**: Minimal (5 minutes)
- **Analytics**: Debug tracking
- **Error Reporting**: Full debug mode
- **Security Headers**: Basic set

## ⚙️ Deployment Configuration

### Vercel Configuration Files

#### Production (`vercel.json`)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "public",
  "env": {
    "NODE_ENV": "production",
    "ENVIRONMENT": "production"
  },
  "headers": [
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "github": {
    "enabled": true,
    "autoAlias": false
  }
}
```

#### Staging (`vercel.staging.json`)
```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "public",
  "env": {
    "NODE_ENV": "staging",
    "ENVIRONMENT": "staging"
  },
  "headers": [
    {
      "source": "/css/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=3600"
        }
      ]
    }
  ],
  "github": {
    "enabled": true,
    "autoAlias": true
  }
}
```

### Build Configuration
```json
{
  "scripts": {
    "build": "npm run build:css:prod && npm run copy:assets",
    "build:dev": "npm run build:css:dev && npm run copy:assets",
    "build:staging": "npm run build:css:staging && npm run copy:assets",
    "build:css:prod": "tailwindcss -i ./src/styles/main.css -o ./public/css/style.css --minify",
    "build:css:staging": "tailwindcss -i ./src/styles/main.css -o ./public/css/style.css",
    "build:css:dev": "tailwindcss -i ./src/styles/main.css -o ./public/css/style.css"
  }
}
```

## 🔄 Deployment Workflows

### Automatic Deployments
```yaml
# Deployment Triggers
Production:
  - Push to main branch
  - Manual deployment via Vercel CLI
  - Vercel dashboard deployment

Staging:
  - Push to staging branch
  - Pull request to main branch
  - Manual deployment

Development:
  - Push to development branch
  - Push to any feature branch
  - Manual deployment
```

### Manual Deployment Commands
```bash
# Production Deployment
./scripts/deploy.sh production --build

# Staging Deployment
./scripts/deploy.sh staging --build

# Development Deployment
./scripts/deploy.sh development --build

# Preview Deployment
./scripts/deploy.sh preview

# Using npm scripts
npm run deploy:prod      # Production
npm run deploy:staging   # Staging
npm run deploy:dev       # Development
npm run preview          # Preview
```

### Deployment Script Features
- ✅ **Environment Validation**: Checks branch compatibility
- ✅ **Prerequisites Check**: Verifies CLI and authentication
- ✅ **Build Integration**: Optional build before deployment
- ✅ **Dry Run Mode**: Test deployments without executing
- ✅ **Force Deploy**: Override safety checks
- ✅ **Status Reporting**: Detailed deployment feedback

## 📊 Performance Configuration

### Caching Strategy
| Environment | CSS/JS | Images | HTML | Purpose |
|-------------|--------|--------|------|---------|
| Production | 1 year | 1 month | 2-4 hours | Maximum performance |
| Staging | 1 hour | 1 hour | 5 minutes | Realistic testing |
| Development | 5 minutes | 5 minutes | No cache | Rapid iteration |

### Security Headers
```javascript
// Applied to all environments
{
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY", 
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}

// Production additional headers
{
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'"
}
```

### Build Optimization
- **CSS Minification**: Production builds only
- **Asset Optimization**: Automatic image optimization
- **Gzip Compression**: Enabled by default
- **Brotli Compression**: Available for supported browsers

## 🔍 Monitoring & Analytics

### Vercel Analytics
- **Real User Monitoring**: Performance metrics from actual users
- **Core Web Vitals**: LCP, FID, CLS, FCP, TTFB tracking
- **Geographic Distribution**: User location analytics
- **Device Analytics**: Desktop vs mobile usage
- **Page Performance**: Individual page metrics

### Custom Analytics Integration
```javascript
// Vercel Analytics Integration
window.va = window.va || function () { 
  (window.vaq = window.vaq || []).push(arguments); 
};

// Web Vitals Tracking
import('https://unpkg.com/web-vitals@3/dist/web-vitals.js')
  .then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
    onCLS(sendToAnalytics);
    onFID(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  });
```

### Deployment Monitoring
- **Build Status**: Success/failure notifications
- **Deployment Duration**: Build and deployment time tracking
- **Error Tracking**: Build and runtime error monitoring
- **Performance Impact**: Before/after deployment comparisons

## 🚨 Incident Response

### Deployment Rollback
```bash
# Via Vercel CLI
vercel rollback [deployment-url]

# Via Git (emergency)
git revert [commit-hash]
git push origin main

# Via Vercel Dashboard
# Navigate to deployments → Select previous → Promote to Production
```

### Emergency Procedures
1. **Immediate Response**
   - Use Vercel dashboard for instant rollback
   - Check monitoring alerts and error logs
   - Notify team of incident

2. **Investigation**
   - Review deployment logs
   - Check performance metrics
   - Identify root cause

3. **Resolution**
   - Apply hotfix to appropriate branch
   - Test fix in staging environment
   - Deploy fix to production
   - Monitor for resolution

4. **Post-Incident**
   - Document incident and resolution
   - Update procedures if needed
   - Conduct team retrospective

## 🔧 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check build logs
vercel logs [deployment-url]

# Local build test
npm run build

# Clear cache and rebuild
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Domain Issues
```bash
# Check DNS propagation
nslookup djnuffjamz.com

# Verify SSL certificate
openssl s_client -servername djnuffjamz.com -connect djnuffjamz.com:443

# Check domain configuration
vercel domains inspect djnuffjamz.com
```

#### Performance Issues
```bash
# Run performance audit
./scripts/performance-audit.sh

# Check caching headers
curl -I https://djnuffjamz.com

# Analyze bundle size
npm run build && ls -la public/css/
```

### Debug Commands
```bash
# Vercel CLI debugging
vercel --debug

# Check environment variables
vercel env ls

# Inspect deployment
vercel inspect [deployment-url]

# View function logs
vercel logs --follow
```

## 📈 Performance Metrics

### Current Performance Baselines
- **Lighthouse Score**: 95+ (Performance)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

### Optimization Strategies
- **Image Optimization**: WebP format with fallbacks
- **CSS Optimization**: Minification and critical CSS
- **JavaScript Optimization**: Code splitting and lazy loading
- **Caching Strategy**: Aggressive caching for static assets
- **CDN Utilization**: Global edge network distribution

## 🔮 Future Enhancements

### Planned Improvements
- [ ] **Edge Functions**: Serverless functions for dynamic content
- [ ] **A/B Testing**: Built-in testing framework
- [ ] **Advanced Analytics**: Custom event tracking
- [ ] **Multi-region Deployment**: Additional geographic regions
- [ ] **Enhanced Security**: Advanced DDoS protection

### Scalability Considerations
- **Traffic Handling**: Auto-scaling for traffic spikes
- **Database Integration**: Serverless database connections
- **API Integration**: RESTful API endpoints
- **Microservices**: Service-oriented architecture

---

**Last Updated**: $(date)  
**Maintained By**: Development Team  
**Next Review**: $(date -d "+1 month")

For deployment issues or questions, refer to the troubleshooting section or contact the development team.
