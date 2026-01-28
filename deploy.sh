#!/bin/bash

# Deployment script for chatwithgods.com
# Usage: ./deploy.sh

set -e

echo "🚀 Starting deployment to chatwithgods.com..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
SERVER_USER="${DEPLOY_USER:-root}"
SERVER_HOST="${DEPLOY_HOST:-68.183.145.38}"
SERVER_PATH="${DEPLOY_PATH:-/var/www/cuffing-season}"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Server: ${SERVER_USER}@${SERVER_HOST}"
echo "  Path: ${SERVER_PATH}"
echo ""

# Check if we're in the project root
if [ ! -f "package.json" ] && [ ! -f "client/package.json" ]; then
    echo -e "${RED}Error: Must run from project root${NC}"
    exit 1
fi

# Build client
echo -e "${GREEN}Building client...${NC}"
cd client
npm install
npm run build
cd ..

# Build server
echo -e "${GREEN}Building server...${NC}"
cd server
npm install
npm run build
cd ..

# Create deployment package
echo -e "${GREEN}Creating deployment package...${NC}"
TEMP_DIR=$(mktemp -d)
DEPLOY_NAME="cuffing-season-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

# Prepare package directory structure
PACKAGE_DIR="$TEMP_DIR/deploy"
mkdir -p "$PACKAGE_DIR"

