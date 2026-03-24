#!/usr/bin/env node

// Trigger a Render deploy hook using either:
// 1) CLI arg: node scripts/trigger-render-deploy.mjs <hook_url>
// 2) Env var: RENDER_DEPLOY_HOOK_URL=<hook_url> npm run deploy:render

const argUrl = process.argv[2];
const hookUrl = argUrl || process.env.RENDER_DEPLOY_HOOK_URL;

if (!hookUrl) {
  console.error("Missing deploy hook URL.");
  console.error("Usage:");
  console.error("  npm run deploy:render -- \"https://api.render.com/deploy/...\"");
  console.error("  or set RENDER_DEPLOY_HOOK_URL in your environment.");
  process.exit(1);
}

const isValidHttp = /^https?:\/\//i.test(hookUrl);
if (!isValidHttp) {
  console.error("Invalid deploy hook URL. It must start with http:// or https://");
  process.exit(1);
}

try {
  const response = await fetch(hookUrl, { method: "POST" });
  const body = await response.text();

  if (!response.ok) {
    console.error(`Render hook failed: HTTP ${response.status}`);
    if (body) console.error(body);
    process.exit(1);
  }

  console.log(`Render deploy triggered successfully (HTTP ${response.status}).`);
  if (body) console.log(body);
} catch (error) {
  console.error("Failed to call Render deploy hook:", error.message);
  process.exit(1);
}
