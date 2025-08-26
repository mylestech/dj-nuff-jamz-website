# Repository Structure & Git Strategy

## 📁 Repository Organization

### Directory Structure
```
dj-nuff-jamz-website/
├── docs/                           # 📚 Infrastructure documentation
│   ├── README.md                   # Main documentation index
│   ├── repository-structure.md     # This file
│   ├── hosting-deployment.md       # Vercel and deployment docs
│   ├── domain-ssl.md              # Domain and SSL management
│   └── ...                        # Additional documentation files
├── public/                         # 🌐 Production-ready files
│   ├── index.html                 # Main website file
│   ├── css/                       # Compiled CSS files
│   │   └── style.css              # Tailwind compiled output
│   └── assets/                    # Static assets (images, fonts, etc.)
├── src/                           # 🔧 Source files
│   ├── styles/                    # Source stylesheets
│   │   └── main.css               # Tailwind source file
│   ├── components/                # Reusable components (future)
│   ├── pages/                     # Page-specific code (future)
│   └── utils/                     # Utility functions (future)
├── scripts/                       # 🛠️ Automation and tooling
│   ├── backup-strategy.md         # Backup documentation
│   ├── backup-verify.sh           # Backup verification script
│   ├── cloudflare-setup.md        # CDN configuration guide
│   ├── cloudflare-automation.sh   # CDN setup automation
│   ├── deploy.sh                  # Deployment management script
│   ├── environment-setup.md       # Environment configuration
│   ├── monitoring-setup.md        # Monitoring documentation
│   ├── performance-audit.sh       # Performance testing script
│   ├── uptime-check.sh           # Uptime monitoring script
│   └── test-cloudflare-performance.js # CDN performance testing
├── tasks/                         # 📋 Task management (optional)
├── .taskmaster/                   # 🤖 Task Master configuration
│   ├── config.json               # Task Master settings
│   └── tasks/                     # Task definitions and status
├── vercel.json                    # ⚙️ Production Vercel configuration
├── vercel.staging.json            # ⚙️ Staging Vercel configuration
├── vercel.development.json        # ⚙️ Development Vercel configuration
├── tailwind.config.js             # 🎨 Tailwind CSS configuration
├── package.json                   # 📦 Dependencies and scripts
├── package-lock.json              # 🔒 Dependency lock file
├── stagewise.json                 # 🎭 Stagewise CLI configuration
└── README.md                      # 📖 Project overview
```

## 🌿 Git Branching Strategy

### Branch Structure
```
main (production)
├── staging (pre-production)
└── development (active development)
    ├── feature/booking-system
    ├── feature/music-player
    ├── feature/gallery-enhancement
    └── hotfix/ssl-certificate-issue
```

### Branch Purposes

#### 🚀 Production Branch (`main`)
- **Purpose**: Live production website
- **Protection**: Requires pull request reviews and status checks
- **Auto-deploy**: Every push triggers production deployment
- **URL**: https://djnuffjamz.com, https://nuffjamz.com
- **Stability**: Highest - only thoroughly tested code

#### 🧪 Staging Branch (`staging`)
- **Purpose**: Pre-production testing and client review
- **Protection**: Requires pull request reviews
- **Auto-deploy**: Every push triggers staging deployment
- **URL**: Auto-generated Vercel preview URLs
- **Stability**: High - feature-complete code ready for testing

#### 🔧 Development Branch (`development`)
- **Purpose**: Active development and integration
- **Protection**: Minimal - allows direct pushes for rapid development
- **Auto-deploy**: Every push triggers development deployment
- **URL**: Auto-generated Vercel preview URLs
- **Stability**: Medium - working code with latest features

#### 🌟 Feature Branches (`feature/*`)
- **Purpose**: Individual feature development
- **Naming**: `feature/feature-name` (e.g., `feature/music-player`)
- **Base**: Created from `development`
- **Merge**: Pull request to `development`
- **Cleanup**: Deleted after merge

#### 🚨 Hotfix Branches (`hotfix/*`)
- **Purpose**: Critical production fixes
- **Naming**: `hotfix/issue-description` (e.g., `hotfix/ssl-certificate`)
- **Base**: Created from `main`
- **Merge**: Direct to `main`, then backport to `staging` and `development`
- **Urgency**: Immediate deployment for critical issues

## 🔄 Development Workflow

### Feature Development Flow
1. **Create Feature Branch**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/new-feature-name
   ```

2. **Develop and Test**
   ```bash
   # Make changes
   git add .
   git commit -m "feat: implement new feature"
   git push origin feature/new-feature-name
   ```

3. **Create Pull Request**
   - Base: `development`
   - Target: `feature/new-feature-name`
   - Include: Description, testing notes, screenshots

4. **Review and Merge**
   - Code review by team members
   - Automated tests (if configured)
   - Merge to `development`
   - Delete feature branch

### Release Flow
1. **Development to Staging**
   ```bash
   git checkout staging
   git pull origin staging
   git merge development
   git push origin staging
   ```

2. **Testing in Staging**
   - Functional testing
   - Performance testing
   - Client review and approval
   - Bug fixes (if needed)

3. **Staging to Production**
   ```bash
   git checkout main
   git pull origin main
   git merge staging
   git push origin main
   ```

### Hotfix Flow
1. **Create Hotfix Branch**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue
   ```

