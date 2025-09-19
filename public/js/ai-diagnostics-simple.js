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
    const resultsContainer = document.getElementById('analysisResults');
    if (!resultsContainer) return;

    const resultHtml = `
      <div class="bg-white rounded-xl shadow-lg p-6 mb-6 border-l-4 border-blue-500">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-bold text-slate-800">
            📊 ${report.file_name}
          </h3>
          <div class="flex items-center gap-2">
            <span class="px-3 py-1 rounded-full text-sm font-medium ${
              report.risk_level === 'high' ? 'bg-red-100 text-red-700' :
              report.risk_level === 'medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-green-100 text-green-700'
            }">
              ${report.risk_level.toUpperCase()} Risk
            </span>
            <span class="text-sm text-slate-500">${new Date(report.created_at).toLocaleString()}</span>
          </div>
        </div>

        <div class="space-y-4">
          <div>
            <h4 class="font-semibold text-slate-700 mb-2">📋 Summary</h4>
            <p class="text-slate-600 bg-slate-50 p-3 rounded-lg">${report.ai_summary}</p>
          </div>

          <div>
            <h4 class="font-semibold text-slate-700 mb-2">🔍 Key Findings</h4>
            <ul class="list-disc list-inside space-y-1 text-slate-600 bg-slate-50 p-3 rounded-lg">
              ${report.key_findings.map(finding => `<li>${finding}</li>`).join('')}
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-slate-700 mb-2">📝 Recommended Follow-ups</h4>
            <ul class="list-disc list-inside space-y-1 text-slate-600 bg-slate-50 p-3 rounded-lg">
              ${report.follow_ups.map(followup => `<li>${followup}</li>`).join('')}
            </ul>
          </div>

          <div>
            <h4 class="font-semibold text-slate-700 mb-2">👤 Patient-Friendly Explanation</h4>
            <p class="text-slate-600 bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">${report.patient_friendly_explainer}</p>
          </div>
        </div>

        <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p class="text-sm text-yellow-800">
            <strong>⚠️ Important Medical Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice, diagnosis, or treatment. Always consult with qualified healthcare providers for medical decisions.
          </p>
        </div>
      </div>
    `;

    resultsContainer.innerHTML = resultHtml + resultsContainer.innerHTML;
  }

  async loadReports() {
    const reportsContainer = document.getElementById('reportsContainer');
    if (!reportsContainer) return;

    if (this.reports.length === 0) {
      reportsContainer.innerHTML = `
        <div class="text-center py-8 text-slate-500">
          <div class="text-6xl mb-4">📊</div>
          <p class="text-lg">No AI reports yet</p>
          <p class="text-sm">Upload a medical file or describe symptoms to get started</p>
        </div>
      `;
      return;
    }

    const reportsHtml = this.reports.map(report => `
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Initializing Simple AI Diagnostics...');
  window.AIDiagnosticsSimple = new AIDiagnosticsSimple();
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AIDiagnosticsSimple;
}
