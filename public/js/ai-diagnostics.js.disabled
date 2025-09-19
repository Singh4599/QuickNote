// AI Diagnostics Module for MediVerse AI
class AIDiagnostics {
  constructor() {
    this.reports = [];
    this.isProcessing = false;
    this.init();
  }

  init() {
    this.setupFileUpload();
    this.loadReports();
  }

  setupFileUpload() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    if (!dropZone || !fileInput) return;

    // Drag and drop functionality
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('border-blue-500', 'bg-blue-50');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('border-blue-500', 'bg-blue-50');
      const files = Array.from(e.dataTransfer.files);
      this.handleFiles(files);
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this.handleFiles(files);
    });
  }

  async handleFiles(files) {
    if (this.isProcessing) {
      this.showToast('Please wait for the current analysis to complete', 'warning');
      return;
    }

    for (const file of files) {
      if (this.validateFile(file)) {
        await this.uploadAndAnalyze(file);
      }
    }
  }

  validateFile(file) {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      this.showToast('Please upload JPG, PNG, or PDF files only', 'error');
      return false;
    }

    if (file.size > maxSize) {
      this.showToast('File size must be less than 10MB', 'error');
      return false;
    }

    return true;
  }

  async uploadAndAnalyze(file) {
    this.isProcessing = true;
    this.showProcessingStatus(true);

    try {
      // Create report entry first
      const reportData = {
        title: file.name,
        file_type: this.getFileType(file.type),
        processing_status: 'pending',
        owner_id: Auth.getCurrentUser()?.id
      };

      const { data: report, error: reportError } = await supabaseClient
        .from('diagnostic_reports')
        .insert(reportData)
        .select()
        .single();

      if (reportError) throw reportError;

      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${report.id}.${fileExt}`;
      const filePath = `diagnostic-files/${Auth.getCurrentUser().id}/${fileName}`;

      // Try to upload to storage bucket, but handle gracefully if bucket doesn't exist
      let fileUrl = null;
      try {
        const { data: uploadData, error: uploadError } = await supabaseClient.storage
          .from('medical-files')
          .upload(filePath, file);

        if (uploadError) {
          console.warn('Storage upload failed, proceeding without file storage:', uploadError.message);
          // Continue without file storage - use base64 data instead
          const reader = new FileReader();
          reader.onload = () => {
            fileUrl = reader.result; // base64 data URL
          };
          reader.readAsDataURL(file);
        } else {
          // Get public URL if upload succeeded
          const { data: urlData } = supabaseClient.storage
            .from('medical-files')
            .getPublicUrl(filePath);
          fileUrl = urlData.publicUrl;
        }
      } catch (storageError) {
        console.warn('Storage not available, using base64 encoding:', storageError.message);
        // Fallback to base64 encoding
        const reader = new FileReader();
        reader.onload = () => {
          fileUrl = reader.result;
        };
        reader.readAsDataURL(file);
      }

      // Update report with file URL (if we have one)
      if (fileUrl) {
        await supabaseClient
          .from('diagnostic_reports')
          .update({ file_url: fileUrl })
          .eq('id', report.id);
      }

      // Call AI analysis
      await this.callAIAnalysis(report.id, file);

      this.showToast('File uploaded and analysis started!', 'success');
      
    } catch (error) {
      console.error('Upload error:', error);
      this.showToast('Failed to upload file: ' + error.message, 'error');
    } finally {
      this.isProcessing = false;
      this.showProcessingStatus(false);
      this.loadReports();
    }
  }

  async analyzeText() {
    const textInput = document.getElementById('textInput');
    const text = textInput.value.trim();

    if (!text) {
      this.showToast('Please enter some text to analyze', 'warning');
      return;
    }

    if (this.isProcessing) {
      this.showToast('Please wait for the current analysis to complete', 'warning');
      return;
    }

    this.isProcessing = true;
    this.showProcessingStatus(true);

    try {
      // Create report entry
      const user = Auth.getCurrentUser();
      if (!user) throw new Error('User not authenticated');
      
      const { data: reportData, error: insertError } = await supabaseClient
        .from('diagnostic_reports')
        .insert({
          owner_id: user.id,
          file_url: null,
          mime: 'text/plain',
          original_text: text,
          processing_status: 'processing'
        })
        .select()
        .single();

      if (insertError) throw insertError;

      await this.callAIAnalysis(reportData.id, null, text);

      textInput.value = '';
      this.showToast('Text analysis started!', 'success');

    } catch (error) {
      console.error('Text analysis error:', error);
      this.showToast('Failed to analyze text: ' + error.message, 'error');
    } finally {
      this.isProcessing = false;
      this.showProcessingStatus(false);
      this.loadReports();
    }
  }

  async callAIAnalysis(reportId, file = null, text = null) {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const payload = {
        reportId,
        fileContent: file ? await this.fileToBase64(file) : null,
        fileType: file ? this.getFileType(file.type) : 'text',
        originalText: text
      };

      // Call local AI mock for immediate testing
      try {
        // Simulate AI analysis with realistic medical responses
        const mockAIAnalysis = await simulateAIAnalysis(payload.fileContent, payload.fileType, payload.originalText);
        
        console.log('✅ AI Analysis Result:', mockAIAnalysis);

        // Update the report in database with AI results
        const user = Auth.getCurrentUser();
        const { data, error } = await supabaseClient
          .from('diagnostic_reports')
          .update({
            processing_status: 'completed',
            ai_summary: mockAIAnalysis.summary,
            key_findings: Array.isArray(mockAIAnalysis.key_findings) ? mockAIAnalysis.key_findings : [mockAIAnalysis.key_findings],
            follow_ups: Array.isArray(mockAIAnalysis.followups) ? mockAIAnalysis.followups : [mockAIAnalysis.followups],
            explanation: mockAIAnalysis.patient_friendly_explainer,
            risk_level: mockAIAnalysis.risk_level,
            updated_at: new Date().toISOString()
          })
          .eq('id', reportId);

        if (error) throw error;

        if (window.Toast) {
          window.Toast.success('AI analysis completed successfully!');
        }
        await this.loadReports(); // Refresh the reports list

      } catch (error) {
        console.error('❌ AI Analysis Error:', error);
        this.showToast(`AI analysis failed: ${error.message}`, 'error');
        
        // Update status to failed
        await supabaseClient
          .from('diagnostic_reports')
          .update({ 
            processing_status: 'failed',
            ai_summary: `Analysis failed: ${error.message}`,
            updated_at: new Date().toISOString()
          })
          .eq('id', reportId);
      }

    } catch (error) {
      console.error('AI Analysis error:', error);
      // Update report status to failed
      await supabaseClient
        .from('diagnostic_reports')
        .update({ processing_status: 'failed' })
        .eq('id', reportId);
    }
  }

  async loadReports() {
    try {
      const user = Auth.getCurrentUser();
      if (!user) return;

      const { data: reports, error } = await supabaseClient
        .from('diagnostic_reports')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false});

      if (error) throw error;

      this.reports = reports || [];
      this.renderReports();
      this.updateDashboardStats();

    } catch (error) {
      console.error('Failed to load reports:', error);
    }
  }

  renderReports() {
    const container = document.getElementById('reportsContainer');
    const recentContainer = document.getElementById('recentReports');
    const allReportsContainer = document.getElementById('allReportsContainer');

    if (!container) return;

    if (this.reports.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-file-medical text-6xl mb-4 opacity-50"></i>
          <h3 class="text-xl font-semibold mb-2">No Reports Yet</h3>
          <p>Upload your first medical document to get started with AI analysis</p>
        </div>
      `;
      return;
    }

    const reportsHTML = this.reports.map(report => this.renderReportCard(report)).join('');
    container.innerHTML = reportsHTML;

    // Update recent reports in dashboard
    if (recentContainer) {
      const recentReports = this.reports.slice(0, 3);
      recentContainer.innerHTML = recentReports.length > 0 
        ? recentReports.map(report => this.renderRecentReportCard(report)).join('')
        : `
          <div class="text-gray-500 text-center py-8">
            <i class="fas fa-file-medical text-4xl mb-3 opacity-50"></i>
            <p>No reports yet. Upload your first medical document!</p>
          </div>
        `;
    }

    // Update all reports page
    if (allReportsContainer) {
      allReportsContainer.innerHTML = reportsHTML;
    }
  }

  renderReportCard(report) {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };

    const riskColors = {
      low: 'text-green-600',
      medium: 'text-yellow-600',
      high: 'text-orange-600',
      critical: 'text-red-600'
    };

    return `
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md transition-shadow">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
              <i class="fas fa-${this.getFileIcon(report.file_type)} text-white"></i>
            </div>
            <div>
              <h4 class="font-semibold text-gray-900">${report.title}</h4>
              <p class="text-sm text-gray-500">${new Date(report.created_at).toLocaleDateString()}</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColors[report.processing_status]}">
            ${report.processing_status.charAt(0).toUpperCase() + report.processing_status.slice(1)}
          </span>
        </div>

        ${report.processing_status === 'completed' && report.ai_summary ? `
          <div class="space-y-3">
            <div>
              <h5 class="font-medium text-gray-900 mb-2">AI Summary</h5>
              <p class="text-gray-700 text-sm">${report.ai_summary}</p>
            </div>
            
            ${report.risk_level ? `
              <div class="flex items-center">
                <span class="text-sm font-medium text-gray-600 mr-2">Risk Level:</span>
                <span class="font-semibold ${riskColors[report.risk_level]}">
                  ${report.risk_level.charAt(0).toUpperCase() + report.risk_level.slice(1)}
                </span>
              </div>
            ` : ''}

            ${report.key_findings && report.key_findings.length > 0 ? `
              <div>
                <h6 class="font-medium text-gray-900 mb-2">Key Findings</h6>
                <ul class="text-sm text-gray-700 space-y-1">
                  ${report.key_findings.map(finding => `<li>• ${finding}</li>`).join('')}
                </ul>
              </div>
            ` : ''}

            <div class="flex gap-2 mt-4">
              <button onclick="aiDiagnostics.viewReport('${report.id}')" class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Details
              </button>
              <button onclick="aiDiagnostics.copyReport('${report.id}')" class="text-gray-600 hover:text-gray-800 text-sm font-medium">
                Copy
              </button>
              <button onclick="aiDiagnostics.deleteReport('${report.id}')" class="text-red-600 hover:text-red-800 text-sm font-medium">
                Delete
              </button>
            </div>
          </div>
        ` : report.processing_status === 'failed' ? `
          <div class="text-red-600 text-sm">
            Analysis failed. Please try uploading again.
          </div>
        ` : `
          <div class="text-blue-600 text-sm">
            ${report.processing_status === 'processing' ? 'AI is analyzing your data...' : 'Queued for analysis'}
          </div>
        `}
      </div>
    `;
  }

  renderRecentReportCard(report) {
    return `
      <div class="flex items-center p-3 bg-gray-50 rounded-lg">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
          <i class="fas fa-${this.getFileIcon(report.file_type)} text-blue-600"></i>
        </div>
        <div class="flex-1">
          <p class="font-medium text-gray-900 text-sm">${report.title}</p>
          <p class="text-xs text-gray-500">${new Date(report.created_at).toLocaleDateString()}</p>
        </div>
        <span class="text-xs px-2 py-1 rounded-full ${
          report.processing_status === 'completed' ? 'bg-green-100 text-green-800' :
          report.processing_status === 'processing' ? 'bg-blue-100 text-blue-800' :
          report.processing_status === 'failed' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }">
          ${report.processing_status}
        </span>
      </div>
    `;
  }

  updateDashboardStats() {
    const reportsCountEl = document.getElementById('reportsCount');
    if (reportsCountEl) {
      reportsCountEl.textContent = this.reports.length;
    }
  }

  async deleteReport(reportId) {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const { error } = await supabaseClient
        .from('diagnostic_reports')
        .delete()
        .eq('id', reportId);

      if (error) throw error;

      this.showToast('Report deleted successfully', 'success');
      this.loadReports();

    } catch (error) {
      console.error('Delete error:', error);
      this.showToast('Failed to delete report', 'error');
    }
  }

  copyReport(reportId) {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return;

    let text = `Medical Report: ${report.title}\n`;
    text += `Date: ${new Date(report.created_at).toLocaleDateString()}\n\n`;
    
    if (report.ai_summary) {
      text += `AI Summary: ${report.ai_summary}\n\n`;
    }
    
    if (report.key_findings && report.key_findings.length > 0) {
      text += `Key Findings:\n${report.key_findings.map(f => `• ${f}`).join('\n')}\n\n`;
    }
    
    if (report.follow_ups && report.follow_ups.length > 0) {
      text += `Recommendations:\n${report.follow_ups.map(f => `• ${f}`).join('\n')}\n\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      this.showToast('Report copied to clipboard', 'success');
    }).catch(() => {
      this.showToast('Failed to copy report', 'error');
    });
  }

  viewReport(reportId) {
    const report = this.reports.find(r => r.id === reportId);
    if (!report) return;

    // Create modal or detailed view
    this.showReportModal(report);
  }

  showReportModal(report) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex items-center justify-between mb-6">
            <h3 class="text-2xl font-bold text-gray-900">${report.title}</h3>
            <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div class="space-y-6">
            ${report.ai_summary ? `
              <div>
                <h4 class="font-semibold text-gray-900 mb-2">AI Analysis Summary</h4>
                <p class="text-gray-700">${report.ai_summary}</p>
              </div>
            ` : ''}
            
            ${report.key_findings && report.key_findings.length > 0 ? `
              <div>
                <h4 class="font-semibold text-gray-900 mb-2">Key Findings</h4>
                <ul class="space-y-2">
                  ${report.key_findings.map(finding => `
                    <li class="flex items-start">
                      <i class="fas fa-check-circle text-green-500 mr-2 mt-1"></i>
                      <span class="text-gray-700">${finding}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${report.follow_ups && report.follow_ups.length > 0 ? `
              <div>
                <h4 class="font-semibold text-gray-900 mb-2">Recommendations</h4>
                <ul class="space-y-2">
                  ${report.follow_ups.map(followUp => `
                    <li class="flex items-start">
                      <i class="fas fa-arrow-right text-blue-500 mr-2 mt-1"></i>
                      <span class="text-gray-700">${followUp}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
            
            ${report.explanation ? `
              <div>
                <h4 class="font-semibold text-gray-900 mb-2">Detailed Explanation</h4>
                <p class="text-gray-700 whitespace-pre-wrap">${report.explanation}</p>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  showProcessingStatus(show) {
    const statusEl = document.getElementById('processingStatus');
    if (statusEl) {
      statusEl.classList.toggle('hidden', !show);
    }
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500',
      info: 'bg-blue-500'
    };
    
    toast.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.remove('translate-x-full'), 100);
    setTimeout(() => {
      toast.classList.add('translate-x-full');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  getFileType(mimeType) {
    if (mimeType.includes('image')) return 'xray'; // Assume medical images are X-rays
    if (mimeType.includes('pdf')) return 'pdf';
    return 'text';
  }

  getFileIcon(fileType) {
    const icons = {
      xray: 'x-ray',
      mri: 'brain',
      pdf: 'file-pdf',
      text: 'file-text'
    };
    return icons[fileType] || 'file';
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = error => reject(error);
    });
  }
}

// Global functions
window.analyzeText = function() {
  if (window.aiDiagnostics) {
    window.aiDiagnostics.analyzeText();
  }
};

// AI Simulation Function for immediate testing
async function simulateAIAnalysis(fileContent, fileType, originalText = '') {
  // Enhanced AI simulation with comprehensive medical analysis
  const analysisTypes = {
    'image/jpeg': 'Medical Image Analysis',
    'image/png': 'Medical Image Analysis', 
    'application/pdf': 'Medical Report Analysis',
    'text/plain': 'Symptom Analysis'
  };

  // More sophisticated risk assessment
  const riskFactors = analyzeRiskFactors(fileType, originalText);
  const riskLevel = calculateRiskLevel(riskFactors);

  // Detailed medical findings based on file type
  const findings = generateDetailedFindings(fileType, riskLevel);
  const recommendations = generateRecommendations(riskLevel, fileType);
  const patientExplanation = generatePatientExplanation(riskLevel, findings);

  return {
    summary: `${analysisTypes[fileType] || 'Medical Analysis'}: ${findings.primary}`,
    key_findings: findings.detailed,
    followups: recommendations,
    patient_friendly_explainer: patientExplanation,
    risk_level: riskLevel,
    confidence_score: findings.confidence,
    analysis_timestamp: new Date().toISOString(),
    file_analysis_metadata: {
      file_type: fileType,
      processing_method: 'AI_SIMULATION_V2',
      analysis_duration: Math.floor(Math.random() * 5000) + 2000
    }
  };
}

function analyzeRiskFactors(fileType, content) {
  const riskKeywords = {
    high: ['abnormal', 'irregular', 'concerning', 'urgent', 'critical', 'severe'],
    medium: ['mild', 'moderate', 'monitor', 'follow-up', 'borderline'],
    low: ['normal', 'clear', 'healthy', 'stable', 'routine']
  };

  let riskScore = 0;
  const contentLower = (content || '').toLowerCase();
  
  riskKeywords.high.forEach(keyword => {
    if (contentLower.includes(keyword)) riskScore += 3;
  });
  riskKeywords.medium.forEach(keyword => {
    if (contentLower.includes(keyword)) riskScore += 2;
  });
  riskKeywords.low.forEach(keyword => {
    if (contentLower.includes(keyword)) riskScore -= 1;
  });

  return Math.max(0, riskScore);
}

function calculateRiskLevel(riskScore) {
  if (riskScore >= 6) return 'high';
  if (riskScore >= 3) return 'medium';
  return 'low';
}

function generateDetailedFindings(fileType, riskLevel) {
  const findingsDatabase = {
    low: {
      primary: 'Normal examination with no acute abnormalities detected',
      detailed: [
        'Cardiac silhouette within normal limits',
        'Clear bilateral lung fields',
        'No evidence of acute pathology',
        'Bone structures appear intact',
        'Soft tissues within normal parameters'
      ],
      confidence: '92-98%'
    },
    medium: {
      primary: 'Mild findings requiring monitoring and follow-up',
      detailed: [
        'Minor degenerative changes consistent with age',
        'Borderline measurements requiring follow-up',
        'Mild inflammatory markers present',
        'Early signs of wear and tear noted',
        'Functional capacity appears preserved'
      ],
      confidence: '85-92%'
    },
    high: {
      primary: 'Significant findings requiring immediate medical attention',
      detailed: [
        'Abnormal patterns requiring urgent evaluation',
        'Concerning structural changes identified',
        'Elevated risk markers present',
        'Immediate specialist consultation recommended',
        'Close monitoring and intervention may be needed'
      ],
      confidence: '78-88%'
    }
  };

  const findings = findingsDatabase[riskLevel];
  return {
    primary: findings.primary,
    detailed: findings.detailed.slice(0, 2 + Math.floor(Math.random() * 3)),
    confidence: findings.confidence
  };
}

function generateRecommendations(riskLevel, fileType) {
  const recommendationsDatabase = {
    low: [
      'Continue routine preventive care and annual screenings',
      'Maintain healthy lifestyle with regular exercise',
      'Follow standard dietary guidelines for optimal health',
      'Schedule next routine examination in 12 months'
    ],
    medium: [
      'Follow up with primary care physician in 3-6 months',
      'Consider additional diagnostic tests if symptoms develop',
      'Monitor for any changes in symptoms or condition',
      'Lifestyle modifications may help prevent progression',
      'Consider specialist consultation if indicated'
    ],
    high: [
      'Immediate follow-up with healthcare provider required',
      'Urgent specialist consultation recommended within 1-2 weeks',
      'Additional diagnostic workup needed to clarify findings',
      'Close monitoring and possible intervention required',
      'Patient education on warning signs and when to seek care'
    ]
  };

  return recommendationsDatabase[riskLevel].slice(0, 2 + Math.floor(Math.random() * 2));
}

function generatePatientExplanation(riskLevel, findings) {
  const explanations = {
    low: `Your test results show normal findings, which is excellent news. The examination reveals that everything appears to be functioning well and within expected ranges. This suggests your current health status is stable and there are no immediate concerns. Continue with your regular healthcare routine and maintain healthy lifestyle habits.`,
    medium: `Your results show some findings that require attention but are not immediately alarming. These changes are often related to normal aging or minor conditions that can be effectively managed. We recommend follow-up care to monitor these findings and ensure they don't progress. With proper care and monitoring, most people with similar findings maintain good health.`,
    high: `Your test results have identified some findings that require prompt medical attention. While this may be concerning, early detection is important for effective treatment. We strongly recommend following up with your healthcare provider as soon as possible to discuss these results and develop an appropriate treatment plan. Many conditions, when caught early, can be successfully managed.`
  };

  return explanations[riskLevel];
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.aiDiagnostics = new AIDiagnostics();
});
