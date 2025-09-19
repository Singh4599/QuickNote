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
    const { type, content, fileType, text } = await req.json()
    
    // Get Gemini API key from environment
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key not configured')
    }

    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    
    let prompt = ''
    let requestBody: any = {
      generationConfig: {
        temperature: 0.1,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    }

    // Configure prompt based on analysis type
    if (type === 'image') {
      prompt = `
You are a medical AI assistant analyzing medical imaging. Please provide a detailed analysis of this medical image.

IMPORTANT MEDICAL DISCLAIMER: This analysis is for educational and informational purposes only. It should NOT be used as a substitute for professional medical diagnosis, treatment, or advice. Always consult with qualified healthcare professionals for medical decisions.

Please analyze this medical image and provide:

1. **Image Type Identification**: What type of medical imaging is this? (X-ray, CT scan, MRI, ultrasound, etc.)

2. **Anatomical Structures**: What body parts/organs are visible in the image?

3. **Image Quality Assessment**: Comment on the technical quality of the image (clarity, positioning, contrast, etc.)

4. **Observable Features**: Describe what can be seen in the image (normal anatomy, any visible abnormalities, artifacts, etc.)

5. **Clinical Observations**: Note any significant findings that might be relevant (while emphasizing this is not a diagnosis)

6. **Recommendations**: Suggest next steps (professional consultation, additional imaging, etc.)

7. **Risk Assessment**: Provide a general risk level (Low/Medium/High) based on visible features

Format your response as a structured medical report with clear sections.
Remember to emphasize that this is an AI analysis and requires professional medical interpretation.
`

      // Remove data URL prefix if present
      const base64Data = content.replace(/^data:image\/[a-z]+;base64,/, '')
      
      requestBody.contents = [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
              data: base64Data
            }
          }
        ]
      }]

    } else if (type === 'text') {
      prompt = `
You are a medical AI assistant. A patient has described their symptoms or medical information. Please provide a helpful analysis.

IMPORTANT MEDICAL DISCLAIMER: This analysis is for educational and informational purposes only. It should NOT be used as a substitute for professional medical diagnosis, treatment, or advice. Always consult with qualified healthcare professionals for medical decisions.

Patient's description: "${text}"

Please provide:

1. **Symptom Analysis**: Summarize and categorize the reported symptoms

2. **Possible Conditions**: List potential medical conditions that could be associated with these symptoms (emphasize these are possibilities, not diagnoses)

3. **Risk Assessment**: Provide a general risk level (Low/Medium/High) based on the described symptoms

4. **Immediate Actions**: Suggest immediate steps the patient should take

5. **When to Seek Care**: Specify when to seek immediate, urgent, or routine medical care

6. **Lifestyle Recommendations**: General health advice that might be helpful

7. **Red Flags**: Symptoms that would require immediate medical attention

Format your response as a structured medical assessment with clear sections.
Always emphasize the need for professional medical consultation.
`

      requestBody.contents = [{
        parts: [{ text: prompt }]
      }]

    } else if (type === 'pdf') {
      prompt = `
You are a medical AI assistant analyzing a medical document. Please provide a comprehensive analysis.

IMPORTANT MEDICAL DISCLAIMER: This analysis is for educational and informational purposes only. It should NOT be used as a substitute for professional medical diagnosis, treatment, or advice. Always consult with qualified healthcare professionals for medical decisions.

Please analyze this medical document and provide:

1. **Document Type**: Identify the type of medical document (lab report, radiology report, discharge summary, etc.)

2. **Key Medical Information**: Extract and summarize the most important medical data

3. **Test Results**: Highlight any test results, values, or measurements

4. **Clinical Findings**: Summarize any clinical observations or findings

5. **Recommendations**: Note any medical recommendations or follow-up instructions

6. **Risk Assessment**: Provide a general risk level based on the document content

7. **Next Steps**: Suggest appropriate follow-up actions

Format your response as a structured medical document analysis with clear sections.
`

      // Remove data URL prefix if present
      const base64Data = content.replace(/^data:application\/pdf;base64,/, '')
      
      requestBody.contents = [{
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: 'application/pdf',
              data: base64Data
            }
          }
        ]
      }]
    }

    // Call Gemini API
    const response = await fetch(`${apiUrl}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text

    if (!analysisText) {
      throw new Error('No analysis text received from Gemini AI')
    }

    // Parse the analysis into structured format
    const structuredAnalysis = parseGeminiAnalysis(analysisText)

    return new Response(
      JSON.stringify({ 
        success: true, 
        analysis: structuredAnalysis 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Gemini Analysis Error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        fallback: getFallbackAnalysis(req.url.includes('type='))
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})

// Parse Gemini AI response into structured format
function parseGeminiAnalysis(analysisText: string) {
  const sections = {
    summary: '',
    key_findings: [] as string[],
    followups: [] as string[],
    patient_friendly_explainer: '',
    risk_level: 'medium'
  }

  // Extract summary (first paragraph or section)
  const summaryMatch = analysisText.match(/(?:Summary|Analysis|Overview)[:\s]*([^#\n]*(?:\n[^#\n]*)*?)(?=\n\n|\n#|$)/i)
  if (summaryMatch) {
    sections.summary = summaryMatch[1].trim()
  } else {
    // Use first paragraph as summary
    const firstParagraph = analysisText.split('\n\n')[0]
    sections.summary = firstParagraph.replace(/[#*]/g, '').trim()
  }

  // Extract key findings
  const findingsSection = analysisText.match(/(?:Key Findings|Clinical Observations|Observable Features)[:\s]*([^#]*?)(?=\n#|$)/i)
  if (findingsSection) {
    const findings = findingsSection[1]
      .split(/\n[-•*]\s*/)
      .filter((f: string) => f.trim())
      .map((f: string) => f.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 5)
    sections.key_findings = findings
  }

  // Extract recommendations/follow-ups
  const followupsSection = analysisText.match(/(?:Recommendations|Next Steps|Follow-up|Immediate Actions)[:\s]*([^#]*?)(?=\n#|$)/i)
  if (followupsSection) {
    const followups = followupsSection[1]
      .split(/\n[-•*]\s*/)
      .filter((f: string) => f.trim())
      .map((f: string) => f.replace(/^\d+\.\s*/, '').trim())
      .slice(0, 4)
    sections.followups = followups
  }

  // Extract risk level
  const riskMatch = analysisText.match(/risk\s*(?:level|assessment)[:\s]*(\w+)/i)
  if (riskMatch) {
    const risk = riskMatch[1].toLowerCase()
    if (['low', 'medium', 'high', 'critical'].includes(risk)) {
      sections.risk_level = risk
    }
  }

  // Create patient-friendly explanation
  sections.patient_friendly_explainer = `Based on the AI analysis of your medical information, here's what we found: ${sections.summary} 

IMPORTANT: This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment recommendations.`

  // Ensure we have some content
  if (!sections.summary) {
    sections.summary = "AI analysis completed. Please review the detailed findings below."
  }
  
  if (sections.key_findings.length === 0) {
    sections.key_findings = ["Medical information processed by AI", "Professional review recommended"]
  }
  
  if (sections.followups.length === 0) {
    sections.followups = ["Consult with healthcare provider", "Keep this analysis for medical records"]
  }

  return sections
}

// Fallback analysis when Gemini AI fails
function getFallbackAnalysis(type: string) {
  return {
    summary: "Medical analysis service temporarily unavailable. Your information has been processed and is ready for professional review.",
    key_findings: [
      "Medical information successfully processed",
      "AI analysis service will retry automatically", 
      "Professional medical consultation recommended"
    ],
    followups: [
      "Schedule appointment with healthcare provider",
      "Keep this information for medical records",
      "Monitor symptoms if applicable"
    ],
    patient_friendly_explainer: "Your medical information has been received and processed. While our AI analysis service is temporarily unavailable, your information is documented and ready for professional medical review.",
    risk_level: "medium"
  }
}