2. **Apply Fix**
   ```bash
   # Make critical fix
   git add .
   git commit -m "hotfix: resolve critical issue"
   git push origin hotfix/critical-issue
   ```

3. **Deploy to Production**
   ```bash
   git checkout main
   git merge hotfix/critical-issue
   git push origin main
   ```

4. **Backport to Other Branches**
   ```bash
   git checkout staging
   git merge main
   git push origin staging
   
   git checkout development
   git merge staging
   git push origin development
   ```

## 📋 Commit Standards

### Commit Message Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Commit Types
- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **perf**: Performance improvements
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **ci**: CI/CD changes
- **build**: Build system changes

### Examples
```bash
feat(booking): add multi-step booking form
fix(ssl): resolve certificate validation issue
docs(deployment): update environment setup guide
style(css): improve responsive design for mobile
refactor(scripts): optimize deployment script performance
perf(images): implement lazy loading for gallery
chore(deps): update Tailwind CSS to latest version
```

## 🔐 Branch Protection Rules

### Main Branch Protection
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging
- ✅ Restrict pushes that create files larger than 100MB
- ✅ Require linear history

### Staging Branch Protection
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ❌ Allow force pushes (for emergency fixes)

### Development Branch Protection
- ❌ No restrictions (allows rapid development)
- ✅ Automatic deletion of head branches after merge

## 📊 Repository Metrics

### Code Organization
- **Languages**: HTML (60%), CSS (25%), JavaScript (10%), Shell (5%)
- **File Count**: ~50 files
- **Repository Size**: ~2MB
- **Documentation Coverage**: 90%

### Activity Patterns
- **Commits per Week**: 10-20
- **Active Branches**: 3-5
- **Pull Requests**: 2-5 per week
- **Contributors**: 1-3 active

## 🛠️ Development Tools Integration

### Task Master Integration
- **Configuration**: `.taskmaster/config.json`
- **Task Files**: `.taskmaster/tasks/`
- **Commands**: `task-master list`, `task-master next`, etc.
- **Workflow**: Integrated with Git commits and deployments

### Vercel Integration
- **Auto-deployment**: Configured for all branches
- **Preview URLs**: Generated for all commits
- **Environment Variables**: Managed per environment
- **Build Settings**: Defined in `vercel.*.json` files

### GitHub Integration
- **Actions**: Automated workflows (future)
- **Issues**: Bug tracking and feature requests
- **Projects**: Kanban boards for task management
- **Releases**: Version tagging and release notes

## 📝 File Naming Conventions

### General Rules
- Use kebab-case for file and directory names
- Use descriptive names that indicate purpose
- Include environment suffix for config files
- Use consistent extensions (.md, .js, .css, .json)

### Specific Conventions
```
# Configuration Files
vercel.json                    # Production config
vercel.staging.json           # Staging config
vercel.development.json       # Development config

# Documentation Files
README.md                     # Main project documentation
docs/feature-name.md         # Feature-specific documentation
scripts/script-name.md       # Script documentation

# Script Files
scripts/action-name.sh       # Executable scripts
scripts/test-feature.js      # Test scripts

# Style Files
src/styles/main.css          # Main stylesheet
public/css/style.css         # Compiled output
```

## 🔍 Code Quality Standards

### File Organization
- Group related files in appropriate directories
- Keep configuration files in root directory
- Separate source files from compiled output
- Maintain clear separation between documentation and code

### Documentation Requirements
- Every script must have accompanying documentation
- Configuration changes must be documented
- New features require documentation updates
- Breaking changes must be clearly documented

### Version Control Best Practices
- Commit frequently with descriptive messages
- Keep commits focused on single changes
- Use pull requests for all changes to protected branches
- Tag releases with semantic versioning

## 🚀 Future Repository Enhancements

### Planned Improvements
- [ ] Automated testing integration
- [ ] Code quality checks (ESLint, Prettier)
- [ ] Automated dependency updates
- [ ] Enhanced CI/CD pipelines
- [ ] Security scanning integration

### Scalability Considerations
- Modular architecture for future growth
- Clear separation of concerns
- Extensible configuration system
- Maintainable documentation structure

---

**Last Updated**: $(date)  
**Maintained By**: Development Team  
**Next Review**: $(date -d "+1 month")

This document should be updated whenever significant changes are made to the repository structure or Git workflow.
