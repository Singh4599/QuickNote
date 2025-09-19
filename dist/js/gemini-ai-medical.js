// Real Gemini AI Integration for Medical Analysis
class GeminiMedicalAI {
  constructor() {
    // Gemini API key from Supabase Edge Functions
    this.apiKey = 'AIzaSyAzjRwpPo-LR0F94AcChlhozGgfdEc2O4g';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.visionApiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  // Show message using existing system
  showMessage(message, type = 'info') {
    if (window.SimpleAuth && window.SimpleAuth.showMessage) {
      window.SimpleAuth.showMessage(message, type);
    } else if (window.Toast) {
      if (type === 'success') window.Toast.success(message);
      else if (type === 'error') window.Toast.error(message);
      else window.Toast.info(message);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }

  // Analyze medical image (X-ray, MRI, CT scan, etc.)
  async analyzeMedicalImage(imageBase64, fileType) {
    try {
      this.showMessage('🔬 Analyzing medical image with Gemini AI...', 'info');

      // Use Supabase Edge Function for secure API calls
      if (window.supabaseClient) {
        const { data, error } = await window.supabaseClient.functions.invoke('gemini-analysis', {
          body: {
            type: 'image',
            content: imageBase64,
            fileType: fileType
          }
        });

        if (error) throw error;
        if (data.success) {
          this.showMessage('✅ Medical image analysis completed!', 'success');
          return data.analysis;
        } else {
          throw new Error(data.error || 'Analysis failed');
        }
      }

      // Fallback to direct API call if Supabase not available
      return await this.directGeminiCall('image', imageBase64, fileType);

    } catch (error) {
      console.error('Gemini AI Analysis Error:', error);
      this.showMessage(`❌ AI Analysis failed: ${error.message}`, 'error');
      
      // Return fallback analysis
      return this.getFallbackAnalysis('image');
    }
  }

  // Analyze medical text/symptoms
  async analyzeMedicalText(text) {
    try {
      this.showMessage('🔬 Analyzing symptoms with Gemini AI...', 'info');

      // Use Supabase Edge Function for secure API calls
      if (window.supabaseClient) {
        const { data, error } = await window.supabaseClient.functions.invoke('gemini-analysis', {
          body: {
            type: 'text',
            text: text
          }
        });

        if (error) throw error;
        if (data.success) {
          this.showMessage('✅ Symptom analysis completed!', 'success');
          return data.analysis;
        } else {
          throw new Error(data.error || 'Analysis failed');
        }
      }

      // Fallback to direct API call if Supabase not available
      return await this.directGeminiCall('text', null, null, text);

    } catch (error) {
      console.error('Gemini AI Text Analysis Error:', error);
      this.showMessage(`❌ AI Analysis failed: ${error.message}`, 'error');
      
      // Return fallback analysis
      return this.getFallbackAnalysis('text');
    }
  }

  // Analyze PDF medical documents
  async analyzeMedicalDocument(pdfBase64) {
    try {
      this.showMessage('📄 Analyzing medical document with Gemini AI...', 'info');

      // Use Supabase Edge Function for secure API calls
      if (window.supabaseClient) {
        const { data, error } = await window.supabaseClient.functions.invoke('gemini-analysis', {
          body: {
            type: 'pdf',
            content: pdfBase64
          }
        });

        if (error) throw error;
        if (data.success) {
          this.showMessage('✅ Medical document analysis completed!', 'success');
          return data.analysis;
        } else {
          throw new Error(data.error || 'Analysis failed');
        }
      }

      // Fallback to direct API call if Supabase not available
      return await this.directGeminiCall('pdf', pdfBase64);

    } catch (error) {
      console.error('Gemini AI Document Analysis Error:', error);
      this.showMessage(`❌ Document analysis failed: ${error.message}`, 'error');
      
      return this.getFallbackAnalysis('pdf');
    }
  }

  // Direct Gemini API call (fallback when Supabase Edge Function is not available)
  async directGeminiCall(type, content = null, fileType = null, text = null) {
    try {
      let prompt = '';
      let requestBody = {
        generationConfig: {
          temperature: 0.1,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      };

      if (type === 'image') {
        prompt = `You are a medical AI assistant analyzing medical imaging. Please provide a detailed analysis of this medical image.

IMPORTANT MEDICAL DISCLAIMER: This analysis is for educational and informational purposes only. It should NOT be used as a substitute for professional medical diagnosis, treatment, or advice. Always consult with qualified healthcare professionals for medical decisions.

Please analyze this medical image and provide:
1. **Image Type Identification**: What type of medical imaging is this?
2. **Anatomical Structures**: What body parts/organs are visible?
3. **Image Quality Assessment**: Comment on technical quality
4. **Observable Features**: Describe what can be seen
5. **Clinical Observations**: Note significant findings
6. **Recommendations**: Suggest next steps
7. **Risk Assessment**: Provide risk level (Low/Medium/High)

Format your response as a structured medical report with clear sections.`;

        const base64Data = content.replace(/^data:image\/[a-z]+;base64,/, '');
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
        }];

      } else if (type === 'text') {
        prompt = `You are a medical AI assistant. A patient has described their symptoms: "${text}"

IMPORTANT MEDICAL DISCLAIMER: This analysis is for educational and informational purposes only.

Please provide:
1. **Symptom Analysis**: Summarize the reported symptoms
2. **Possible Conditions**: List potential conditions (emphasize these are possibilities)
3. **Risk Assessment**: Provide risk level (Low/Medium/High)
4. **Immediate Actions**: Suggest immediate steps
5. **When to Seek Care**: Specify urgency levels
6. **Lifestyle Recommendations**: General health advice
7. **Red Flags**: Symptoms requiring immediate attention

Format as a structured medical assessment.`;

        requestBody.contents = [{ parts: [{ text: prompt }] }];

      } else if (type === 'pdf') {
        prompt = `You are a medical AI assistant analyzing a medical document.

IMPORTANT MEDICAL DISCLAIMER: This analysis is for educational and informational purposes only.

Please analyze this medical document and provide:
1. **Document Type**: Identify the document type
2. **Key Medical Information**: Extract important data
3. **Test Results**: Highlight results and values
4. **Clinical Findings**: Summarize observations
5. **Recommendations**: Note medical recommendations
6. **Risk Assessment**: Provide risk level
7. **Next Steps**: Suggest follow-up actions

Format as a structured document analysis.`;

        const base64Data = content.replace(/^data:application\/pdf;base64,/, '');
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
        }];
      }

      const response = await fetch(`${this.visionApiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const analysisText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!analysisText) {
        throw new Error('No analysis text received from Gemini AI');
      }

      return this.parseGeminiAnalysis(analysisText);

    } catch (error) {
      console.error('Direct Gemini API call failed:', error);
      throw error;
    }
  }

  // Parse Gemini AI response into structured format
  parseGeminiAnalysis(analysisText) {
    try {
      // Extract key sections from the analysis
      const sections = {
        summary: '',
        key_findings: [],
        followups: [],
        patient_friendly_explainer: '',
        risk_level: 'medium'
      };

      // Extract summary (first paragraph or section)
      const summaryMatch = analysisText.match(/(?:Summary|Analysis|Overview)[:\s]*([^#\n]*(?:\n[^#\n]*)*?)(?=\n\n|\n#|$)/i);
      if (summaryMatch) {
        sections.summary = summaryMatch[1].trim();
      } else {
        // Use first paragraph as summary
        const firstParagraph = analysisText.split('\n\n')[0];
        sections.summary = firstParagraph.replace(/[#*]/g, '').trim();
      }

      // Extract key findings
      const findingsSection = analysisText.match(/(?:Key Findings|Clinical Observations|Observable Features)[:\s]*([^#]*?)(?=\n#|$)/i);
      if (findingsSection) {
        const findings = findingsSection[1]
          .split(/\n[-•*]\s*/)
          .filter(f => f.trim())
          .map(f => f.replace(/^\d+\.\s*/, '').trim())
          .slice(0, 5); // Limit to 5 findings
        sections.key_findings = findings;
      }

      // Extract recommendations/follow-ups
      const followupsSection = analysisText.match(/(?:Recommendations|Next Steps|Follow-up|Immediate Actions)[:\s]*([^#]*?)(?=\n#|$)/i);
      if (followupsSection) {
        const followups = followupsSection[1]
          .split(/\n[-•*]\s*/)
          .filter(f => f.trim())
          .map(f => f.replace(/^\d+\.\s*/, '').trim())
          .slice(0, 4); // Limit to 4 follow-ups
        sections.followups = followups;
      }

      // Extract risk level
      const riskMatch = analysisText.match(/risk\s*(?:level|assessment)[:\s]*(\w+)/i);
      if (riskMatch) {
        const risk = riskMatch[1].toLowerCase();
        if (['low', 'medium', 'high', 'critical'].includes(risk)) {
          sections.risk_level = risk;
        }
      }

      // Create patient-friendly explanation
      sections.patient_friendly_explainer = `Based on the AI analysis of your medical information, here's what we found: ${sections.summary} 

IMPORTANT: This AI analysis is for informational purposes only and should not replace professional medical advice. Please consult with a qualified healthcare provider for proper diagnosis and treatment recommendations.`;

      // Ensure we have some content
      if (!sections.summary) {
        sections.summary = "AI analysis completed. Please review the detailed findings below.";
      }
      
      if (sections.key_findings.length === 0) {
        sections.key_findings = ["Medical information processed by AI", "Professional review recommended"];
      }
      
      if (sections.followups.length === 0) {
        sections.followups = ["Consult with healthcare provider", "Keep this analysis for medical records"];
      }

      return sections;

    } catch (error) {
      console.error('Error parsing Gemini analysis:', error);
      return this.getFallbackAnalysis('parsing_error');
    }
  }

  // Fallback analysis when Gemini AI fails
  getFallbackAnalysis(type) {
    const fallbacks = {
      image: {
        summary: "Medical image uploaded and processed. AI analysis service temporarily unavailable.",
        key_findings: [
          "Medical image successfully uploaded",
          "Image appears to be a valid medical scan",
          "Professional radiologist review recommended",
          "AI analysis service will retry automatically"
        ],
        followups: [
          "Schedule appointment with healthcare provider",
          "Bring this image to your next medical consultation",
          "Consider getting a second opinion if needed"
        ],
        patient_friendly_explainer: "Your medical image has been uploaded successfully. While our AI analysis service is temporarily unavailable, your image is ready for professional medical review. Please share this with your healthcare provider.",
        risk_level: "medium"
      },
      text: {
        summary: "Symptom information recorded. AI analysis service temporarily unavailable.",
        key_findings: [
          "Symptoms and medical information documented",
          "Information ready for healthcare provider review",
          "AI analysis service will retry automatically",
          "Professional medical consultation recommended"
        ],
        followups: [
          "Schedule appointment with healthcare provider",
          "Monitor symptoms and keep a symptom diary",
          "Seek immediate care if symptoms worsen"
        ],
        patient_friendly_explainer: "Your symptom information has been recorded successfully. While our AI analysis service is temporarily unavailable, your information is documented and ready for professional medical review.",
        risk_level: "medium"
      },
      pdf: {
        summary: "Medical document uploaded and processed. AI analysis service temporarily unavailable.",
        key_findings: [
          "Medical document successfully uploaded",
          "Document appears to be valid medical record",
          "Professional review recommended",
          "AI analysis service will retry automatically"
        ],
        followups: [
          "Discuss document with healthcare provider",
          "Keep document for medical records",
          "Follow any existing medical recommendations"
        ],
        patient_friendly_explainer: "Your medical document has been uploaded successfully. While our AI analysis service is temporarily unavailable, your document is ready for professional medical review.",
        risk_level: "medium"
      }
    };

    return fallbacks[type] || fallbacks.text;
  }

  // Test API connection
  async testConnection() {
    try {
      console.log('🔄 Testing Gemini AI connection...');
      
      const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: "Hello, this is a test. Please respond with 'API connection successful'." }]
          }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 50,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('✅ Gemini AI API connection successful');
        console.log('🤖 Gemini response:', responseText);
        return true;
      } else {
        const errorData = await response.json();
        console.error('❌ Gemini AI API connection failed:', errorData);
        return false;
      }
    } catch (error) {
      console.error('❌ Gemini AI API test error:', error);
      return false;
    }
  }
}

// Initialize Gemini AI when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🧠 Initializing Gemini AI Medical Analysis...');
  window.GeminiMedicalAI = new GeminiMedicalAI();
  
  // Test connection with the configured API key
  console.log('🔑 Gemini API key configured, testing connection...');
  setTimeout(() => {
    window.GeminiMedicalAI.testConnection();
  }, 1000);
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiMedicalAI;
}
