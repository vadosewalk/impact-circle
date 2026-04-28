#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Google Cloud Deployment for Impact Circle..."

# Check if project ID is provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide your Google Cloud Project ID."
  echo "Usage: ./deploy-gcp.sh <YOUR_PROJECT_ID>"
  exit 1
fi

PROJECT_ID=$1
REGION="asia-south1"
REPO="monorepo-repo"

echo "✅ Using Project ID: $PROJECT_ID"

# ─── Load env vars from .env.production files ───
BACKEND_ENV="apps/backend/.env.production"
WEB_ENV="apps/web/.env.production"

load_env() {
  local file=$1
  if [ ! -f "$file" ]; then
    echo "❌ Missing env file: $file"
    exit 1
  fi
  # Export vars, skipping comments and blank lines
  set -a
  while IFS='=' read -r key value; do
    # Skip comments and empty lines
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    # Strip surrounding quotes and inline comments
    value="${value%%#*}"
    value="$(echo "$value" | sed 's/^"//;s/"$//' | xargs)"
    export "$key=$value"
  done < "$file"
  set +a
}

echo "📄 Loading backend env from $BACKEND_ENV..."
load_env "$BACKEND_ENV"

echo "📄 Loading web env from $WEB_ENV..."
load_env "$WEB_ENV"

echo "  DATABASE_URL      = ${DATABASE_URL:0:30}..."
echo "  BETTER_AUTH_SECRET = ${BETTER_AUTH_SECRET:0:10}..."
echo "  GOOGLE_CLIENT_ID   = ${GOOGLE_CLIENT_ID:0:20}..."
echo "  NEXT_PUBLIC_API_URL = $NEXT_PUBLIC_API_URL"

# 1. Enable APIs
echo "📦 Enabling required GCP APIs..."
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project "$PROJECT_ID"

# 2. Create Artifact Registry
echo "📦 Ensuring Artifact Registry exists..."
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --project="$PROJECT_ID" 2>/dev/null || true

# ─── PHASE 1: Build & Deploy Backend ───
echo "🔨 Building Backend Container..."
gcloud builds submit . \
  --config cloudbuild-backend.yaml \
  --substitutions _IMAGE_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/backend" \
  --project "$PROJECT_ID"

echo "🚀 Deploying Backend to Cloud Run..."
gcloud run deploy backend-service \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/backend" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --project "$PROJECT_ID" \
  --timeout=600 \
  --set-env-vars "DATABASE_URL=$DATABASE_URL,BETTER_AUTH_SECRET=$BETTER_AUTH_SECRET,GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID,GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET,FRONTEND_URL=${FRONTEND_URL:-https://placeholder.run.app}"

BACKEND_URL=$(gcloud run services describe backend-service --platform managed --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')
echo "✅ Backend deployed at: $BACKEND_URL"

# ─── PHASE 2: Build & Deploy Frontend ───
echo "🔨 Building Frontend Container (injecting NEXT_PUBLIC_API_URL=$BACKEND_URL)..."
gcloud builds submit . \
  --config cloudbuild-frontend.yaml \
  --substitutions _IMAGE_TAG="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/frontend",_NEXT_PUBLIC_API_URL="$BACKEND_URL" \
  --project "$PROJECT_ID"

echo "🚀 Deploying Frontend to Cloud Run..."
gcloud run deploy frontend-service \
  --image "$REGION-docker.pkg.dev/$PROJECT_ID/$REPO/frontend" \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 3000 \
  --project "$PROJECT_ID"

FRONTEND_URL=$(gcloud run services describe frontend-service --platform managed --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')
echo "✅ Frontend deployed at: $FRONTEND_URL"

# ─── PHASE 3: Update Backend with real Frontend URL ───
echo "🔄 Updating Backend with actual Frontend URL..."
gcloud run services update backend-service \
  --region "$REGION" \
  --project "$PROJECT_ID" \
  --update-env-vars "FRONTEND_URL=$FRONTEND_URL,BETTER_AUTH_URL=$BACKEND_URL"

echo ""
echo "═══════════════════════════════════════════════════"
echo "🎉 Deployment Complete!"
echo "  Backend API : $BACKEND_URL"
echo "  Web App     : $FRONTEND_URL"
echo "═══════════════════════════════════════════════════"
