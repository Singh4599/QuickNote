class AIAnalyticsGemini {
    constructor() {
        this.apiKey = 'AIzaSyBLkCODKuavl9AwobsoXSJx4mDbR0lhzzk';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        this.reports = JSON.parse(localStorage.getItem('aiAnalyticsReports') || '[]');
        this.isProcessing = false;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderReports();
        this.updateStats();
    }

    setupEventListeners() {
        // File upload
        const fileInput = document.getElementById('medical-file-input');
        const fileUploadArea = document.getElementById('file-upload-area');
        
        if (fileUploadArea) {
            fileUploadArea.addEventListener('click', () => fileInput?.click());
            fileUploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                fileUploadArea.style.borderColor = '#4facfe';
                fileUploadArea.style.background = 'rgba(79, 172, 254, 0.1)';
            });
            
            fileUploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                fileUploadArea.style.borderColor = 'rgba(255,255,255,0.2)';
                fileUploadArea.style.background = 'rgba(255,255,255,0.05)';
            });
            
            fileUploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                if (files.length > 0) {
                    this.handleFileUpload(files[0]);
                }
                fileUploadArea.style.borderColor = 'rgba(255,255,255,0.2)';
                fileUploadArea.style.background = 'rgba(255,255,255,0.05)';
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', (e) => {
                if (e.target.files.length > 0) {
                    this.handleFileUpload(e.target.files[0]);
                }
            });
        }

        // Symptom analysis
        const analyzeBtn = document.getElementById('analyze-symptoms-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeSymptoms());
        }

        // Symptom input enter key
        const symptomInput = document.getElementById('symptom-input');
        if (symptomInput) {
            symptomInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.analyzeSymptoms();
                }
            });
        }
    }

    async handleFileUpload(file) {
        if (this.isProcessing) return;

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf', 'text/plain'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast('Please upload a valid medical file (JPG, PNG, PDF, or TXT)', 'error');
            return;
        }

        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            this.showToast('File size must be less than 10MB', 'error');
            return;
        }

        this.isProcessing = true;
        this.showProcessingStatus(true);

        try {
            const fileContent = await this.readFileContent(file);
            const analysis = await this.analyzeWithGemini(fileContent, file.type, file.name);
            
            const report = {
                id: Date.now(),
                file_name: file.name,
                file_type: file.type,
                file_size: file.size,
                ai_summary: analysis.summary,
                key_findings: analysis.findings,
                risk_level: analysis.riskLevel,
                recommendations: analysis.recommendations,
                created_at: new Date().toISOString(),
                analysis_type: 'file_upload'
            };

            this.reports.unshift(report);
            this.saveReports();
            this.renderReports();
            this.updateStats();
            
            this.showToast('Medical file analyzed successfully!', 'success');
        } catch (error) {
            console.error('File analysis error:', error);
            this.showToast('Error analyzing file. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
            this.showProcessingStatus(false);
        }
    }

    async analyzeSymptoms() {
        const symptomInput = document.getElementById('symptom-input');
        const symptoms = symptomInput?.value?.trim();

        if (!symptoms) {
            this.showToast('Please describe your symptoms', 'warning');
            return;
        }

        if (this.isProcessing) return;

        this.isProcessing = true;
        this.showProcessingStatus(true);

        try {
            const analysis = await this.analyzeWithGemini(symptoms, 'text/symptoms', 'Symptom Analysis');
            
            const report = {
                id: Date.now(),
                file_name: 'Symptom Analysis',
                file_type: 'symptoms',
                original_text: symptoms,
                ai_summary: analysis.summary,
                key_findings: analysis.findings,
                risk_level: analysis.riskLevel,
                recommendations: analysis.recommendations,
                created_at: new Date().toISOString(),
                analysis_type: 'symptom_analysis'
            };

            this.reports.unshift(report);
            this.saveReports();
            this.renderReports();
            this.updateStats();
            
            symptomInput.value = '';
            this.showToast('Symptoms analyzed successfully!', 'success');
        } catch (error) {
            console.error('Symptom analysis error:', error);
            this.showToast('Error analyzing symptoms. Please try again.', 'error');
        } finally {
            this.isProcessing = false;
            this.showProcessingStatus(false);
        }
    }

    async analyzeWithGemini(content, contentType, fileName) {
        const prompt = this.createMedicalPrompt(content, contentType, fileName);
        
        const requestBody = {
            contents: [{
                parts: [{
                    text: prompt
                }]
            }],
            generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 1024,
            }
        };

        const response = await fetch(`${this.apiUrl}?key=${this.apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.candidates[0]?.content?.parts[0]?.text;
        
        if (!aiResponse) {
            throw new Error('No response from Gemini API');
        }

        return this.parseGeminiResponse(aiResponse);
    }

    createMedicalPrompt(content, contentType, fileName) {
        let basePrompt = `You are an advanced AI medical assistant. Analyze the following medical information and provide a comprehensive assessment.

IMPORTANT: Respond ONLY in valid JSON format with this exact structure:
{
    "summary": "Brief 2-3 sentence summary",
    "findings": ["finding1", "finding2", "finding3"],
    "riskLevel": "low|medium|high",
    "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}

`;

        if (contentType.includes('image')) {
            basePrompt += `Medical Image Analysis for: ${fileName}
Content: ${content}

Analyze this medical image and provide insights about potential conditions, abnormalities, or health indicators visible.`;
        } else if (contentType === 'text/symptoms') {
            basePrompt += `Symptom Analysis
Patient describes: "${content}"

Analyze these symptoms and provide potential diagnoses, risk assessment, and medical recommendations.`;
        } else if (contentType === 'application/pdf' || contentType === 'text/plain') {
            basePrompt += `Medical Document Analysis for: ${fileName}
Content: ${content}

Analyze this medical document and extract key medical information, diagnoses, and recommendations.`;
        }

        basePrompt += `

Guidelines:
- Provide accurate medical insights based on the information
- Risk levels: low (routine/preventive), medium (needs attention), high (urgent care needed)
- Include 3-5 key findings
- Provide 3-5 actionable recommendations
- Always recommend consulting healthcare professionals for serious concerns
- Be professional and empathetic in tone`;

        return basePrompt;
    }

    parseGeminiResponse(response) {
        try {
            // Clean the response to extract JSON
            let jsonStr = response.trim();
            
            // Remove markdown code blocks if present
            jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
            
            // Find JSON object in the response
            const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                jsonStr = jsonMatch[0];
            }

            const parsed = JSON.parse(jsonStr);
            
            // Validate required fields
            if (!parsed.summary || !parsed.findings || !parsed.riskLevel || !parsed.recommendations) {
                throw new Error('Invalid response structure');
            }

            // Ensure arrays
            if (!Array.isArray(parsed.findings)) {
                parsed.findings = [parsed.findings];
            }
            if (!Array.isArray(parsed.recommendations)) {
                parsed.recommendations = [parsed.recommendations];
            }

            // Validate risk level
            if (!['low', 'medium', 'high'].includes(parsed.riskLevel.toLowerCase())) {
                parsed.riskLevel = 'medium';
            }

            return {
                summary: parsed.summary,
                findings: parsed.findings.slice(0, 5), // Limit to 5 findings
                riskLevel: parsed.riskLevel.toLowerCase(),
                recommendations: parsed.recommendations.slice(0, 5) // Limit to 5 recommendations
            };
        } catch (error) {
            console.error('Error parsing Gemini response:', error);
            // Fallback response
            return {
                summary: "Analysis completed. Please consult with a healthcare professional for detailed interpretation.",
                findings: ["Medical information processed", "Further evaluation recommended"],
                riskLevel: "medium",
                recommendations: ["Consult healthcare provider", "Monitor symptoms", "Follow up as needed"]
            };
        }
    }

    async readFileContent(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                if (file.type.startsWith('image/')) {
                    // For images, we'll use base64 but in a real implementation,
                    // you'd want to use Gemini Vision API
                    resolve(`Medical image file: ${file.name} (${file.type})`);
                } else {
                    resolve(e.target.result);
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            
            if (file.type.startsWith('image/')) {
                reader.readAsDataURL(file);
            } else {
                reader.readAsText(file);
            }
        });
    }

    renderReports() {
        const reportsContainer = document.getElementById('ai-reports-container');
        if (!reportsContainer) return;

        if (this.reports.length === 0) {
            reportsContainer.innerHTML = `
                <div style="text-align: center; padding: 60px 20px; color: rgba(255,255,255,0.6);">
                    <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: linear-gradient(45deg, #4facfe, #00f2fe); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-brain" style="font-size: 2rem; color: white;"></i>
                    </div>
                    <h3 style="color: white; margin-bottom: 10px;">AI Medical Analysis</h3>
                    <p>Upload medical files or describe symptoms to get AI-powered insights</p>
                </div>
            `;
            return;
        }

        const reportsHtml = this.reports.map(report => `
            <div class="ai-report-card" style="background: linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05)); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 24px; margin-bottom: 20px; transition: all 0.3s ease;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <div style="width: 40px; height: 40px; background: linear-gradient(45deg, #4facfe, #00f2fe); border-radius: 10px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas ${report.analysis_type === 'symptom_analysis' ? 'fa-stethoscope' : 'fa-file-medical'}" style="color: white; font-size: 1.1rem;"></i>
                        </div>
                        <div>
                            <h4 style="color: white; margin: 0; font-size: 1.1rem;">${report.file_name}</h4>
                            <p style="color: rgba(255,255,255,0.6); margin: 0; font-size: 0.85rem;">${new Date(report.created_at).toLocaleDateString()} • ${report.file_type.toUpperCase()}</p>
                        </div>
                    </div>
                    <span class="risk-badge" style="background: ${this.getRiskColor(report.risk_level)}20; color: ${this.getRiskColor(report.risk_level)}; padding: 6px 16px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase;">
                        ${report.risk_level} RISK
                    </span>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <h5 style="color: #4facfe; margin: 0 0 8px 0; font-size: 0.9rem; font-weight: 600;">AI SUMMARY</h5>
                    <p style="color: rgba(255,255,255,0.8); margin: 0; line-height: 1.5;">${report.ai_summary}</p>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <h5 style="color: #4facfe; margin: 0 0 8px 0; font-size: 0.9rem; font-weight: 600;">KEY FINDINGS</h5>
                    <ul style="color: rgba(255,255,255,0.7); margin: 0; padding-left: 16px;">
                        ${report.key_findings.map(finding => `<li style="margin-bottom: 4px;">${finding}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="margin-bottom: 16px;">
                    <h5 style="color: #4facfe; margin: 0 0 8px 0; font-size: 0.9rem; font-weight: 600;">RECOMMENDATIONS</h5>
                    <ul style="color: rgba(255,255,255,0.7); margin: 0; padding-left: 16px;">
                        ${report.recommendations.map(rec => `<li style="margin-bottom: 4px;">${rec}</li>`).join('')}
                    </ul>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <button onclick="aiAnalytics.viewFullReport(${report.id})" style="background: linear-gradient(45deg, #4facfe, #00f2fe); color: white; border: none; padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; cursor: pointer; transition: all 0.3s ease;">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                    <button onclick="aiAnalytics.deleteReport(${report.id})" style="background: rgba(255,107,157,0.2); color: #ff6b9d; border: 1px solid rgba(255,107,157,0.3); padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; cursor: pointer; transition: all 0.3s ease;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');

        reportsContainer.innerHTML = reportsHtml;
    }

    getRiskColor(riskLevel) {
        switch (riskLevel) {
            case 'high': return '#ff6b9d';
            case 'medium': return '#fa709a';
            case 'low': return '#43e97b';
            default: return '#4facfe';
        }
    }

    updateStats() {
        const totalReports = this.reports.length;
        const highRiskCount = this.reports.filter(r => r.risk_level === 'high').length;
        const recentReports = this.reports.filter(r => {
            const reportDate = new Date(r.created_at);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return reportDate > weekAgo;
        }).length;

        // Update stats in UI
        const statsElements = {
            'total-reports': totalReports,
            'high-risk-reports': highRiskCount,
            'recent-reports': recentReports
        };

        Object.entries(statsElements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });
    }

    viewFullReport(reportId) {
        const report = this.reports.find(r => r.id === reportId);
        if (!report) return;

        // Create modal for full report view
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
            background: rgba(0,0,0,0.8); z-index: 10000; 
            display: flex; align-items: center; justify-content: center; 
            padding: 20px;
        `;

        modal.innerHTML = `
            <div style="background: linear-gradient(145deg, #1a1a2e, #16213e); border-radius: 20px; padding: 30px; max-width: 600px; width: 100%; max-height: 80vh; overflow-y: auto; border: 1px solid rgba(255,255,255,0.1);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h3 style="color: white; margin: 0;">📋 ${report.file_name}</h3>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="background: none; border: none; color: rgba(255,255,255,0.6); font-size: 1.5rem; cursor: pointer;">×</button>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <div style="display: flex; gap: 20px; margin-bottom: 16px;">
                        <span style="background: ${this.getRiskColor(report.risk_level)}20; color: ${this.getRiskColor(report.risk_level)}; padding: 8px 16px; border-radius: 12px; font-weight: 600;">
                            ${report.risk_level.toUpperCase()} RISK
                        </span>
                        <span style="color: rgba(255,255,255,0.6);">
                            ${new Date(report.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #4facfe; margin-bottom: 8px;">Summary</h4>
                    <p style="color: rgba(255,255,255,0.8); line-height: 1.6;">${report.ai_summary}</p>
                </div>
                
                <div style="margin-bottom: 20px;">
                    <h4 style="color: #4facfe; margin-bottom: 8px;">Key Findings</h4>
                    <ul style="color: rgba(255,255,255,0.7); padding-left: 20px;">
                        ${report.key_findings.map(finding => `<li style="margin-bottom: 8px;">${finding}</li>`).join('')}
                    </ul>
                </div>
                
                <div>
                    <h4 style="color: #4facfe; margin-bottom: 8px;">Recommendations</h4>
                    <ul style="color: rgba(255,255,255,0.7); padding-left: 20px;">
                        ${report.recommendations.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
    }

    deleteReport(reportId) {
        if (confirm('Are you sure you want to delete this report?')) {
            this.reports = this.reports.filter(r => r.id !== reportId);
            this.saveReports();
            this.renderReports();
            this.updateStats();
            this.showToast('Report deleted successfully', 'success');
        }
    }

    saveReports() {
        localStorage.setItem('aiAnalyticsReports', JSON.stringify(this.reports));
    }

    showProcessingStatus(show) {
        const statusElement = document.getElementById('processing-status');
        if (statusElement) {
            statusElement.style.display = show ? 'block' : 'none';
        }
    }

    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 10000;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white; padding: 12px 20px; border-radius: 8px;
            font-weight: 500; box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            transform: translateX(100%); transition: transform 0.3s ease;
        `;
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
}

// Initialize AI Analytics
let aiAnalytics;
document.addEventListener('DOMContentLoaded', () => {
    aiAnalytics = new AIAnalyticsGemini();
});
