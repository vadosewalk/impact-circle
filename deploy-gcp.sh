#!/bin/bash

# Exit on any error
set -e

echo "🚀 Starting Google Cloud Deployment for Impact Circle..."

# Check if project ID is provided
if [ -z "$1" ]; then
  echo "❌ Error: Please provide your Google Cloud Project ID."
  echo "Usage: ./deploy-gcp.sh <YOUR_PROJECT_ID> [--web-only|--backend-only]"
  exit 1
fi

PROJECT_ID=$1
TARGET="${2:-all}"  # all, --web-only, --backend-only
REGION="asia-south1"
REPO="monorepo-repo"

echo "✅ Using Project ID: $PROJECT_ID"
echo "🎯 Target: $TARGET"

# ─── Load env vars from .env.production files ───
BACKEND_ENV="apps/backend/.env.production"
WEB_ENV="apps/web/.env.production"

load_env() {
  local file=$1
  if [ ! -f "$file" ]; then
    echo "❌ Missing env file: $file"
    exit 1
  fi
  set -a
  while IFS='=' read -r key value; do
    [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
    value="${value%%#*}"
    value="$(echo "$value" | sed 's/^"//;s/"$//' | xargs)"
    export "$key=$value"
  done < "$file"
  set +a
}

echo "📄 Loading env files..."
load_env "$BACKEND_ENV"
load_env "$WEB_ENV"

# Enable APIs & ensure registry
echo "📦 Enabling required GCP APIs..."
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project "$PROJECT_ID"

echo "📦 Ensuring Artifact Registry exists..."
gcloud artifacts repositories create "$REPO" \
  --repository-format=docker \
  --location="$REGION" \
  --project="$PROJECT_ID" 2>/dev/null || true

# ─── BACKEND ───
if [ "$TARGET" != "--web-only" ]; then
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
fi

BACKEND_URL=$(gcloud run services describe backend-service --platform managed --region "$REGION" --project "$PROJECT_ID" --format 'value(status.url)')
echo "✅ Backend at: $BACKEND_URL"

# ─── FRONTEND ───
if [ "$TARGET" != "--backend-only" ]; then
  echo "🔨 Building Frontend Container (NEXT_PUBLIC_API_URL=$BACKEND_URL)..."
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
  echo "✅ Frontend at: $FRONTEND_URL"

  # Update backend with real frontend URL
  echo "🔄 Updating Backend with Frontend URL..."
  gcloud run services update backend-service \
    --region "$REGION" \
    --project "$PROJECT_ID" \
    --update-env-vars "FRONTEND_URL=$FRONTEND_URL,BETTER_AUTH_URL=$BACKEND_URL"
fi

echo ""
echo "═══════════════════════════════════════════════════"
echo "🎉 Deployment Complete!"
echo "  Backend API : $BACKEND_URL"
[ -n "$FRONTEND_URL" ] && echo "  Web App     : $FRONTEND_URL"
echo "═══════════════════════════════════════════════════"
