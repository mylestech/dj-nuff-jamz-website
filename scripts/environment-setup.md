# DJ Nuff Jamz Website - Environment Setup

## Overview
Multi-environment deployment strategy for the DJ Nuff Jamz website using Vercel with proper separation of development, staging, and production environments.

## Environment Structure

### 🏗️ Development Environment
- **Branch**: `development`
- **Purpose**: Active development and feature testing
- **URL**: Auto-generated Vercel preview URLs
- **Caching**: Short cache times (5 minutes) for rapid iteration
- **Analytics**: Development tracking
- **Auto-deploy**: Every push to `development` branch

### 🧪 Staging Environment  
- **Branch**: `staging`
- **Purpose**: Pre-production testing and client review
- **URL**: Auto-generated Vercel preview URLs + custom staging domain (future)
- **Caching**: Medium cache times (1 hour) for realistic testing
- **Analytics**: Staging tracking separate from production
- **Auto-deploy**: Every push to `staging` branch

### 🚀 Production Environment
- **Branch**: `main`
- **Purpose**: Live website for end users
- **URLs**: 
  - Primary: https://djnuffjamz.com
  - Secondary: https://nuffjamz.com
- **Caching**: Long cache times (1 year for assets, optimized for performance)
- **Analytics**: Full production tracking
- **Auto-deploy**: Every push to `main` branch

## Branch Strategy

### Git Flow
```
main (production)
├── staging (pre-production testing)
└── development (active development)
    ├── feature/new-booking-system
    ├── feature/music-player
    └── hotfix/ssl-issue
```

### Deployment Flow
1. **Development** → Feature branches merge to `development`
2. **Testing** → `development` merges to `staging` for testing
3. **Release** → `staging` merges to `main` for production

### Branch Protection Rules
- **main**: Requires pull request reviews, status checks
- **staging**: Requires pull request reviews
- **development**: Direct pushes allowed for rapid development

## Environment Configuration

### Vercel Configuration Files
- `vercel.json` - Production environment (main branch)
- `vercel.staging.json` - Staging environment (staging branch)  
- `vercel.development.json` - Development environment (development branch)

### Environment Variables
| Variable | Development | Staging | Production |
|----------|-------------|---------|------------|
| NODE_ENV | development | staging | production |
| ENVIRONMENT | development | staging | production |
| ANALYTICS_ID | dev-analytics | staging-analytics | prod-analytics |
| DEBUG_MODE | true | true | false |
| CACHE_DURATION | 300 | 3600 | 31536000 |

### Cache Strategies
| Environment | CSS/JS | Images | HTML | Purpose |
|-------------|--------|--------|------|---------|
| Development | 5 min | 5 min | No cache | Rapid iteration |
| Staging | 1 hour | 1 hour | 5 min | Realistic testing |
| Production | 1 year | 1 month | 2-4 hours | Optimal performance |

## Deployment Workflows

### Automatic Deployments
```yaml
# GitHub Actions equivalent (Vercel handles this automatically)
on:
  push:
    branches: [main, staging, development]
  pull_request:
    branches: [main, staging]

environments:
  - name: production
    branch: main
    url: https://djnuffjamz.com
  - name: staging  
    branch: staging
    url: auto-generated
  - name: development
    branch: development
    url: auto-generated
```

### Manual Deployment Commands
```bash
# Deploy to production
vercel --prod

# Deploy to staging
git checkout staging
vercel

# Deploy to development
git checkout development
vercel
```

### Preview Deployments
- **Pull Requests**: Automatic preview deployments for all PRs
- **Feature Branches**: Manual deployment with `vercel`
- **Commit Previews**: Every commit gets a unique preview URL

## Environment-Specific Features

### Development Environment
- **Debug Mode**: Enabled for detailed logging
- **Hot Reloading**: Live server for local development
- **Source Maps**: Enabled for debugging
- **Error Boundaries**: Detailed error information
- **Performance**: Optimized for development speed

### Staging Environment
- **Client Review**: Stable environment for client feedback
- **Integration Testing**: Full feature testing
- **Performance Testing**: Production-like performance
- **User Acceptance**: Final testing before production
- **Analytics**: Separate tracking from production

### Production Environment
- **Performance**: Fully optimized for speed
- **Monitoring**: Comprehensive monitoring and alerting
- **Security**: Full security headers and SSL
- **Analytics**: Complete user tracking
- **Caching**: Aggressive caching for optimal performance

## Domain Configuration

### Production Domains
- **Primary**: djnuffjamz.com
- **Secondary**: nuffjamz.com
- **SSL**: Automatic via Vercel
- **CDN**: Vercel Edge Network

### Staging Domains (Future)
- **Staging**: staging.djnuffjamz.com
- **Preview**: preview.djnuffjamz.com
- **SSL**: Automatic via Vercel

### Development Domains
- **Auto-generated**: Vercel preview URLs
- **Local**: localhost:3000 (for local development)

## Monitoring & Analytics

### Environment-Specific Monitoring
```javascript
// Environment detection
const environment = process.env.ENVIRONMENT || 'production';

// Analytics configuration
const analyticsConfig = {
  development: { debug: true, sampleRate: 100 },
  staging: { debug: true, sampleRate: 50 },
  production: { debug: false, sampleRate: 10 }
};

// Error tracking
const errorConfig = {
  development: { logLevel: 'debug', reportErrors: false },
  staging: { logLevel: 'info', reportErrors: true },
  production: { logLevel: 'error', reportErrors: true }
};
```

