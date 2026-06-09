# NextAuth v5 Migration Guide

## ✅ Completed Steps

1. ✅ Installed NextAuth v5 (`next-auth@beta`)
2. ✅ Created `auth.ts` configuration with Google OAuth provider
3. ✅ Created `/app/api/auth/[...nextauth]/route.ts` API route handler
4. ✅ Updated `AuthContext.tsx` to use NextAuth's `useSession` hook
5. ✅ Updated `LoginDialog.tsx` to use NextAuth's `signIn` function
6. ✅ Updated `app/layout.tsx` to use NextAuth's `SessionProvider`
7. ✅ Created TypeScript type definitions for NextAuth

## 🔧 Setup Required

### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth 2.0 Client ID**
6. Application type: **Web application**
7. Authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://recipe-smart.vercel.app/api/auth/callback/google` (for production)
8. Copy **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

Add to `.env.local`:

```bash
# NextAuth v5 Configuration (Google OAuth)
GOOGLE_ID=your-google-client-id-here
GOOGLE_SECRET=your-google-client-secret-here

# NextAuth v5 Secret (generate with: openssl rand -base64 32)
# Note: NextAuth v5 uses AUTH_SECRET instead of NEXTAUTH_SECRET
AUTH_SECRET=your-auth-secret-here
AUTH_URL=http://localhost:3000
```

**Generate Auth Secret:**

```bash
openssl rand -base64 32
```

### Step 3: Update Vercel Environment Variables

**Important:** NextAuth v5 uses `AUTH_URL` and `AUTH_SECRET` (not `NEXTAUTH_URL` and `NEXTAUTH_SECRET`)

Add these to Vercel Dashboard → Your Project → Settings → Environment Variables:

**Required for NextAuth v5:**

```bash

GOOGLE_ID=your-google-client-id-here
GOOGLE_SECRET=your-google-client-secret-here
AUTH_SECRET=your-auth-secret-here
AUTH_URL=https://recipe-smart.vercel.app
```

**Note:** For production, set `AUTH_URL` to your Vercel deployment URL. Vercel may auto-detect it, but it's better to set it explicitly.

See `VERCEL_ENV_VARIABLES_NEXTAUTH.txt` for the complete list of all environment variables.

## 🧪 Testing

1. Start dev server: `npm run dev`
2. Click "Login" button
3. Click "Continue with Google"
4. Sign in with Google account
5. You should be redirected back and see your profile in the navbar

## 📝 Notes

- Old Auth0 login/signup routes (`/api/auth/login`, `/api/auth/signup`) are still present but won't be used
- You can remove Auth0 dependencies later: `npm uninstall @auth0/auth0-react @auth0/nextjs-auth0`
- NextAuth handles sessions automatically - no manual token storage needed
- UI updates automatically after login (no page refresh needed)

## 🐛 Troubleshooting

- **"Invalid credentials"**: Check Google OAuth credentials are correct
- **"Redirect URI mismatch"**: Ensure redirect URI in Google Console matches exactly
- **Session not persisting**: Check `AUTH_SECRET` is set correctly (not `NEXTAUTH_SECRET`)
