#!/bin/bash

# Colors for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Hedera Smart Contract Audit AI - GitHub Setup${NC}"
echo -e "${BLUE}========================================${NC}"

# Initialize git repository if it doesn't exist
if [ ! -d .git ]; then
  echo -e "${BLUE}Initializing Git repository...${NC}"
  git init
  echo -e "${GREEN}Git repository initialized!${NC}"
else
  echo -e "${GREEN}Git repository already exists.${NC}"
fi

# Add all files to git
echo -e "${BLUE}Adding files to Git...${NC}"
git add .

# Initial commit
echo -e "${BLUE}Creating initial commit...${NC}"
git commit -m "Initial commit - Hedera Smart Contract Audit AI"

echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Setup complete!${NC}"
echo -e "${BLUE}Now run the following commands:${NC}"
echo -e "1. Create a new repository on GitHub without README or LICENSE"
echo -e "2. Connect your local repo with:"
echo -e "   ${GREEN}git remote add origin https://github.com/your-username/hedera-smart-contract-audit-ai.git${NC}"
echo -e "3. Push your code to GitHub:"
echo -e "   ${GREEN}git push -u origin main${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}After pushing to GitHub, you can deploy on Vercel:${NC}"
echo -e "1. Go to https://vercel.com/new"
echo -e "2. Import your GitHub repository"
echo -e "3. Vercel should auto-detect settings using vercel.json"
echo -e "4. Click Deploy"
echo -e "${BLUE}========================================${NC}" 