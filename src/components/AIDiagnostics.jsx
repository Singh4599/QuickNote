import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Brain, AlertCircle, CheckCircle, Clock } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabaseClient } from '../config/supabase'
import GlassCard from './ui/GlassCard'
import Button from './ui/Button'

const AIDiagnostics = ({ onReportsUpdate }) => {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [analysisResult, setAnalysisResult] = useState(null)
  const { user } = useAuth()

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0])
    }
  }, [])

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleFileUpload = async (file) => {
    if (!user) return
    
    setUploading(true)
    setAnalysisResult(null)

    try {
      // Create initial report entry
      const { data: report, error: reportError } = await supabaseClient
        .from('diagnostic_reports')
        .insert({
          owner_id: user.id,
          title: file.name,
          file_type: file.type,
          processing_status: 'pending'
        })
        .select()
        .single()

      if (reportError) throw reportError

      // Simulate file upload to storage (you can implement actual storage later)
      const fileUrl = `uploads/${report.id}/${file.name}`

      // Simulate AI analysis
      const analysisResult = await simulateAIAnalysis(file)

      // Update report with analysis results
      const { error: updateError } = await supabaseClient
        .from('diagnostic_reports')
        .update({
          file_url: fileUrl,
          summary: analysisResult.summary,
          key_findings: analysisResult.key_findings,
          followups: analysisResult.followups,
          patient_friendly_explainer: analysisResult.patient_friendly_explainer,
          risk_level: analysisResult.risk_level,
          processing_status: 'completed'
        })
        .eq('id', report.id)

      if (updateError) throw updateError

      setAnalysisResult(analysisResult)
      if (onReportsUpdate) onReportsUpdate()

    } catch (error) {
      console.error('Upload failed:', error)
      // You could show a toast notification here
    } finally {
      setUploading(false)
    }
  }

  const simulateAIAnalysis = async (file) => {
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    const analysisTypes = {
      'image/jpeg': 'Medical Image Analysis',
      'image/png': 'Medical Image Analysis', 
      'application/pdf': 'Medical Report Analysis',
      'text/plain': 'Symptom Analysis'
    }

    const riskLevels = ['low', 'medium', 'high']
    const randomRisk = riskLevels[Math.floor(Math.random() * riskLevels.length)]

    const findings = {
      low: [
        'Normal cardiac silhouette with clear lung fields',
        'No acute abnormalities detected',
        'Bone structures appear intact',
        'Soft tissues within normal parameters'
      ],
      medium: [
        'Minor degenerative changes consistent with age',
        'Borderline measurements requiring follow-up',
        'Mild inflammatory markers present',
        'Early signs of wear noted'
      ],
      high: [
        'Abnormal patterns requiring urgent evaluation',
        'Concerning structural changes identified',
        'Elevated risk markers present',
        'Immediate specialist consultation recommended'
      ]
    }

    const recommendations = {
      low: [
        'Continue routine preventive care',
        'Maintain healthy lifestyle',
        'Schedule next routine examination in 12 months'
      ],
      medium: [
        'Follow up with primary care physician in 3-6 months',
        'Monitor for any changes in symptoms',
        'Consider lifestyle modifications'
      ],
      high: [
        'Immediate follow-up with healthcare provider required',
        'Urgent specialist consultation recommended',
        'Additional diagnostic workup needed'
      ]
    }

    const explanations = {
      low: 'Your test results show normal findings, which is excellent news. Continue with your regular healthcare routine.',
      medium: 'Your results show some findings that require attention but are not immediately alarming. Follow-up care is recommended.',
      high: 'Your test results require prompt medical attention. Please follow up with your healthcare provider as soon as possible.'
    }

    return {
      summary: `${analysisTypes[file.type] || 'Medical Analysis'}: ${findings[randomRisk][0]}`,
      key_findings: findings[randomRisk].slice(0, 2 + Math.floor(Math.random() * 2)).join('; '),
      followups: recommendations[randomRisk].slice(0, 2 + Math.floor(Math.random() * 2)).join('; '),
      patient_friendly_explainer: explanations[randomRisk],
      risk_level: randomRisk
    }
  }

  const getRiskColor = (risk) => {
    switch (risk) {
      case 'high': return 'text-red-400 bg-red-500/20'
      case 'medium': return 'text-yellow-400 bg-yellow-500/20'
      default: return 'text-green-400 bg-green-500/20'
    }
  }

  const getRiskIcon = (risk) => {
    switch (risk) {
      case 'high': return AlertCircle
      case 'medium': return Clock
      default: return CheckCircle
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">AI Diagnostics</h1>
        <p className="text-white/70">Upload medical images, reports, or describe symptoms for AI-powered analysis</p>
      </div>

      {/* Upload Area */}
      <GlassCard className="p-8" neonGlow glowColor="cyan">
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive 
              ? 'border-blue-400 bg-blue-500/10' 
              : 'border-white/30 hover:border-white/50'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleFileSelect}
            accept=".jpg,.jpeg,.png,.pdf,.txt"
            disabled={uploading}
          />
          
          <motion.div
            animate={uploading ? { scale: [1, 1.1, 1] } : {}}
            transition={{ duration: 1, repeat: uploading ? Infinity : 0 }}
          >
            {uploading ? (
              <Brain size={64} className="mx-auto mb-4 text-blue-400" />
            ) : (
              <Upload size={64} className="mx-auto mb-4 text-white/60" />
            )}
          </motion.div>
          
          <h3 className="text-xl font-semibold text-white mb-2">
            {uploading ? 'Analyzing with AI...' : 'Drop files here or click to upload'}
          </h3>
          
          <p className="text-white/60 mb-4">
            Supported formats: X-rays, MRIs, CT scans, lab reports (JPG, PNG, PDF)
          </p>
          
          {uploading && (
            <div className="flex items-center justify-center gap-2 text-blue-400">
              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin"></div>
              <span>Processing your medical data...</span>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Analysis Results */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <GlassCard className="p-6" neonGlow glowColor="green">
            <div className="flex items-center gap-3 mb-4">
              <Brain size={24} className="text-green-400" />
              <h2 className="text-xl font-semibold text-white">AI Analysis Complete</h2>
            </div>

            {/* Risk Level */}
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-2">
                {React.createElement(getRiskIcon(analysisResult.risk_level), {
                  size: 20,
                  className: getRiskColor(analysisResult.risk_level).split(' ')[0]
                })}
                <span className="text-white font-medium">Risk Level:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(analysisResult.risk_level)}`}>
                  {analysisResult.risk_level.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Summary</h3>
              <div className="p-4 rounded-xl glass-dark border border-white/10">
                <p className="text-white/90">{analysisResult.summary}</p>
              </div>
            </div>

            {/* Key Findings */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Key Findings</h3>
              <div className="p-4 rounded-xl glass-dark border border-white/10">
                <p className="text-white/90">{analysisResult.key_findings}</p>
              </div>
            </div>

            {/* Recommendations */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Recommendations</h3>
              <div className="p-4 rounded-xl glass-dark border border-white/10">
                <p className="text-white/90">{analysisResult.followups}</p>
              </div>
            </div>

            {/* Patient-Friendly Explanation */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">What This Means for You</h3>
              <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <p className="text-blue-100">{analysisResult.patient_friendly_explainer}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button rocket>
                <FileText size={20} className="mr-2" />
                Download Report
              </Button>
              <Button variant="outline">
                Share with Doctor
              </Button>
            </div>
          </GlassCard>
        </motion.div>
      )}
    </div>
  )
}

export default AIDiagnostics
