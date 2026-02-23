# NCLEX-RN NGN Simulator — Vercel Deployment Guide

This document outlines the challenges, solutions, and preventative measures encountered during the deployment of the high-fidelity NCLEX-RN NGN Clinical Simulator to Vercel.

---

## 🚨 1. The "11MB Vault" Crash (Memory & Bundle Size)

### Problem
The `vaultItems.ts` file reached ~11MB due to the expansion of 1,000+ high-fidelity NGN items. This caused:
- **TypeScript Compiler (TSC) Failures**: The compiler ran out of memory attempting to index the massive TS object.
- **Vercel Build Crashes**: The serverless environment peaked on memory limits during the static optimization phase.
- **Client-Side Freezes**: Users experienced a 5-10 second white screen while the browser parsed the massive JS bundle.

### Solution: Structural Decoupling
1. **From `.ts` to `.json`**: Converted `vaultItems.ts` to `vaultItems.json` and moved it to the `public/data/` directory.
2. **Lazy Loading**: Implemented `vaultLoader.ts` using `fetch()` to load the data on-demand only when a user enters the AI Bank or starts a session.
3. **Index Regeneration**: Created a Node.js script (`regen_vault_index.cjs`) that automatically crawls the `data/ai-generated/vault/` folder to build a lightweight index without crashing the build process.

---

## 🔑 2. API Key Management (Vercel Environment Variables)

### Problem
The mission to generate items in bulk requires high-volume API access. Environment variables in Vercel have length limits and can be difficult to manage for 14+ rotating keys.

### Solution: Tactical Rotation
- **Multi-Key Setup**: Configured environment variables `VITE_GEMINI_API_KEY_1` through `VITE_GEMINI_API_KEY_14` in Vercel.
- **Client-Side Rotation**: The `AIBankPage.tsx` and generation scripts use a round-robin rotation logic to bypass the per-key rate limits (30-60 RPM).
- **Graceful Failover**: If one key is exhausted in the production environment, the engine automatically skips to the next index.

---

## 🔄 3. Supabase & Environment Sync

### Problem
Static site generation (SSG) in Vite can sometimes bake in environment variables that differ between `preview` and `production` branches.

### Solution: Runtime Resolution
- **Prefixing**: All clinical keys are prefixed with `VITE_` to ensure they are available in the client bundle.
- **Connection Logic**: Database URLs are kept exclusively on the server side (for generation scripts), while the anonymous key and URL are used for the real-time session saving logic in the front end.

---

## 🛡️ 4. Preventative Measures for Future Stability

1. **Schema Check**: Always run `scripts/ai/repairVault.ts` before pushing to `main`. This ensures no malformed JSON (trailing commas, missing fields) breaks the production build.
2. **Bundle Analytics**: Periodically check bundle size. Ensure the `public/data/` folder remains the primary repository for mass data, keeping the main application logic below 500KB.
3. **CI/CD Hook**: Add `node regen_vault_index.cjs` to the Vercel Build Command:
   ```bash
   node regen_vault_index.cjs && tsc && vite build
   ```

---

*Last Updated: February 23, 2026*
