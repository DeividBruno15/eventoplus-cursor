#!/bin/bash

# Evento+ Mobile App Deployment Script
# SEMANA 7-8: Complete deployment automation

set -e

echo "🚀 Evento+ Mobile Deployment Pipeline Starting..."

# Environment setup
ENVIRONMENT=${1:-production}
PLATFORM=${2:-both}

echo "Environment: $ENVIRONMENT"
echo "Platform: $PLATFORM"

# Check dependencies
echo "📋 Checking dependencies..."
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLI not found. Installing..."
    npm install -g @expo/eas-cli
fi

if ! command -v expo &> /dev/null; then
    echo "❌ Expo CLI not found. Installing..."
    npm install -g @expo/cli
fi

# Login to EAS
echo "🔐 EAS Authentication..."
eas login

# Environment-specific configurations
case $ENVIRONMENT in
    "development")
        BUILD_PROFILE="development"
        ;;
    "preview")
        BUILD_PROFILE="preview"
        ;;
    "production")
        BUILD_PROFILE="production"
        ;;
    *)
        echo "❌ Invalid environment: $ENVIRONMENT"
        exit 1
        ;;
esac

# Pre-build checks
echo "🔍 Running pre-build checks..."

# Check for required environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    if [ -z "$GOOGLE_MAPS_API_KEY_IOS" ] || [ -z "$GOOGLE_MAPS_API_KEY_ANDROID" ]; then
        echo "⚠️  Warning: Google Maps API keys not set"
    fi
fi

# Build process
echo "🔨 Starting build process..."

if [ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "both" ]; then
    echo "📱 Building iOS app..."
    eas build --platform ios --profile $BUILD_PROFILE --non-interactive
    
    if [ $? -eq 0 ]; then
        echo "✅ iOS build completed successfully"
        
        # Submit to App Store for production
        if [ "$ENVIRONMENT" = "production" ]; then
            echo "📤 Submitting to App Store..."
            eas submit --platform ios --latest
        fi
    else
        echo "❌ iOS build failed"
        exit 1
    fi
fi

if [ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "both" ]; then
    echo "🤖 Building Android app..."
    eas build --platform android --profile $BUILD_PROFILE --non-interactive
    
    if [ $? -eq 0 ]; then
        echo "✅ Android build completed successfully"
        
        # Submit to Google Play for production
        if [ "$ENVIRONMENT" = "production" ]; then
            echo "📤 Submitting to Google Play..."
            eas submit --platform android --latest
        fi
    else
        echo "❌ Android build failed"
        exit 1
    fi
fi

# Post-deployment tasks
echo "📋 Post-deployment tasks..."

# Update version tracking
if [ "$ENVIRONMENT" = "production" ]; then
    # Create git tag for release
    VERSION=$(grep '"version":' app.json | sed -E 's/.*"version": "([^"]+)".*/\1/')
    git tag "mobile-v$VERSION"
    git push origin "mobile-v$VERSION"
    
    echo "🏷️  Created release tag: mobile-v$VERSION"
fi

# Generate deployment report
echo "📊 Generating deployment report..."
cat > deployment-report.md << EOF
# Evento+ Mobile Deployment Report

## Build Information
- **Environment**: $ENVIRONMENT
- **Platform**: $PLATFORM
- **Date**: $(date)
- **Version**: $(grep '"version":' app.json | sed -E 's/.*"version": "([^"]+)".*/\1/')

## Build Status
- iOS: $([ "$PLATFORM" = "ios" ] || [ "$PLATFORM" = "both" ] && echo "✅ Success" || echo "⏭️ Skipped")
- Android: $([ "$PLATFORM" = "android" ] || [ "$PLATFORM" = "both" ] && echo "✅ Success" || echo "⏭️ Skipped")

## Next Steps
$(if [ "$ENVIRONMENT" = "production" ]; then
    echo "- App submitted to stores"
    echo "- Monitor store review process"
    echo "- Prepare release notes"
else
    echo "- Test build on devices"
    echo "- Validate functionality"
    echo "- Prepare for production deployment"
fi)
EOF

echo "✅ Deployment completed successfully!"
echo "📄 See deployment-report.md for details"