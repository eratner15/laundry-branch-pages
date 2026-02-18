#!/bin/bash
# Run this script once to set API secrets for the Pages project
# Usage: ANTHROPIC_API_KEY=sk-... RESEND_API_KEY=re_... BLAND_API_KEY=... bash setup-secrets.sh

set -e

CF_TOKEN="${CLOUDFLARE_API_TOKEN:-WaOgl2AeqUuw4Wy0FePLG664VznimozLnQiTYuPH}"
ACCOUNT_ID="f7a9b24f679e1d3952921ee5e72e677e"
PROJECT="laundry-branch-pages"

if [ -z "$ANTHROPIC_API_KEY" ] || [ -z "$RESEND_API_KEY" ]; then
  echo "Usage: ANTHROPIC_API_KEY=sk-ant-... RESEND_API_KEY=re_... BLAND_API_KEY=... bash setup-secrets.sh"
  exit 1
fi

source /home/eratner/.nvm/nvm.sh
nvm use 20 2>/dev/null

echo "Setting Pages secrets via wrangler..."

# Use Pages API to set encrypted env vars
PATCH_BODY=$(python3 -c "
import json
payload = {
  'deployment_configs': {
    'production': {
      'env_vars': {
        'ANTHROPIC_API_KEY': {'type': 'secret_text', 'value': '$ANTHROPIC_API_KEY'},
        'RESEND_API_KEY': {'type': 'secret_text', 'value': '$RESEND_API_KEY'},
        'BLAND_API_KEY': {'type': 'secret_text', 'value': '${BLAND_API_KEY:-placeholder}'},
        'ALERT_EMAIL': {'type': 'plain_text', 'value': 'evan@cafecito-ai.com'},
        'PHONE_NUMBER': {'type': 'plain_text', 'value': '(513) 822-5130'}
      }
    },
    'preview': {
      'env_vars': {
        'ANTHROPIC_API_KEY': {'type': 'secret_text', 'value': '$ANTHROPIC_API_KEY'},
        'RESEND_API_KEY': {'type': 'secret_text', 'value': '$RESEND_API_KEY'},
        'BLAND_API_KEY': {'type': 'secret_text', 'value': '${BLAND_API_KEY:-placeholder}'},
        'ALERT_EMAIL': {'type': 'plain_text', 'value': 'evan@cafecito-ai.com'},
        'PHONE_NUMBER': {'type': 'plain_text', 'value': '(513) 822-5130'}
      }
    }
  }
}
print(json.dumps(payload))
")

curl -s -X PATCH "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$PATCH_BODY" | python3 -c "import sys,json; d=json.load(sys.stdin); print('Secrets set:', d.get('success'), d.get('errors',''))"

echo ""
echo "=== Next: Create KV namespace ==="
echo "The API token needs Workers KV Storage: Edit permission to create KV."
echo ""
echo "Option A — Cloudflare Dashboard:"
echo "  1. Go to https://dash.cloudflare.com/$ACCOUNT_ID/workers/kv/namespaces"
echo "  2. Create namespace named 'laundry-data'"
echo "  3. Copy the namespace ID"
echo "  4. Run: bash setup-kv.sh <KV_NAMESPACE_ID>"
echo ""
echo "Option B — Create API token with KV permissions:"
echo "  Go to https://dash.cloudflare.com/profile/api-tokens"
echo "  Create token with: Workers KV Storage: Edit"
echo "  Then run: CLOUDFLARE_API_TOKEN=<new_token> bash setup-kv.sh"

echo ""
echo "Done. Redeploy pages for secrets to take effect:"
echo "  cd /home/eratner/laundry-branch-pages"
echo "  source /home/eratner/.nvm/nvm.sh && nvm use 20"
echo "  CLOUDFLARE_API_TOKEN=$CF_TOKEN CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID ./node_modules/.bin/wrangler pages deploy public/ --project-name=laundry-branch-pages --branch=main --commit-dirty=true"
