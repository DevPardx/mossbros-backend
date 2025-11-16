# CI/CD Setup Guide for GitHub Actions

This guide will walk you through configuring GitHub Secrets for automated deployment to your Digital Ocean droplet.

## Prerequisites

- GitHub repository: Your mossbros backend repository
- Digital Ocean droplet IP: 167.70.101.10
- Droplet user: mossbros
- SSH access to the droplet

## Step 1: Generate SSH Key Pair for GitHub Actions

On your local machine, generate a dedicated SSH key pair for GitHub Actions:

```bash
# Generate a new SSH key pair (do NOT use a passphrase)
ssh-keygen -t ed25519 -C "github-actions-mossbros" -f ~/.ssh/github_actions_mossbros

# This will create two files:
# - ~/.ssh/github_actions_mossbros (private key)
# - ~/.ssh/github_actions_mossbros.pub (public key)
```

**Important**: Do not set a passphrase when prompted, as GitHub Actions cannot handle passphrase-protected keys interactively.

## Step 2: Add Public Key to Droplet

Copy the public key to your droplet's authorized_keys:

```bash
# Display the public key
cat ~/.ssh/github_actions_mossbros.pub

# Copy the output, then SSH into your droplet
ssh mossbros@167.70.101.10

# On the droplet, add the public key to authorized_keys
echo "YOUR_PUBLIC_KEY_HERE" >> ~/.ssh/authorized_keys

# Ensure proper permissions
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh

# Exit the droplet
exit
```

**Alternative method** (copy directly from local machine):

```bash
# From your local machine
ssh-copy-id -i ~/.ssh/github_actions_mossbros.pub mossbros@167.70.101.10
```

## Step 3: Test SSH Connection

Verify the SSH key works:

```bash
# From your local machine
ssh -i ~/.ssh/github_actions_mossbros mossbros@167.70.101.10

# If successful, you should connect without entering a password
# Exit the droplet
exit
```

## Step 4: Configure GitHub Repository Secrets

1. Go to your GitHub repository: https://github.com/YOUR_USERNAME/YOUR_REPO

2. Click on **Settings** → **Secrets and variables** → **Actions**

3. Click **New repository secret** and add the following secrets:

### Required Secrets:

#### DROPLET_HOST
- **Name**: `DROPLET_HOST`
- **Value**: `167.70.101.10`

#### DROPLET_USER
- **Name**: `DROPLET_USER`
- **Value**: `mossbros`

#### DROPLET_SSH_KEY
- **Name**: `DROPLET_SSH_KEY`
- **Value**: Copy the entire contents of your private key
  ```bash
  # Display the private key on your local machine
  cat ~/.ssh/github_actions_mossbros
  ```
  Copy everything including:
  ```
  -----BEGIN OPENSSH PRIVATE KEY-----
  ... (entire key content)
  -----END OPENSSH PRIVATE KEY-----
  ```

#### DROPLET_PORT
- **Name**: `DROPLET_PORT`
- **Value**: `22` (or your custom SSH port if you changed it)

### Optional Secrets:

#### CODECOV_TOKEN (Optional)
- **Name**: `CODECOV_TOKEN`
- **Value**: Your Codecov token (if you want code coverage reporting)
- Get it from: https://codecov.io/

## Step 5: Environment Variables on Droplet

Ensure your `.env` file exists on the droplet at `/home/mossbros/mossbros-backend/.env` with all required variables:

```bash
# SSH into your droplet
ssh mossbros@167.70.101.10

# Navigate to the project directory
cd /home/mossbros/mossbros-backend

# Check if .env file exists
ls -la .env

# If it doesn't exist, create it
nano .env
```

Your `.env` file should contain:

```env
NODE_ENV=production
PORT=4000

# Database
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=mossbros
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=your_secure_password

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret_here

# Frontend
FRONTEND_URL=https://mossbrossv.com

# Email (Resend)
RESEND_API_KEY=your_resend_api_key

# Monitoring (Optional)
SENTRY_DSN=your_sentry_dsn
SENTRY_ENVIRONMENT=production

# Owner account
OWNER_NAME=Admin Name
OWNER_EMAIL=admin@mossbrossv.com
OWNER_PASSWORD=secure_admin_password
OWNER_PHONE=+1234567890
```

## Step 6: Test the GitHub Actions Workflow

There are two ways to test the workflow:

### Method 1: Manual Trigger

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click on **Deploy to Production** workflow
4. Click **Run workflow** → **Run workflow**
5. Monitor the workflow execution

### Method 2: Push to Main Branch

```bash
# From your local development machine
cd /Users/pardo/Documents/Projects/mossbros/backend

# Make a small change (or create an empty commit)
git commit --allow-empty -m "Test CI/CD pipeline"

# Push to main branch
git push origin main

# Go to GitHub Actions tab to watch the deployment
```

## Step 7: Monitor Deployment

1. Watch the GitHub Actions workflow in real-time:
   - Go to **Actions** tab in GitHub
   - Click on the running workflow
   - Expand each job to see detailed logs

2. Monitor on the droplet:
   ```bash
   # SSH into droplet
   ssh mossbros@167.70.101.10

   # Watch container status
   watch docker ps

   # View backend logs
   docker compose logs -f backend
   ```

## Troubleshooting

### SSH Connection Failed

If you see `Permission denied (publickey)` error:

1. Verify the private key is correctly copied to GitHub Secrets
2. Ensure the public key is in `/home/mossbros/.ssh/authorized_keys`
3. Check permissions on droplet:
   ```bash
   chmod 700 ~/.ssh
   chmod 600 ~/.ssh/authorized_keys
   ```

### Deployment Script Fails

If deployment fails during the script execution:

1. Check the GitHub Actions logs for specific error messages
2. SSH into droplet and run the deployment manually:
   ```bash
   cd /home/mossbros/mossbros-backend
   ./deploy.sh
   ```
3. Verify all environment variables are set in `.env`

### Docker Build Fails

If Docker build fails:

1. Check available disk space: `df -h`
2. Clean up old images: `docker system prune -a`
3. Check Docker daemon logs: `sudo journalctl -u docker`

### Health Check Fails

If containers are unhealthy:

1. Check backend logs: `docker compose logs backend`
2. Verify database connection: `docker compose logs postgres`
3. Check Redis: `docker compose logs redis`
4. Test health endpoint manually:
   ```bash
   curl http://localhost:4000/health
   ```

## Security Best Practices

1. **Never commit the private key** to your repository
2. **Rotate SSH keys** periodically (every 90 days recommended)
3. **Use different SSH keys** for different purposes (personal access vs CI/CD)
4. **Monitor GitHub Actions logs** for unauthorized access attempts
5. **Enable branch protection** rules to require reviews before merging to main

## Workflow Overview

The GitHub Actions workflow (`.github/workflows/deploy.yml`) performs:

1. **Test Job**:
   - Checks out code
   - Sets up Node.js
   - Installs dependencies
   - Runs tests with PostgreSQL and Redis services
   - Uploads coverage to Codecov (if token provided)

2. **Build Job**:
   - Builds Docker image to verify compilation

3. **Deploy Job**:
   - Connects to droplet via SSH
   - Pulls latest code from GitHub
   - Runs deployment script
   - Restarts containers
   - Verifies health checks

## Next Steps

After successful CI/CD setup:

1. Install Cloudflare SSL certificates (see DEPLOYMENT.md)
2. Set up monitoring and alerting
3. Configure automated backups
4. Set up staging environment
5. Implement blue-green deployments for zero-downtime updates
