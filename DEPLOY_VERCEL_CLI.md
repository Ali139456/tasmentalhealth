# Deploy to Vercel using CLI

Since automatic deployments aren't working, you can deploy directly using the Vercel CLI.

## Option 1: Using the Deployment Script

1. Open Terminal
2. Navigate to the project:
   ```bash
   cd /Users/mac/Documents/tasmentalhealth
   ```
3. Run the deployment script:
   ```bash
   ./deploy.sh
   ```

## Option 2: Manual CLI Deployment

1. **Install Vercel CLI** (if not already installed):
   ```bash
   npm install -g vercel
   ```
   If you get permission errors, use:
   ```bash
   sudo npm install -g vercel
   ```

2. **Navigate to the react-app directory**:
   ```bash
   cd /Users/mac/Documents/tasmentalhealth/react-app
   ```

3. **Login to Vercel** (first time only):
   ```bash
   vercel login
   ```
   This will open your browser to authenticate.

4. **Link to your existing project** (first time only):
   ```bash
   vercel link
   ```
   - Select your existing project: `tasmentalhealth`
   - Confirm the settings (they should auto-detect from `vercel.json`)

5. **Deploy to production**:
   ```bash
   vercel --prod
   ```

## Option 3: Quick Deploy (if already linked)

If you've already linked the project, you can simply run:
```bash
cd /Users/mac/Documents/tasmentalhealth/react-app
vercel --prod
```

## Troubleshooting

- **Permission errors**: Use `sudo` for global npm installs
- **Not linked**: Run `vercel link` first
- **Wrong directory**: Make sure you're in the `react-app` folder
- **Build errors**: Check the build logs in the terminal

## Alternative: Fix GitHub Webhook

If you prefer automatic deployments, check your Vercel dashboard:
1. Go to **Settings → Git**
2. Verify the repository connection
3. Check that "Automatic deployments from Git" is enabled
4. Reconnect the repository if needed
