# 🚀 Deploy Gemini AI Edge Function to Supabase

## Prerequisites
1. Supabase CLI installed
2. Logged into your Supabase project
3. Gemini API key added to Supabase secrets

## Step 1: Install Supabase CLI (if not already installed)
```bash
npm install -g supabase
```

## Step 2: Login to Supabase
```bash
supabase login
```

## Step 3: Link to your project
```bash
supabase link --project-ref YOUR_PROJECT_REF
```

## Step 4: Set the Gemini API key as a secret
```bash
supabase secrets set GEMINI_API_KEY=AIzaSyAzjRwpPo-LR0F94AcChlhozGgfdEc2O4g
```

## Step 5: Deploy the Edge Function
```bash
supabase functions deploy gemini-analysis
```

## Step 6: Test the deployed function
```bash
curl -X POST 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/gemini-analysis' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "text",
    "text": "I have a headache and feel dizzy"
  }'
```

## Alternative: Manual Deployment via Supabase Dashboard

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Go to Edge Functions section

2. **Create New Function**
   - Name: `gemini-analysis`
   - Copy the code from `supabase/functions/gemini-analysis/index.ts`

3. **Set Environment Variable**
   - Go to Settings → Edge Functions
   - Add secret: `GEMINI_API_KEY` = `AIzaSyAzjRwpPo-LR0F94AcChlhozGgfdEc2O4g`

4. **Deploy Function**
   - Click Deploy
   - Test with sample request

## Function URL
After deployment, your function will be available at:
```
https://YOUR_PROJECT_REF.supabase.co/functions/v1/gemini-analysis
```

## Testing the Integration

1. **Open your MediVerse AI app**
2. **Go to AI Diagnostics**
3. **Upload a medical image or enter symptoms**
4. **Check browser console for logs**
5. **Verify real Gemini AI analysis results**

The function will automatically use your Gemini API key securely from the server side!
