# Set Environment Variables

# Generate secret if you haven't already
npx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)
npx convex env set SITE_URL=https://your-domain.com

# Google OAuth
npx convex env set GOOGLE_CLIENT_ID=your-google-client-id
npx convex env set GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
npx convex env set GITHUB_CLIENT_ID=your-github-client-id
npx convex env set GITHUB_CLIENT_SECRET=your-github-client-secret

# Discord OAuth (optional)
npx convex env set DISCORD_CLIENT_ID=your-discord-client-id
npx convex env set DISCORD_CLIENT_SECRET=your-discord-client-secret