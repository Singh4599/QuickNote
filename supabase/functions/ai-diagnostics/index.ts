import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get user from JWT
    const {
      data: { user },
    } = await supabaseClient.auth.getUser()

    if (!user) {
      throw new Error('Unauthorized')
    }

    const { reportId, fileContent, fileType, originalText } = await req.json()

    // Update report status to processing
    await supabaseClient
      .from('diagnostic_reports')
      .update({ processing_status: 'processing' })
      .eq('id', reportId)
      .eq('patient_id', user.id)

    // Prepare content for Gemini API
    let contentToAnalyze = ''
    if (fileType === 'text') {
      contentToAnalyze = originalText
    } else {
      // For files, we'll use a placeholder - in production, you'd implement OCR/image analysis
      contentToAnalyze = `Medical ${fileType.toUpperCase()} file analysis requested. File content: ${fileContent || 'Binary file uploaded'}`
    }

    // Call Google Gemini API
    const geminiApiKey = 'AIzaSyBLkCODKuavl9AwobsoXSJx4mDbR0lhzzk';
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured')
    }

    const prompt = `You are a medical AI assistant. Analyze the following medical data and provide a structured response:

${contentToAnalyze}

Please provide your analysis in the following JSON format:
{
  "summary": "Brief summary of the medical data",
  "key_findings": ["finding 1", "finding 2", "finding 3"],
  "follow_ups": ["recommendation 1", "recommendation 2"],
  "risk_level": "low|medium|high|critical",
  "explanation": "Detailed explanation of the analysis and reasoning"
}

Important: 
- Only provide medical insights based on the data provided
- Always recommend consulting with healthcare professionals
- Be conservative with risk assessments
- If the data is insufficient, indicate this in your response`

    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      }
    )

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.statusText}`)
    }

    const geminiData = await geminiResponse.json()
    const aiResponseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text

    if (!aiResponseText) {
      throw new Error('No response from Gemini API')
    }

    // Parse AI response
    let aiAnalysis
    try {
      // Extract JSON from the response (Gemini might include extra text)
      const jsonMatch = aiResponseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Could not parse AI response as JSON')
      }
    } catch (parseError) {
      // Fallback if JSON parsing fails
      aiAnalysis = {
        summary: aiResponseText.substring(0, 500),
        key_findings: ['Analysis completed - please review full response'],
        follow_ups: ['Consult with healthcare professional'],
        risk_level: 'medium',
        explanation: aiResponseText
      }
    }

    // Update the diagnostic report with AI analysis
    const { error: updateError } = await supabaseClient
      .from('diagnostic_reports')
      .update({
        ai_summary: aiAnalysis.summary,
        key_findings: aiAnalysis.key_findings,
        follow_ups: aiAnalysis.follow_ups,
        risk_level: aiAnalysis.risk_level,
        explanation: aiAnalysis.explanation,
        processing_status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', reportId)
      .eq('patient_id', user.id)

    if (updateError) {
      throw updateError
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis: aiAnalysis,
        message: 'AI analysis completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('AI Diagnostics Error:', error)
    
    // Update report status to failed if we have reportId
    try {
      const { reportId } = await req.json()
      if (reportId) {
        const supabaseClient = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_ANON_KEY') ?? ''
        )
        
        await supabaseClient
          .from('diagnostic_reports')
          .update({ processing_status: 'failed' })
          .eq('id', reportId)
      }
    } catch (updateError) {
      console.error('Failed to update report status:', updateError)
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'An error occurred during AI analysis'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