### Performance Monitoring
- **Development**: Basic performance tracking
- **Staging**: Full performance monitoring for testing
- **Production**: Comprehensive monitoring with alerts

## Security Configuration

### Environment-Specific Security
| Security Feature | Development | Staging | Production |
|------------------|-------------|---------|------------|
| HTTPS | Optional | Required | Required |
| Security Headers | Basic | Full | Full |
| CSP | Relaxed | Strict | Strict |
| CORS | Permissive | Restricted | Restricted |
| Rate Limiting | Disabled | Enabled | Enabled |

### Access Control
- **Development**: Open access for development team
- **Staging**: Password protection or IP restriction (future)
- **Production**: Public access with security measures

## Deployment Commands

### Quick Reference
```bash
# Switch environments
git checkout development  # Development environment
git checkout staging      # Staging environment  
git checkout main         # Production environment

# Deploy current branch
vercel                    # Deploy to preview
vercel --prod            # Deploy to production (main branch only)

# Environment-specific deployments
vercel --local-config vercel.development.json  # Force dev config
vercel --local-config vercel.staging.json      # Force staging config
vercel --local-config vercel.json              # Force production config
```

### Deployment Checklist
- [ ] Code reviewed and approved
- [ ] Tests passing in development
- [ ] Staging deployment successful
- [ ] Client approval (if required)
- [ ] Performance metrics acceptable
- [ ] Security scan completed
- [ ] Backup created
- [ ] Monitoring alerts configured

## Rollback Procedures

### Automatic Rollback
- Vercel provides instant rollback via dashboard
- Previous deployments remain accessible
- DNS changes can be reverted quickly

### Manual Rollback
```bash
# Rollback via Vercel CLI
vercel rollback [deployment-url]

# Rollback via Git
git revert [commit-hash]
git push origin main
```

### Emergency Procedures
1. **Immediate**: Use Vercel dashboard to rollback
2. **Investigation**: Check monitoring and error logs
3. **Fix**: Apply hotfix to appropriate branch
4. **Deploy**: Push fix through normal deployment flow
5. **Verify**: Confirm fix resolves the issue

## Development Workflow

### Feature Development
1. Create feature branch from `development`
2. Develop and test locally
3. Push to feature branch (gets preview deployment)
4. Create PR to `development`
5. Review and merge to `development`
6. Test in development environment

### Release Process
1. Merge `development` to `staging`
2. Test in staging environment
3. Client review and approval
4. Merge `staging` to `main`
5. Deploy to production
6. Monitor and verify

### Hotfix Process
1. Create hotfix branch from `main`
2. Apply critical fix
3. Test in development environment
4. Deploy directly to `main` (emergency)
5. Backport to `staging` and `development`

## Environment Variables Management

### Vercel Environment Variables
```bash
# Set environment-specific variables
vercel env add ANALYTICS_ID production
vercel env add ANALYTICS_ID staging  
vercel env add ANALYTICS_ID development

# List environment variables
vercel env ls

# Remove environment variables
vercel env rm ANALYTICS_ID production
```

### Local Development
```bash
# .env.local (not committed to Git)
NODE_ENV=development
ENVIRONMENT=development
DEBUG_MODE=true
ANALYTICS_ID=dev-analytics
```

## Performance Optimization

### Environment-Specific Optimizations
- **Development**: Fast builds, source maps, hot reloading
- **Staging**: Production-like builds with debugging enabled
- **Production**: Fully optimized builds, minification, compression

### Build Configurations
```json
{
  "scripts": {
    "dev": "NODE_ENV=development npm run build:dev",
    "staging": "NODE_ENV=staging npm run build:staging", 
    "build": "NODE_ENV=production npm run build:prod",
    "build:dev": "tailwindcss -i ./src/styles/main.css -o ./public/css/style.css --watch",
    "build:staging": "tailwindcss -i ./src/styles/main.css -o ./public/css/style.css",
    "build:prod": "tailwindcss -i ./src/styles/main.css -o ./public/css/style.css --minify"
  }
}
```

## Troubleshooting

### Common Issues
1. **Environment Variable Not Set**: Check Vercel dashboard
2. **Wrong Configuration**: Verify correct vercel.json file
3. **Build Failures**: Check build logs in Vercel
4. **Domain Issues**: Verify DNS and SSL settings
5. **Performance Issues**: Check caching configuration

### Debug Commands
```bash
# Check current environment
vercel env ls

# View deployment logs
vercel logs [deployment-url]

# Test local build
npm run build && npm run start

# Verify configuration
vercel inspect [deployment-url]
```

## Implementation Status

- [x] Create development, staging, and production branches
- [x] Configure environment-specific Vercel configurations
- [x] Set up automatic deployments for each branch
- [x] Document environment setup and workflows
- [ ] Configure environment-specific domains
- [ ] Set up environment variables in Vercel
- [ ] Implement environment-specific monitoring
- [ ] Test deployment workflows
- [ ] Set up branch protection rules

## Next Steps

1. **Configure Vercel Projects** for each environment
2. **Set up environment variables** in Vercel dashboard
3. **Test deployment workflows** across all environments
4. **Configure branch protection** rules in GitHub
5. **Set up staging domain** (optional)
6. **Implement environment-specific** monitoring
7. **Create deployment scripts** for automation
8. **Train team** on new workflow

---

**Last Updated**: $(date)
**Next Review**: $(date -d "+1 month")
**Responsible**: Development Team
