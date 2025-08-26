#!/bin/bash

# DJ Nuff Jamz Website - Deployment Script
# Manages deployments across development, staging, and production environments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENTS=("development" "staging" "production")
CURRENT_BRANCH=$(git branch --show-current)

echo -e "${BLUE}🚀 DJ Nuff Jamz Website - Deployment Manager${NC}"
echo -e "${BLUE}=============================================${NC}"
echo -e "Current branch: ${YELLOW}$CURRENT_BRANCH${NC}"
echo ""

# Function to show usage
show_usage() {
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  ./scripts/deploy.sh [environment] [options]"
    echo ""
    echo -e "${YELLOW}Environments:${NC}"
    echo -e "  development  - Deploy to development environment"
    echo -e "  staging      - Deploy to staging environment"
    echo -e "  production   - Deploy to production environment"
    echo -e "  preview      - Create preview deployment"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo -e "  --build      - Run build before deployment"
    echo -e "  --force      - Force deployment without checks"
    echo -e "  --dry-run    - Show what would be deployed without deploying"
    echo -e "  --help       - Show this help message"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "  ./scripts/deploy.sh development"
    echo -e "  ./scripts/deploy.sh staging --build"
    echo -e "  ./scripts/deploy.sh production --force"
    echo -e "  ./scripts/deploy.sh preview"
}

# Function to check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}🔍 Checking prerequisites...${NC}"
    
    # Check if Vercel CLI is installed
    if ! command -v vercel &> /dev/null; then
        echo -e "${RED}❌ Vercel CLI not found. Please install it first:${NC}"
        echo -e "   npm i -g vercel"
        exit 1
    fi
    
    # Check if logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        echo -e "${RED}❌ Not logged in to Vercel. Please login first:${NC}"
        echo -e "   vercel login"
        exit 1
    fi
    
    # Check if Git working directory is clean (unless forced)
    if [ "$FORCE_DEPLOY" != "true" ]; then
        if [ -n "$(git status --porcelain)" ]; then
            echo -e "${YELLOW}⚠️  Working directory has uncommitted changes${NC}"
            echo -e "   Commit changes or use --force to deploy anyway"
            if [ "$DRY_RUN" != "true" ]; then
                exit 1
            fi
        fi
    fi
    
    echo -e "${GREEN}✅ Prerequisites check passed${NC}"
}

# Function to build the project
build_project() {
    echo -e "${YELLOW}🔨 Building project...${NC}"
    
    if [ "$DRY_RUN" = "true" ]; then
        echo -e "${BLUE}[DRY RUN] Would run: npm run build${NC}"
        return 0
    fi
    
    if npm run build; then
        echo -e "${GREEN}✅ Build completed successfully${NC}"
    else
        echo -e "${RED}❌ Build failed${NC}"
        exit 1
    fi
}

# Function to deploy to environment
deploy_to_environment() {
    local environment=$1
    local config_file=""
    local deploy_command="vercel"
    
    echo -e "${YELLOW}🚀 Deploying to $environment environment...${NC}"
    
    # Set configuration file based on environment
    case $environment in
        "development")
            config_file="vercel.development.json"
            ;;
        "staging")
            config_file="vercel.staging.json"
            ;;
        "production")
            config_file="vercel.json"
            deploy_command="vercel --prod"
            ;;
        "preview")
            config_file="vercel.json"
            ;;
    esac
    
    # Check if configuration file exists
    if [ ! -f "$config_file" ]; then
        echo -e "${RED}❌ Configuration file $config_file not found${NC}"
        exit 1
    fi
    
    # Build deploy command
    if [ "$environment" != "preview" ]; then
        deploy_command="$deploy_command --local-config $config_file"
    fi
    
    echo -e "${BLUE}Using configuration: $config_file${NC}"
    echo -e "${BLUE}Deploy command: $deploy_command${NC}"
    
    if [ "$DRY_RUN" = "true" ]; then
        echo -e "${BLUE}[DRY RUN] Would run: $deploy_command${NC}"
        return 0
    fi
    
    # Execute deployment
    if eval $deploy_command; then
        echo -e "${GREEN}✅ Deployment to $environment completed successfully${NC}"
        
        # Show deployment URL
        if [ "$environment" = "production" ]; then
            echo -e "${GREEN}🌐 Production URL: https://djnuffjamz.com${NC}"
            echo -e "${GREEN}🌐 Secondary URL: https://nuffjamz.com${NC}"
        else
            echo -e "${GREEN}🌐 Deployment URL will be shown above${NC}"
        fi
    else
        echo -e "${RED}❌ Deployment to $environment failed${NC}"
        exit 1
    fi
}

