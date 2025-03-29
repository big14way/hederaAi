# Deploying to Vercel

This document provides step-by-step instructions for deploying the Hedera Smart Contract Audit AI application to Vercel.

## Prerequisites

- A GitHub account with the project repository
- A Vercel account (sign up at [vercel.com](https://vercel.com) if you don't have one)

## Deployment Steps

### Step 1: Log in to Vercel

Go to [vercel.com](https://vercel.com) and sign in to your account.

### Step 2: Create a New Project

1. From the Vercel dashboard, click on "Add New" > "Project".
2. Connect your GitHub account if not already connected.
3. Select the "hedera-smart-contract-audit-ai" repository from the list.

### Step 3: Configure Project Settings

Configure the project with these settings:

- **Framework Preset**: React
- **Root Directory**: `frontend`
- **Build Command**: `npm run build` (should be auto-detected)
- **Output Directory**: `build` (should be auto-detected)

Vercel may auto-detect these settings based on our vercel.json file. If not, enter them manually.

### Step 4: Environment Variables

No environment variables are required for the current implementation.

### Step 5: Deploy

Click on the "Deploy" button and wait for the deployment process to complete.

### Step 6: Verify Deployment

Once the deployment is finished, Vercel will provide you with a URL (e.g., `https://hedera-smart-contract-audit-ai.vercel.app`).

Click on the URL to verify that your application is deployed correctly. You should see the Hedera Smart Contract Audit AI homepage.

## Automatic Deployments

Vercel automatically sets up continuous deployment from your GitHub repository. Any new commits pushed to the main branch will trigger a new deployment.

## Custom Domain (Optional)

To use a custom domain:

1. From your project dashboard, click on "Settings" > "Domains".
2. Click "Add" and enter your domain.
3. Follow the provided instructions to configure DNS settings for your domain.

## Troubleshooting

If you encounter issues during deployment:

1. Check the build logs for any errors.
2. Verify that the root directory is set to `frontend`.
3. Ensure all dependencies are correctly listed in the package.json file.
4. Check that the vercel.json file is correctly formatted. 