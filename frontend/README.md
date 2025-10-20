# C-CAP Frontend - Quick Start

Vite + React + TypeScript + Tailwind v4 (shadcn/ui). Minimal steps to run locally on macOS.

---

## Requirements

> If you already have Node **20.x** (or **22.x**) working, skip to **Project setup**.

---

## 1) Homebrew (skip if `brew -v` works)
```bash
brew -v || /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# After install on Apple Silicon, add brew to your shell and reload:
echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zprofile
eval "$(/opt/homebrew/bin/brew shellenv)"
```

## 2) Node 20 (via Homebrew)
```bash
brew install node@20

# node@20 is keg-only; put it on your PATH:
echo 'export PATH="/opt/homebrew/opt/node@20/bin:$PATH"' >> ~/.zshrc
export PATH="/opt/homebrew/opt/node@20/bin:$PATH"
exec zsh -l

# Verify
node -v   # v20.x
npm -v
```

## 3) Project setup
```bash
git clone <REPO_URL> ccap-fe
cd ccap-fe
npm install
```

## 4) Run
```bash
npm run dev
```
Open the printed URL (usually http://localhost:5173).

## 5) Build & Preview
```bash
npm run build
npm run preview
```

## 6) Env (if your app calls a backend)
Create `.env.local` in the project root, then restart dev:
```bash
# example—adjust to your API
VITE_API_URL=http://localhost:3000
```

## Quick fixes
- **Port in use:** `npm run dev -- --port=5175`
- **npm not found / wrong node:** re-run the PATH export above.
- **Missing modules:** `rm -rf node_modules package-lock.json && npm install`
