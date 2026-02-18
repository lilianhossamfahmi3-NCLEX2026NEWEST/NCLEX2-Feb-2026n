# 🚀 Deployment Preparation Guide: NCLEX-RN NGN Simulator

To transition the NCLEX-RN NGN Simulator from a local development environment to a live production environment using **Vercel**, **Supabase**, and **GitHub**, please provide the following configuration details and credentials.

---

## 1. 🐙 GitHub (Source Control)
We need to establish a remote repository to host your codebase and trigger Vercel deployments.
- **Repository Name**: (e.g., `username/senior-nclex-simulator`)
- **Git State**: Have you already initialized a local git repository? If not, I can do this for you.
- **Access**: I will need a **GitHub Personal Access Token (PAT)** with `repo` scope to push the code programmatically, or you can guide me through a manual push if you prefer.

## 2. ⚡ Supabase (Database & Backend)
Supabase will handle our PostgreSQL database (via Prisma) and optionally Authentication/Storage.
- **Project URL**: Found in Supabase Dashboard -> Project Settings -> API (e.g., `https://xyz.supabase.co`)
- **Anon Key**: Found in Supabase Dashboard -> Project Settings -> API.
- **Service Role Key**: (Required for administrative database operations).
- **Database Connection String**: Found in Settings -> Database -> Connection String (Transaction mode is recommended for Vercel/Prisma).
  - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT_ID].supabase.co:6543/postgres?pgbouncer=true`

## 3. 📐 Vercel (Production Hosting)
Vercel will host the frontend and serverless API functions.
- **Vercel Access Token**: You can generate this at [vercel.com/account/tokens](https://vercel.com/account/tokens). This allows me to link the project and trigger deployments from the command line.
- **Project Name**: What would you like the Vercel project to be named? (e.g., `nclex-ngn-simulator`)

---

## 🛠️ Next Steps for You:
1. **Create Account/Projects**: If you haven't already, please create accounts and projects on [GitHub](https://github.com), [Supabase](https://supabase.com), and [Vercel](https://vercel.com).
2. **Environment Variables**: Once you have the keys, you can provide them to me in a secure format, or simply inform me when you are ready to enter them into a `.env` file during our deployment session.
3. **Confirm Permissions**: Let me know if you would like me to execute the CLI commands (`git push`, `vercel deploy`, `prisma migrate`) directly on your behalf.

**I am ready to proceed once these clinical logistics are secured.**
