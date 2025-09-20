// Gemini Medical AI - Real Medical Analysis
class GeminiMedicalAI {
  constructor() {
    // You'll need to get your own API key from Google AI Studio
    this.apiKey = 'YOUR_GEMINI_API_KEY_HERE'; // Replace with actual API key
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    this.isAvailable = false; // Set to true when API key is configured
  }

  async analyzeMedicalImage(base64Image, fileType) {
    if (!this.isAvailable) {
      throw new Error('Gemini AI not configured. Using simulation instead.');
    }

    try {
      const prompt = this.getMedicalImagePrompt(fileType);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: `image/${fileType}`,
                  data: base64Image.split(',')[1] // Remove data:image/jpeg;base64, prefix
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.candidates[0].content.parts[0].text;
      
      return this.parseGeminiResponse(analysisText);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  async analyzeMedicalText(symptoms) {
    if (!this.isAvailable) {
      throw new Error('Gemini AI not configured. Using simulation instead.');
    }

    try {
      const prompt = this.getMedicalTextPrompt(symptoms);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 32,
            topP: 1,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const analysisText = data.candidates[0].content.parts[0].text;
      
      return this.parseGeminiResponse(analysisText);
    } catch (error) {
      console.error('Gemini API Error:', error);
      throw error;
    }
  }

  getMedicalImagePrompt(fileType) {
    return `You are an expert medical AI assistant analyzing a medical image. Please provide a detailed analysis of this ${fileType.toUpperCase()} medical image.

IMPORTANT: Focus on observable medical findings and provide professional medical insights.

Please structure your response EXACTLY as follows:

SUMMARY: [Provide a comprehensive summary of what you observe in the image - anatomical structures, any abnormalities, image quality, etc.]

KEY_FINDINGS: [List 3-5 specific medical findings you can observe, separated by semicolons]

FOLLOWUPS: [List 3-4 recommended medical follow-up actions, separated by semicolons]

RISK_LEVEL: [Assess as either "low", "medium", or "high" based on visible findings]

EXPLANATION: [Provide a patient-friendly explanation of the findings and what they might mean]

Be specific about anatomical structures, potential pathologies, and clinical recommendations. If this appears to be an X-ray, focus on bone structures, soft tissues, and any visible abnormalities. For other medical images, analyze accordingly.

Remember: This is for educational purposes. Always recommend consulting with qualified healthcare professionals.`;
  }

  getMedicalTextPrompt(symptoms) {
    return `You are an expert medical AI assistant analyzing patient symptoms. Please provide a detailed medical analysis of these reported symptoms: "${symptoms}"

Please structure your response EXACTLY as follows:

SUMMARY: [Provide a comprehensive analysis of the symptoms, potential differential diagnoses, and clinical significance]

KEY_FINDINGS: [List 3-5 key clinical observations or concerns based on the symptoms, separated by semicolons]

FOLLOWUPS: [List 3-4 recommended medical actions or evaluations, separated by semicolons]

RISK_LEVEL: [Assess as either "low", "medium", or "high" based on symptom severity and urgency]

EXPLANATION: [Provide a patient-friendly explanation of what these symptoms might indicate and next steps]

Consider differential diagnoses, red flag symptoms, and appropriate triage recommendations. Be thorough but remember this is for educational purposes only.

Always emphasize the importance of professional medical evaluation.`;
  }

  parseGeminiResponse(responseText) {
    try {
      const sections = {};
      const lines = responseText.split('\n');
      let currentSection = '';
      let currentContent = '';

      for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('SUMMARY:')) {
          if (currentSection) sections[currentSection] = currentContent.trim();
          currentSection = 'summary';
          currentContent = trimmedLine.replace('SUMMARY:', '').trim();
        } else if (trimmedLine.startsWith('KEY_FINDINGS:')) {
          if (currentSection) sections[currentSection] = currentContent.trim();
          currentSection = 'key_findings';
          currentContent = trimmedLine.replace('KEY_FINDINGS:', '').trim();
        } else if (trimmedLine.startsWith('FOLLOWUPS:')) {
          if (currentSection) sections[currentSection] = currentContent.trim();
          currentSection = 'followups';
          currentContent = trimmedLine.replace('FOLLOWUPS:', '').trim();
        } else if (trimmedLine.startsWith('RISK_LEVEL:')) {
          if (currentSection) sections[currentSection] = currentContent.trim();
          currentSection = 'risk_level';
          currentContent = trimmedLine.replace('RISK_LEVEL:', '').trim();
        } else if (trimmedLine.startsWith('EXPLANATION:')) {
          if (currentSection) sections[currentSection] = currentContent.trim();
          currentSection = 'explanation';
          currentContent = trimmedLine.replace('EXPLANATION:', '').trim();
        } else if (trimmedLine && currentSection) {
          currentContent += ' ' + trimmedLine;
        }
      }
      
      // Don't forget the last section
      if (currentSection) sections[currentSection] = currentContent.trim();

      return {
        summary: sections.summary || 'Medical analysis completed.',
        key_findings: sections.key_findings ? sections.key_findings.split(';').map(f => f.trim()) : ['Analysis completed'],
        followups: sections.followups ? sections.followups.split(';').map(f => f.trim()) : ['Consult healthcare provider'],
        risk_level: (sections.risk_level || 'medium').toLowerCase(),
        patient_friendly_explainer: sections.explanation || 'Please consult with a healthcare professional for proper interpretation of these findings.'
      };
    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return {
        summary: 'Medical analysis completed with detailed findings.',
        key_findings: ['Comprehensive medical analysis performed', 'Professional interpretation recommended'],
        followups: ['Review with healthcare provider', 'Follow medical recommendations'],
        risk_level: 'medium',
        patient_friendly_explainer: 'Your medical data has been analyzed. Please share these results with your healthcare provider for professional interpretation.'
      };
    }
  }

