#!/bin/bash
# Bind KV namespace to the Pages project
# Usage: KV_NAMESPACE_ID=<id> bash setup-kv.sh
#     or: CLOUDFLARE_API_TOKEN=<token_with_kv_perms> bash setup-kv.sh

CF_TOKEN="${CLOUDFLARE_API_TOKEN:-WaOgl2AeqUuw4Wy0FePLG664VznimozLnQiTYuPH}"
ACCOUNT_ID="f7a9b24f679e1d3952921ee5e72e677e"
PROJECT="laundry-branch-pages"
KV_ID="${KV_NAMESPACE_ID:-}"

if [ -z "$KV_ID" ]; then
  # Try to create the KV namespace
  echo "Attempting to create KV namespace 'laundry-data'..."
  RESULT=$(curl -s -X POST "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/storage/kv/namespaces" \
    -H "Authorization: Bearer $CF_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"title":"laundry-data"}')

  KV_ID=$(echo "$RESULT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('result',{}).get('id',''))" 2>/dev/null)

  if [ -z "$KV_ID" ]; then
    echo "Failed to create KV namespace. Token may need Workers KV Storage: Edit permission."
    echo "Response: $RESULT"
    echo ""
    echo "Create namespace manually at:"
    echo "https://dash.cloudflare.com/$ACCOUNT_ID/workers/kv/namespaces"
    echo ""
    echo "Then run: KV_NAMESPACE_ID=<id> bash setup-kv.sh"
    exit 1
  fi

  echo "Created KV namespace: $KV_ID"
fi

echo "Binding KV namespace $KV_ID to Pages project..."

# Bind KV to Pages project
curl -s -X PATCH "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/$PROJECT" \
  -H "Authorization: Bearer $CF_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"deployment_configs\": {
      \"production\": {
        \"kv_namespaces\": {
          \"DATA\": {\"namespace_id\": \"$KV_ID\"}
        }
      },
      \"preview\": {
        \"kv_namespaces\": {
          \"DATA\": {\"namespace_id\": \"$KV_ID\"}
        }
      }
    }
  }" | python3 -c "import sys,json; d=json.load(sys.stdin); print('KV bound:', d.get('success'), d.get('errors',''))"

# Update wrangler.toml
sed -i "s|# \[\[kv_namespaces\]\]|\[\[kv_namespaces\]\]|" /home/eratner/laundry-branch-pages/wrangler.toml
sed -i "s|# binding = \"DATA\"|binding = \"DATA\"|" /home/eratner/laundry-branch-pages/wrangler.toml
sed -i "s|# id = \"REPLACE_WITH_REAL_KV_ID\"|id = \"$KV_ID\"|" /home/eratner/laundry-branch-pages/wrangler.toml
sed -i "s|# preview_id = \"REPLACE_WITH_REAL_KV_ID\"|preview_id = \"$KV_ID\"|" /home/eratner/laundry-branch-pages/wrangler.toml

echo ""
echo "wrangler.toml updated with KV ID: $KV_ID"
echo ""
echo "Redeploy to activate KV:"
echo "  source /home/eratner/.nvm/nvm.sh && nvm use 20"
echo "  cd /home/eratner/laundry-branch-pages"
echo "  CLOUDFLARE_API_TOKEN=$CF_TOKEN CLOUDFLARE_ACCOUNT_ID=$ACCOUNT_ID ./node_modules/.bin/wrangler pages deploy public/ --project-name=laundry-branch-pages --branch=main --commit-dirty=true"