# Function to check branch compatibility
check_branch_compatibility() {
    local environment=$1
    
    case $environment in
        "production")
            if [ "$CURRENT_BRANCH" != "main" ] && [ "$FORCE_DEPLOY" != "true" ]; then
                echo -e "${RED}❌ Production deployments should be from 'main' branch${NC}"
                echo -e "   Current branch: $CURRENT_BRANCH"
                echo -e "   Use --force to deploy anyway"
                exit 1
            fi
            ;;
        "staging")
            if [ "$CURRENT_BRANCH" != "staging" ] && [ "$CURRENT_BRANCH" != "main" ] && [ "$FORCE_DEPLOY" != "true" ]; then
                echo -e "${YELLOW}⚠️  Staging deployments typically from 'staging' branch${NC}"
                echo -e "   Current branch: $CURRENT_BRANCH"
                echo -e "   Use --force to deploy anyway"
                if [ "$DRY_RUN" != "true" ]; then
                    exit 1
                fi
            fi
            ;;
        "development")
            if [ "$CURRENT_BRANCH" != "development" ] && [ "$FORCE_DEPLOY" != "true" ]; then
                echo -e "${YELLOW}⚠️  Development deployments typically from 'development' branch${NC}"
                echo -e "   Current branch: $CURRENT_BRANCH"
                echo -e "   Use --force to deploy anyway"
                if [ "$DRY_RUN" != "true" ]; then
                    exit 1
                fi
            fi
            ;;
    esac
}

# Function to show deployment summary
show_deployment_summary() {
    local environment=$1
    
    echo -e "\n${BLUE}📊 Deployment Summary${NC}"
    echo -e "${BLUE}=====================${NC}"
    echo -e "Environment: ${YELLOW}$environment${NC}"
    echo -e "Branch: ${YELLOW}$CURRENT_BRANCH${NC}"
    echo -e "Timestamp: $(date)"
    
    if [ "$environment" = "production" ]; then
        echo -e "URLs:"
        echo -e "  - https://djnuffjamz.com"
        echo -e "  - https://nuffjamz.com"
    fi
    
    echo -e "\n${GREEN}🎉 Deployment completed successfully!${NC}"
}

# Parse command line arguments
ENVIRONMENT=""
BUILD_PROJECT=false
FORCE_DEPLOY=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
    case $1 in
        development|staging|production|preview)
            ENVIRONMENT="$1"
            shift
            ;;
        --build)
            BUILD_PROJECT=true
            shift
            ;;
        --force)
            FORCE_DEPLOY=true
            shift
            ;;
        --dry-run)
            DRY_RUN=true
            shift
            ;;
        --help)
            show_usage
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Unknown option: $1${NC}"
            show_usage
            exit 1
            ;;
    esac
done

# Check if environment is specified
if [ -z "$ENVIRONMENT" ]; then
    echo -e "${RED}❌ Environment not specified${NC}"
    show_usage
    exit 1
fi

# Validate environment
if [[ ! " ${ENVIRONMENTS[@]} " =~ " ${ENVIRONMENT} " ]] && [ "$ENVIRONMENT" != "preview" ]; then
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    show_usage
    exit 1
fi

# Show dry run notice
if [ "$DRY_RUN" = "true" ]; then
    echo -e "${YELLOW}🔍 DRY RUN MODE - No actual deployment will occur${NC}"
    echo ""
fi

# Main deployment flow
echo -e "${BLUE}Starting deployment to $ENVIRONMENT environment...${NC}"
echo ""

# Check prerequisites
check_prerequisites
echo ""

# Check branch compatibility
check_branch_compatibility "$ENVIRONMENT"
echo ""

# Build project if requested
if [ "$BUILD_PROJECT" = "true" ]; then
    build_project
    echo ""
fi

# Deploy to environment
deploy_to_environment "$ENVIRONMENT"
echo ""

# Show summary
if [ "$DRY_RUN" != "true" ]; then
    show_deployment_summary "$ENVIRONMENT"
fi