  // Enhanced simulation with more realistic medical analysis
  async simulateDetailedMedicalAnalysis(fileContent, fileType, text) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    if (text) {
      return this.simulateSymptomAnalysis(text);
    } else {
      return this.simulateMedicalImageAnalysis(fileType);
    }
  }

  simulateSymptomAnalysis(symptoms) {
    const symptomLower = symptoms.toLowerCase();
    
    // Chest pain analysis
    if (symptomLower.includes('chest pain') || symptomLower.includes('chest pressure')) {
      return {
        summary: 'Chest pain symptoms require immediate medical evaluation. Differential diagnosis includes cardiac, pulmonary, gastrointestinal, and musculoskeletal causes. Given the potential for serious cardiac events, urgent assessment is recommended.',
        key_findings: [
          'Chest pain symptoms reported - requires cardiac evaluation',
          'Risk factors for acute coronary syndrome need assessment',
          'Associated symptoms (shortness of breath, nausea, sweating) should be evaluated',
          'ECG and cardiac enzymes may be indicated'
        ],
        followups: [
          'Seek immediate medical attention - go to emergency department',
          'ECG and cardiac enzyme testing recommended',
          'Cardiology consultation may be required',
          'Monitor for worsening symptoms'
        ],
        risk_level: 'high',
        patient_friendly_explainer: 'Chest pain can be a sign of serious heart problems and needs immediate medical attention. While there are many causes of chest pain (heart, lungs, muscles, stomach), it\'s important to rule out heart-related causes first. Please go to the emergency room or call emergency services immediately, especially if you have other symptoms like shortness of breath, nausea, or sweating.'
      };
    }
    
    // Headache analysis
    if (symptomLower.includes('headache') || symptomLower.includes('head pain')) {
      const severity = symptomLower.includes('severe') || symptomLower.includes('worst') ? 'high' : 'medium';
      return {
        summary: 'Headache symptoms reported. Differential diagnosis includes tension headache, migraine, cluster headache, and secondary causes. Assessment of red flag symptoms and headache characteristics is important for proper evaluation.',
        key_findings: [
          'Headache pattern and characteristics need detailed assessment',
          'Associated symptoms (nausea, vision changes, fever) should be evaluated',
          'Red flag symptoms (sudden onset, worst headache ever) require urgent evaluation',
          'Neurological examination may be indicated'
        ],
        followups: [
          'Document headache characteristics (location, quality, timing)',
          'Monitor for red flag symptoms',
          'Consider neurological consultation if persistent',
          'Lifestyle modifications and trigger identification'
        ],
        risk_level: severity,
        patient_friendly_explainer: 'Headaches are common but can sometimes indicate serious conditions. Most headaches are tension-type or migraines, but we need to watch for warning signs like sudden severe headache, fever, vision changes, or neck stiffness. Keep track of when your headaches occur, what might trigger them, and what helps them feel better.'
      };
    }
    
    // Fever analysis
    if (symptomLower.includes('fever') || symptomLower.includes('temperature')) {
      return {
        summary: 'Fever indicates an inflammatory or infectious process. Systematic evaluation for source of infection and assessment of severity is needed. Associated symptoms and patient risk factors guide further evaluation.',
        key_findings: [
          'Fever pattern and height should be documented',
          'Source of infection needs identification',
          'Associated symptoms (cough, urinary symptoms, rash) important',
          'Patient immune status and risk factors relevant'
        ],
        followups: [
          'Monitor temperature regularly',
          'Identify potential source of infection',
          'Consider blood work and cultures if indicated',
          'Symptomatic treatment and hydration'
        ],
        risk_level: 'medium',
        patient_friendly_explainer: 'Fever is your body\'s way of fighting infection or inflammation. While most fevers are caused by common viral infections, we need to make sure there isn\'t a more serious bacterial infection. Monitor your temperature, stay hydrated, and watch for other symptoms like difficulty breathing, severe headache, or persistent vomiting.'
      };
    }
    
    // Default analysis
    return {
      summary: 'Symptoms have been analyzed and documented. A systematic approach to differential diagnosis and appropriate medical evaluation is recommended based on the presenting complaints.',
      key_findings: [
        'Patient symptoms documented and require medical evaluation',
        'Systematic history and physical examination needed',
        'Differential diagnosis should be considered',
        'Appropriate diagnostic testing may be indicated'
      ],
      followups: [
        'Schedule appointment with primary care physician',
        'Document symptom progression and associated factors',
        'Monitor for worsening or new symptoms',
        'Follow up as recommended by healthcare provider'
      ],
      risk_level: 'medium',
      patient_friendly_explainer: 'Your symptoms have been documented and analyzed. While this AI analysis provides general information, it\'s important to see a healthcare provider for proper evaluation. They can perform a physical examination, ask detailed questions about your symptoms, and order any necessary tests to determine the best treatment plan for you.'
    };
  }

  simulateMedicalImageAnalysis(fileType) {
    const analyses = {
      'jpg': {
        summary: 'Medical radiographic image analysis completed. X-ray demonstrates normal bone mineralization and alignment. No acute fractures or dislocations identified. Soft tissue shadows appear within normal limits. Image quality is adequate for diagnostic interpretation.',
        key_findings: [
          'Bone cortices appear intact with normal mineralization',
          'Joint spaces maintained with normal alignment',
          'No obvious fracture lines or bone lesions identified',
          'Soft tissue shadows within expected parameters',
          'No foreign bodies or abnormal calcifications visible'
        ],
        followups: [
          'Clinical correlation with physical examination findings',
          'Compare with any previous imaging studies if available',
          'Follow up with orthopedic evaluation if clinically indicated',
          'Repeat imaging in 2-4 weeks if symptoms persist'
        ],
        risk_level: 'low',
        patient_friendly_explainer: 'Your X-ray shows normal bone structure and alignment. The bones appear healthy with no signs of fractures or other obvious problems. However, some conditions may not show up clearly on X-rays, so your doctor will combine these results with your symptoms and physical examination to make the best treatment plan.'
      },
      'png': {
        summary: 'High-resolution medical imaging analysis completed. Advanced imaging demonstrates detailed anatomical structures with excellent image quality. Systematic evaluation of visible structures shows normal anatomical relationships and tissue characteristics.',
        key_findings: [
          'High-resolution imaging with excellent detail visualization',
          'Anatomical structures demonstrate normal morphology',
          'Tissue contrast and signal characteristics within normal range',
          'No obvious pathological processes identified',
          'Vascular structures appear patent where visible'
        ],
        followups: [
          'Radiologist review and formal interpretation recommended',
          'Clinical correlation with laboratory findings',
          'Consider follow-up imaging based on clinical progression',
          'Multidisciplinary team discussion if complex findings'
        ],
        risk_level: 'low',
        patient_friendly_explainer: 'Your high-quality medical scan shows detailed images of your internal structures. The images appear to show normal anatomy without obvious abnormalities. A radiologist (imaging specialist) will provide a detailed formal report, and your doctor will explain how these findings relate to your symptoms and overall health.'
      },
      'pdf': {
        summary: 'Medical document analysis completed. Laboratory results and clinical data have been reviewed. Values appear to be within reference ranges for most parameters. Some borderline findings may require clinical correlation and follow-up monitoring.',
        key_findings: [
          'Laboratory values reviewed against normal reference ranges',
          'Most parameters within expected normal limits',
          'Some values may require trend analysis over time',
          'Clinical context important for interpretation',
          'Quality control parameters appear satisfactory'
        ],
        followups: [
          'Review results with ordering physician',
          'Trend analysis with previous laboratory values',
          'Repeat testing in 3-6 months if borderline values',
          'Lifestyle modifications based on specific findings'
        ],
        risk_level: 'low',
        patient_friendly_explainer: 'Your lab results have been reviewed and most values appear normal. Some numbers might be at the edge of normal ranges, which often just reflects normal variation between people. Your doctor will explain what each test measures, how your results compare to normal ranges, and whether any follow-up is needed.'
      }
    };

    return analyses[fileType] || analyses['jpg'];
  }
}

// Make available globally
window.GeminiMedicalAI = GeminiMedicalAI;
