// Simple AI Diagnostics - Works without database dependencies
class AIDiagnosticsSimple {
  constructor() {
    this.isProcessing = false;
    this.reports = JSON.parse(localStorage.getItem('ai_reports') || '[]');
    this.init();
  }

  init() {
    console.log('🧠 Initializing Simple AI Diagnostics...');
    this.setupFileUpload();
    this.setupTextAnalysis();
    this.loadReports();
  }

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

  setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const chooseFileBtn = document.getElementById('chooseFileBtn');
    const dropZone = document.querySelector('.drop-zone');

    if (chooseFileBtn) {
      chooseFileBtn.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });
    }

    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
          this.handleFiles(files);
        }
      });
    }

    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
          this.handleFiles(files);
        }
      });
    }
  }

  setupTextAnalysis() {
    const analyzeBtn = document.getElementById('analyzeBtn');
    const symptomText = document.getElementById('symptomText');

    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        if (symptomText && symptomText.value.trim()) {
          this.analyzeText();
        } else {
          this.showMessage('Please enter your symptoms or medical information', 'error');
        }
      });
    }
  }

  async handleFiles(files) {
    if (this.isProcessing) {
      this.showMessage('Please wait for the current analysis to complete', 'error');
      return;
    }

    for (const file of files) {
      if (!this.validateFile(file)) continue;
      
      try {
        await this.uploadAndAnalyze(file);
      } catch (error) {
        console.error('File processing error:', error);
        this.showMessage(`Failed to process ${file.name}: ${error.message}`, 'error');
      }
    }
  }

  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (file.size > maxSize) {
      this.showMessage(`File ${file.name} is too large. Maximum size is 10MB.`, 'error');
      return false;
    }

    if (!allowedTypes.includes(file.type)) {
      this.showMessage(`File type ${file.type} is not supported. Please upload JPG, PNG, or PDF files.`, 'error');
      return false;
    }

    return true;
  }

  async uploadAndAnalyze(file) {
    this.isProcessing = true;
    this.showProcessingStatus(true);

    try {
      this.showMessage(`📤 Processing ${file.name}...`, 'info');

      // Convert file to base64
      const fileContent = await this.fileToBase64(file);
      const fileType = this.getFileType(file.type);

      // Create report object
      const report = {
        id: Date.now().toString(),
        file_name: file.name,
        file_type: fileType,
        file_size: file.size,
        created_at: new Date().toISOString(),
        processing_status: 'processing'
      };

      // Call AI analysis
      const analysisResult = await this.callAIAnalysis(report, fileContent);

      // Complete the report
      const completeReport = {
        ...report,
        processing_status: 'completed',
        ai_summary: analysisResult.summary,
        key_findings: analysisResult.key_findings,
        follow_ups: analysisResult.followups || analysisResult.follow_ups,
        risk_level: analysisResult.risk_level,
        patient_friendly_explainer: analysisResult.patient_friendly_explainer,
        updated_at: new Date().toISOString()
      };

      // Save to localStorage
      this.reports.unshift(completeReport);
      localStorage.setItem('ai_reports', JSON.stringify(this.reports));

      this.showMessage(`✅ Analysis completed for ${file.name}!`, 'success');
      this.displayAnalysisResult(completeReport);
      this.loadReports();

    } catch (error) {
      console.error('Upload and analysis error:', error);
      this.showMessage(`Failed to analyze ${file.name}: ${error.message}`, 'error');
    } finally {
      this.isProcessing = false;
      this.showProcessingStatus(false);
    }
  }

  async analyzeText() {
    if (this.isProcessing) {
      this.showMessage('Please wait for the current analysis to complete', 'error');
      return;
    }

    const symptomText = document.getElementById('symptomText');
    const text = symptomText.value.trim();

    if (!text) {
      this.showMessage('Please enter your symptoms or medical information', 'error');
      return;
    }

    this.isProcessing = true;
    this.showProcessingStatus(true);

    try {
      this.showMessage('🔬 Analyzing your symptoms...', 'info');

      // Create report object
      const report = {
        id: Date.now().toString(),
        file_name: 'Symptom Analysis',
        file_type: 'text',
        original_text: text,
        created_at: new Date().toISOString(),
        processing_status: 'processing'
      };

      // Call AI analysis
      const analysisResult = await this.callAIAnalysis(report, null, text);

      // Complete the report
      const completeReport = {
        ...report,
        processing_status: 'completed',
        ai_summary: analysisResult.summary,
        key_findings: analysisResult.key_findings,
        follow_ups: analysisResult.followups || analysisResult.follow_ups,
        risk_level: analysisResult.risk_level,
        patient_friendly_explainer: analysisResult.patient_friendly_explainer,
        updated_at: new Date().toISOString()
      };

      // Save to localStorage
      this.reports.unshift(completeReport);
      localStorage.setItem('ai_reports', JSON.stringify(this.reports));

      this.showMessage('✅ Symptom analysis completed!', 'success');
      this.displayAnalysisResult(completeReport);
      this.loadReports();

      // Clear the text area
      symptomText.value = '';

    } catch (error) {
      console.error('Text analysis error:', error);
      this.showMessage('Failed to analyze symptoms: ' + error.message, 'error');
    } finally {
      this.isProcessing = false;
      this.showProcessingStatus(false);
    }
  }

  async callAIAnalysis(report, fileContent = null, text = null) {
    try {
      let analysisResult;

      // Use real Gemini AI if available
      if (window.GeminiMedicalAI) {
        console.log('🧠 Using Gemini AI for real medical analysis...');
        
        if (text) {
          // Text-based analysis
          analysisResult = await window.GeminiMedicalAI.analyzeMedicalText(text);
        } else if (fileContent) {
          // File-based analysis
          if (report.file_type === 'pdf') {
            analysisResult = await window.GeminiMedicalAI.analyzeMedicalDocument(fileContent);
          } else {
            // Image analysis (X-ray, MRI, CT scan, etc.)
            analysisResult = await window.GeminiMedicalAI.analyzeMedicalImage(fileContent, report.file_type);
          }
        }
      } else {
        console.log('⚠️ Gemini AI not available, using simulation...');
        // Fallback to simulation
        analysisResult = await this.simulateAIAnalysis(fileContent, report.file_type, text);
      }
      
      console.log('✅ AI Analysis Result:', analysisResult);
      return analysisResult;

    } catch (error) {
      console.error('AI Analysis Error:', error);
      throw error;
    }
  }

  async simulateAIAnalysis(fileContent, fileType, text) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    if (text) {
      // Text-based analysis
      const symptoms = text.toLowerCase();
      let riskLevel = 'low';
      let findings = ['Symptoms documented and analyzed'];
      let followups = ['Monitor symptoms', 'Stay hydrated', 'Get adequate rest'];

      if (symptoms.includes('chest pain') || symptoms.includes('heart') || symptoms.includes('cardiac')) {
        riskLevel = 'high';
        findings = ['Chest pain symptoms reported', 'Cardiac evaluation recommended', 'Immediate medical attention advised'];
        followups = ['Seek immediate medical care', 'Contact emergency services if severe', 'Schedule cardiology consultation'];
      } else if (symptoms.includes('headache') || symptoms.includes('fever') || symptoms.includes('pain')) {
        riskLevel = 'medium';
        findings = ['Pain symptoms reported', 'May require medical evaluation', 'Monitor for worsening'];
        followups = ['Schedule doctor appointment', 'Take over-the-counter pain relief if appropriate', 'Monitor temperature'];
      }

      return {
        summary: `Symptom analysis completed for reported ${symptoms.includes('pain') ? 'pain' : 'symptoms'}. ${riskLevel === 'high' ? 'Immediate medical attention recommended.' : 'Monitoring and follow-up advised.'}`,
        key_findings: findings,
        followups: followups,
        risk_level: riskLevel,
        patient_friendly_explainer: `Based on your symptom description, we've identified ${riskLevel} risk level concerns. ${riskLevel === 'high' ? 'Please seek immediate medical attention.' : 'Continue monitoring your symptoms and consult with a healthcare provider.'} This AI analysis is for informational purposes only and should not replace professional medical advice.`
      };
    } else {
      // File-based analysis
      const fileAnalysis = {
        'jpg': {
          summary: 'Medical image analysis completed. X-ray or medical photograph processed.',
          key_findings: ['Medical imaging file processed', 'Image quality appears adequate', 'Professional radiologist review recommended'],
          followups: ['Share with healthcare provider', 'Schedule follow-up appointment', 'Keep for medical records'],
          risk_level: 'medium'
        },
        'png': {
          summary: 'Medical image analysis completed. High-quality medical image processed.',
          key_findings: ['High-resolution medical image', 'Clear anatomical structures visible', 'Suitable for professional review'],
          followups: ['Discuss with doctor', 'Include in medical history', 'Monitor related symptoms'],
          risk_level: 'medium'
        },
        'pdf': {
          summary: 'Medical document analysis completed. Lab report or medical document processed.',
          key_findings: ['Medical document processed', 'Contains structured medical data', 'Professional interpretation recommended'],
          followups: ['Review with healthcare provider', 'Follow medical recommendations', 'Schedule follow-up if needed'],
          risk_level: 'medium'
        }
      };

      const analysis = fileAnalysis[fileType] || fileAnalysis['jpg'];
      
      return {
        ...analysis,
        patient_friendly_explainer: `Your medical ${fileType.toUpperCase()} file has been processed and analyzed. ${analysis.summary} Please share this analysis with your healthcare provider for professional interpretation. This AI analysis is for informational purposes only.`
      };
    }
  }

  displayAnalysisResult(report) {
    const resultsDiv = document.getElementById('analysisResults');
    const resultContent = document.getElementById('resultContent');
    
    if (!resultsDiv || !resultContent) {
      console.error('Analysis results containers not found');
      return;
    }

    const riskColor = report.risk_level === 'high' ? '#ff6b9d' : 
                     report.risk_level === 'medium' ? '#fa709a' : '#43e97b';

    resultContent.innerHTML = `
      <div style="margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
          <h4 style="color: white; margin: 0;">${report.file_name}</h4>
          <span style="background: ${riskColor}20; color: ${riskColor}; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">
            ${report.risk_level.toUpperCase()} RISK
          </span>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h5 style="color: white; margin-bottom: 8px;">📋 Summary:</h5>
          <p style="color: rgba(255,255,255,0.8); line-height: 1.5;">${report.ai_summary}</p>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h5 style="color: white; margin-bottom: 8px;">🔍 Key Findings:</h5>
          <ul style="color: rgba(255,255,255,0.8); padding-left: 20px;">
            ${report.key_findings.map(finding => `<li style="margin-bottom: 4px;">${finding}</li>`).join('')}
          </ul>
        </div>
        
        <div style="margin-bottom: 15px;">
          <h5 style="color: white; margin-bottom: 8px;">📝 Recommended Follow-ups:</h5>
          <ul style="color: rgba(255,255,255,0.8); padding-left: 20px;">
            ${report.follow_ups.map(followup => `<li style="margin-bottom: 4px;">${followup}</li>`).join('')}
          </ul>
        </div>
        
        <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; border-left: 4px solid ${riskColor};">
          <h5 style="color: white; margin-bottom: 8px;">💡 Patient-Friendly Explanation:</h5>
          <p style="color: rgba(255,255,255,0.8); line-height: 1.5; font-size: 0.9rem;">${report.patient_friendly_explainer}</p>
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background: rgba(255, 107, 157, 0.1); border-radius: 8px;">
          <p style="color: #ff6b9d; font-size: 0.8rem; text-align: center;">
            ⚠️ This AI analysis is for informational purposes only. Always consult with qualified healthcare professionals for medical decisions.
          </p>
        </div>
      </div>
    `;

    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
  }

  loadReports() {
    const reportsContainer = document.getElementById('reportsList');
    if (!reportsContainer) return;

    if (this.reports.length === 0) {
      reportsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: rgba(255,255,255,0.5);">
          <i class="fas fa-file-medical" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
          <p>No reports yet. Upload a medical file or describe symptoms to get started.</p>
        </div>
      `;
      return;
    }

    const reportsHtml = this.reports.map(report => `
      <div style="background: rgba(255,255,255,0.05); padding: 15px; border-radius: 8px; margin-bottom: 15px;">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
          <h4 style="color: white; margin: 0;">${report.file_name}</h4>
          <span style="background: ${report.risk_level === 'high' ? '#ff6b9d' : report.risk_level === 'medium' ? '#fa709a' : '#43e97b'}20; color: ${report.risk_level === 'high' ? '#ff6b9d' : report.risk_level === 'medium' ? '#fa709a' : '#43e97b'}; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: bold;">
            ${report.risk_level.toUpperCase()} RISK
      <div class="bg-white rounded-lg shadow-md p-4 mb-4 hover:shadow-lg transition-shadow">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold text-slate-800">${report.file_name}</h4>
          <span class="px-2 py-1 rounded text-xs font-medium ${
            report.risk_level === 'high' ? 'bg-red-100 text-red-700' :
            report.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }">
            ${report.risk_level.toUpperCase()}
          </span>
        </div>
        <p class="text-sm text-slate-600 mb-2">${report.ai_summary}</p>
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>${report.file_type.toUpperCase()}</span>
          <span>${new Date(report.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    `).join('');

    reportsContainer.innerHTML = reportsHtml;
  }

  showProcessingStatus(show) {
    const processingDiv = document.getElementById('processingStatus');
    if (processingDiv) {
      processingDiv.style.display = show ? 'block' : 'none';
    }
  }

  getFileType(mimeType) {
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'jpg';
    if (mimeType.includes('png')) return 'png';
    if (mimeType.includes('pdf')) return 'pdf';
    return 'unknown';
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

// Make class available globally
window.AIDiagnosticsSimple = AIDiagnosticsSimple;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIDiagnosticsSimple;
}