# Copy necessary files
mkdir -p "$PACKAGE_DIR/server"
cp -r server/dist "$PACKAGE_DIR/server"
# Don't copy node_modules - they need to be built on the target platform
cp -r server/package.json "$PACKAGE_DIR/server"
cp -r server/package-lock.json "$PACKAGE_DIR/server"
cp -r server/database.sqlite "$PACKAGE_DIR/server" 2>/dev/null || true
cp -r server/uploads "$PACKAGE_DIR/server" 2>/dev/null || true
# Copy public folder (support page, etc.)
cp -r server/public "$PACKAGE_DIR/server" 2>/dev/null || true
# Copy seed scripts and source files needed for scripts
mkdir -p "$PACKAGE_DIR/server/scripts"
cp -r server/scripts/*.ts "$PACKAGE_DIR/server/scripts" 2>/dev/null || true
# Copy src/database folder (needed for seed scripts to work)
mkdir -p "$PACKAGE_DIR/server/src/database"
cp -r server/src/database/*.ts "$PACKAGE_DIR/server/src/database" 2>/dev/null || true
cp -r server/src/config.ts "$PACKAGE_DIR/server/src" 2>/dev/null || true
# Copy tsconfig.json for TypeScript compilation
cp -r server/tsconfig.json "$PACKAGE_DIR/server" 2>/dev/null || true

mkdir -p "$PACKAGE_DIR/client"
cp -r client/dist "$PACKAGE_DIR/client"
# Copy images directory (create public directory if it doesn't exist)
mkdir -p "$PACKAGE_DIR/client/public"
cp -r client/public/images "$PACKAGE_DIR/client/public" 2>/dev/null || true

# Create deployment structure
mkdir -p "$PACKAGE_DIR/scripts"
cat > "$PACKAGE_DIR/scripts/deploy-remote.sh" << 'EOF'
#!/bin/bash
set -e

DEPLOY_PATH="${1:-/var/www/cuffing-season}"
DEPLOY_TAR="${2:-/tmp/deploy.tar.gz}"

# Create deployment directory if it doesn't exist
if [ ! -d "$DEPLOY_PATH" ]; then
    echo "📁 Creating deployment directory: $DEPLOY_PATH"
    sudo mkdir -p "$DEPLOY_PATH"
    sudo chown -R $USER:$USER "$DEPLOY_PATH"
fi

cd "$DEPLOY_PATH"

echo "📦 Extracting deployment package..."
tar -xzf "$DEPLOY_TAR"

echo "🔄 Updating server..."
if [ -d "deploy/server" ]; then
    if [ -d "server" ]; then
        # Backup current server
        if [ -d "server.backup" ]; then
            rm -rf server.backup
        fi
        mv server server.backup 2>/dev/null || true
    fi
    mv deploy/server server
else
    echo "❌ Error: deploy/server not found in package"
    exit 1
fi

echo "🔄 Updating client..."
if [ -d "deploy/client" ]; then
    if [ -d "client" ]; then
        # Backup current client
        if [ -d "client.backup" ]; then
            rm -rf client.backup
        fi
        mv client client.backup 2>/dev/null || true
    fi
    mv deploy/client client
else
    echo "❌ Error: deploy/client not found in package"
    exit 1
fi

# Set ownership and permissions for nginx and node
echo "🔐 Setting ownership and permissions..."
chown -R www-data:www-data server client
find server client -type d -exec chmod 755 {} \;
find server client -type f -exec chmod 644 {} \;
chmod 775 server/uploads 2>/dev/null || true

# Ensure uploads directory exists
mkdir -p server/uploads
chmod 775 server/uploads

# Install server dependencies (rebuild native modules for this platform)
echo "📦 Installing server dependencies..."
cd server
npm install --production
cd ..

# Run seed data scripts
echo "🌱 Seeding database with test data..."
cd server
# Install dev dependencies for tsx (needed for TypeScript scripts)
echo "📦 Installing dev dependencies for seed scripts..."
npm install tsx --save-dev 2>/dev/null || true

# Run seed scripts (they handle existing users gracefully)
echo "Running seed script..."
npm run db:seed
echo "Running update script..."
npm run db:update
echo "Creating matches for Sarah..."
npm run db:matches
cd ..

# Restart PM2
echo "🔄 Restarting backend..."
pm2 restart cuffing-season-api || pm2 start server/dist/index.js --name cuffing-season-api

# Reload nginx
echo "🔄 Reloading nginx..."
sudo systemctl reload nginx

echo "🔐 Setting permissions for web files..."
chown -R www-data:www-data "${DEPLOY_PATH}/client" "${DEPLOY_PATH}/server"
find client server -type d -exec chmod 755 {} \;
find client server -type f -exec chmod 644 {} \;
chmod 775 server/uploads 2>/dev/null || true

echo "✅ Deployment complete!"
rm -rf deploy
if [ -f "$DEPLOY_TAR" ]; then
    rm -f "$DEPLOY_TAR"
fi
EOF

chmod +x "$PACKAGE_DIR/scripts/deploy-remote.sh"

# Create tar archive (outside of TEMP_DIR to avoid including itself)
DEPLOY_PATH="$(pwd)/${DEPLOY_NAME}"
tar -czf "$DEPLOY_PATH" -C "$TEMP_DIR" deploy

echo -e "${GREEN}Deployment package created: ${DEPLOY_NAME}${NC}"
REMOTE_DEPLOY_TAR="/tmp/${DEPLOY_NAME}"
echo ""

if [ "${SKIP_REMOTE:-false}" = "true" ]; then
    echo -e "${YELLOW}Skipping remote deployment (SKIP_REMOTE=true).${NC}"
    echo -e "${YELLOW}Upload and deploy manually with:${NC}"
    echo "  scp ${DEPLOY_NAME} ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DEPLOY_TAR}"
    echo "  ssh ${SERVER_USER}@${SERVER_HOST} \"cd /tmp && tar -xzf ${REMOTE_DEPLOY_TAR} && bash scripts/deploy-remote.sh ${SERVER_PATH} ${REMOTE_DEPLOY_TAR}\""
else
    echo -e "${GREEN}Uploading package to ${SERVER_HOST}...${NC}"
    scp "${DEPLOY_NAME}" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_DEPLOY_TAR}"

    echo -e "${GREEN}Running remote deployment...${NC}"
    ssh "${SERVER_USER}@${SERVER_HOST}" <<EOF
set -e
cd /tmp
rm -rf deploy
tar -xzf "${REMOTE_DEPLOY_TAR}"
bash deploy/scripts/deploy-remote.sh "${SERVER_PATH}" "${REMOTE_DEPLOY_TAR}"
rm -rf deploy "${REMOTE_DEPLOY_TAR}"
EOF

    echo -e "${GREEN}✅ Remote deployment complete!${NC}"
fi

# Cleanup
rm -rf "$TEMP_DIR"

echo -e "${GREEN}✅ Local build complete!${NC}"

