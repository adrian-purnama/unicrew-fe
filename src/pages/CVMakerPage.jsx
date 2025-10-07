import React, { useState, useContext, useEffect, useCallback } from 'react';
import { FileText, Wand2, Plus, Trash2, Save, X, Edit3, Briefcase, GraduationCap, Wrench, Award, Languages, Calendar, Zap, BarChart3, Target, PenTool, Bot, Trophy, BookOpen, Star, TrendingUp, Globe, Scroll, CheckCircle, Building, XCircle, Hash, Monitor, Link, Clock, ExternalLink, Download, RefreshCw, Eye } from 'lucide-react';
import { UserContext } from '../../utils/UserContext';
import BaseModal from '../component/BaseModal';
import Select from 'react-select';
import axiosInstance from '../../utils/ApiHelper';

export default function CVMakerPage() {
  const { isLoggedIn, username } = useContext(UserContext);
  const [cvData, setCvData] = useState({
    personalInfo: {
      fullName: username || '',
      dateOfBirth: '',
      emails: [{ value: '', id: Date.now() }],
      phones: [{ value: '', id: Date.now() }],
      address: '',
      socialMedia: []
    },
    summary: '',
    experience: [],
    education: [],
    softSkills: [],
    hardSkills: [],
    certifications: [],
    languages: []
  });

  const [showCustomSocialModal, setShowCustomSocialModal] = useState(false);
  const [customSocialType, setCustomSocialType] = useState('');
  const [showTipModal, setShowTipModal] = useState(false);
  const [currentTipType, setCurrentTipType] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState(0);
  const [cvResult, setCvResult] = useState(null);
  const [showDownload, setShowDownload] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [completionMessage, setCompletionMessage] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [pollingStatus, setPollingStatus] = useState(null);
  
  // CV Management states
  const [userCVs, setUserCVs] = useState([]);
  const [loadingCVs, setLoadingCVs] = useState(false);
  const [selectedCV, setSelectedCV] = useState(null);
  const [showCVDetails, setShowCVDetails] = useState(false);

  // CV API Functions
  const submitCV = async (cvData) => {
    try {
      console.log('Submitting CV data:', cvData);
      
      const response = await axiosInstance.post('/cv/submit', {
        cvData: cvData
      });
      
      console.log('CV submission response:', response.data);
      
      if (response.data.success) {
        return {
          success: true,
          cvResultId: response.data.cvResultId,
          downloadUrl: response.data.downloadUrl,
          expiresAt: response.data.expiresAt,
          minutesRemaining: response.data.minutesRemaining,
          message: response.data.message
        };
      } else {
        throw new Error(response.data.message || 'CV submission failed');
      }
    } catch (error) {
      console.error('CV submission error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to submit CV. Please try again.');
      }
    }
  };

  const checkCVStatus = async (cvResultId) => {
    try {
      console.log('Checking CV status for ID:', cvResultId);
      
      const response = await axiosInstance.get(`/cv/status/${cvResultId}`);
      
      console.log('CV status response:', response.data);
      
      if (response.data.success) {
        return {
          success: true,
          cvResultId: response.data.cvResultId,
          status: response.data.status,
          expiresAt: response.data.expiresAt,
          minutesRemaining: response.data.minutesRemaining,
          isExpired: response.data.isExpired,
          downloadCount: response.data.downloadCount,
          lastDownloadedAt: response.data.lastDownloadedAt,
          errorMessage: response.data.errorMessage,
          createdAt: response.data.createdAt,
          updatedAt: response.data.updatedAt
        };
      } else {
        throw new Error(response.data.message || 'Failed to check CV status');
      }
    } catch (error) {
      console.error('CV status check error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('CV not found or expired');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to check CV status');
      }
    }
  };

  const downloadCV = async (cvResultId, filename = 'CV.pdf') => {
    try {
      console.log('Downloading CV with ID:', cvResultId);
      
      // First check the CV status to ensure it's ready for download
      const statusResponse = await checkCVStatus(cvResultId);
      if (statusResponse.status !== 'completed') {
        throw new Error(`CV is still ${statusResponse.status}. Please wait and try again.`);
      }
      
      // Check if CV has expired
      if (statusResponse.isExpired || statusResponse.minutesRemaining <= 0) {
        throw new Error('CV has expired and is no longer available for download');
      }
      
      const response = await axiosInstance.get(`/cv/download/${cvResultId}`, {
        responseType: 'blob'
      });
      
      console.log('CV download response:', response);
      console.log('Response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data size:', response.data?.size);
      console.log('Response headers:', response.headers);
      
      // Validate that we received actual PDF data
      if (!response.data || response.data.size === 0) {
        console.error('Invalid response data:', {
          hasData: !!response.data,
          dataType: typeof response.data,
          dataSize: response.data?.size,
          dataConstructor: response.data?.constructor?.name
        });
        throw new Error('Received empty or invalid PDF data');
      }
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return {
        success: true,
        message: 'CV downloaded successfully'
      };
    } catch (error) {
      console.error('CV download error:', error);
      
      if (error.response?.status === 404) {
        throw new Error('CV not found or has expired');
      } else if (error.response?.status === 400) {
        throw new Error('CV is still being generated. Please wait and try again.');
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error('Failed to download CV');
      }
    }
  };

  const listUserCVs = async (page = 1, limit = 10) => {
    try {
      console.log('Listing user CVs, page:', page, 'limit:', limit);
      
      const response = await axiosInstance.get('/cv/list', {
        params: {
          page: page,
          limit: limit
        }
      });
      
      console.log('CV list response:', response.data);
      
      if (response.data.success) {
        return {
          success: true,
          cvs: response.data.cvs,
          pagination: response.data.pagination
        };
      } else {
        throw new Error(response.data.message || 'Failed to list CVs');
      }
    } catch (error) {
      console.error('CV list error:', error);
      
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error('Failed to list CVs');
      }
    }
  };

  const pollCVStatus = async (cvResultId, onStatusUpdate = null, maxAttempts = 30) => {
    let attempts = 0;
    
    const poll = async () => {
      try {
        attempts++;
        const status = await checkCVStatus(cvResultId);
        
        if (onStatusUpdate) {
          onStatusUpdate(status);
        }
        
        // Check if generation is complete or failed
        if (status.status === 'completed' || status.status === 'failed' || status.isExpired) {
          return status;
        }
        
        // If max attempts reached, return current status
        if (attempts >= maxAttempts) {
          console.warn('Max polling attempts reached');
          return status;
        }
        
        // Wait 2 seconds before next poll
        await new Promise(resolve => setTimeout(resolve, 2000));
        return poll();
        
      } catch (error) {
        console.error('Polling error:', error);
        throw error;
      }
    };
    
    return poll();
  };

  // Utility functions
  const formatTimeRemaining = (minutesRemaining) => {
    if (minutesRemaining <= 0) {
      return 'Expired';
    } else if (minutesRemaining < 60) {
      return `${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} remaining`;
    } else {
      const hours = Math.floor(minutesRemaining / 60);
      const minutes = minutesRemaining % 60;
      return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
    }
  };

  const canDownloadCV = (status, isExpired) => {
    return status === 'completed' && !isExpired;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'generating':
        return 'text-yellow-600 bg-yellow-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'generating':
        return '⏳';
      case 'completed':
        return '✅';
      case 'failed':
        return '❌';
      case 'expired':
        return '⏰';
      default:
        return '❓';
    }
  };

  // Load user CVs
  const loadUserCVs = useCallback(async () => {
    try {
      setLoadingCVs(true);
      const response = await listUserCVs(1, 20);
      if (response.success) {
        setUserCVs(response.cvs);
      }
    } catch (error) {
      console.error('Failed to load CVs:', error);
    } finally {
      setLoadingCVs(false);
    }
  }, []);

  // Load CVs on component mount
  useEffect(() => {
    if (isLoggedIn) {
      loadUserCVs();
    }
  }, [isLoggedIn, loadUserCVs]);

  // Auto-refresh CV list every 30 seconds to update expiration status
  useEffect(() => {
    if (!isLoggedIn) return;

    const interval = setInterval(() => {
      loadUserCVs();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isLoggedIn, loadUserCVs]);

  // Redirect if not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-color-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-color mb-4">Please log in to access CV Maker</h1>
          <p className="text-gray">You need to be logged in to create your CV.</p>
        </div>
      </div>
    );
  }

  const handleInputChange = (section, field, value, index = null) => {
    setCvData(prev => {
      const newData = { ...prev };
      
      if (index !== null) {
        // Editing array item
        newData[section] = [...newData[section]];
        newData[section][index] = { ...newData[section][index], [field]: value };
      } else if (section === 'personalInfo') {
        // Editing personal info
        newData.personalInfo = { ...newData.personalInfo, [field]: value };
      } else {
        // Editing simple field
        newData[field] = value;
      }
      
      return newData;
    });
  };

  // Helper functions for dynamic fields
  const addDynamicField = (fieldType) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [fieldType]: [...prev.personalInfo[fieldType], { value: '', id: Date.now() }]
      }
    }));
  };

  const updateDynamicField = (fieldType, index, value) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [fieldType]: prev.personalInfo[fieldType].map((item, i) => 
          i === index ? { ...item, value } : item
        )
      }
    }));
  };

  const removeDynamicField = (fieldType, index) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [fieldType]: prev.personalInfo[fieldType].filter((_, i) => i !== index)
      }
    }));
  };

  // Social media functions
  const addSocialMedia = (type, customType = '') => {
    const newSocial = {
      id: Date.now(),
      type: type === 'custom' ? customType : type,
      url: '',
      isCustom: type === 'custom'
    };
    
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        socialMedia: [...prev.personalInfo.socialMedia, newSocial]
      }
    }));
  };

  const handleCustomSocialSubmit = () => {
    if (customSocialType.trim()) {
      addSocialMedia('custom', customSocialType.trim());
      setCustomSocialType('');
      setShowCustomSocialModal(false);
    }
  };

  // Tip content for different sections
  const tipContent = {
    experience: {
      title: "Work Experience Tips",
      icon: Briefcase,
      content: [
        { icon: Calendar, text: "Start with your most recent job and work backwards" },
        { icon: Zap, text: "Use action verbs (managed, developed, created, led)" },
        { icon: BarChart3, text: "Include specific achievements with numbers when possible" },
        { icon: Target, text: "Describe your responsibilities and accomplishments" },
        { icon: PenTool, text: "Keep descriptions concise but impactful" },
        { icon: Bot, text: "AI will help enhance your descriptions with key points" }
      ]
    },
    education: {
      title: "Education Tips",
      icon: GraduationCap,
      content: [
        { icon: Trophy, text: "List your highest degree first (Bachelor's, Master's, PhD)" },
        { icon: BookOpen, text: "Include relevant coursework if applicable" },
        { icon: Star, text: "Add academic achievements, honors, or awards" },
        { icon: TrendingUp, text: "Mention GPA if it's strong (3.5+ for undergrad, 3.7+ for grad)" },
        { icon: Globe, text: "Include study abroad or exchange programs" },
        { icon: Scroll, text: "Add relevant certifications or training" },
        { icon: Building, text: "For higher education: Include university name, degree type, and field of study" },
        { icon: Calendar, text: "For basic education: Include school name, years attended, and any achievements" }
      ]
    },
    softSkills: {
      title: "Soft Skills Tips",
      icon: Wrench,
      content: [
        { icon: Wrench, text: "Include leadership, communication, and interpersonal skills" },
        { icon: BarChart3, text: "Be honest about your proficiency level" },
        { icon: Target, text: "Focus on skills relevant to your target role" },
        { icon: Monitor, text: "Include problem-solving and critical thinking abilities" },
        { icon: CheckCircle, text: "Don't overstate your abilities" },
        { icon: Link, text: "Examples: Leadership, Communication, Teamwork, Problem Solving" }
      ]
    },
    hardSkills: {
      title: "Hard Skills Tips",
      icon: Wrench,
      content: [
        { icon: Wrench, text: "Include technical skills, programming languages, and tools" },
        { icon: BarChart3, text: "Be specific about your proficiency level" },
        { icon: Target, text: "Match technical skills to the job requirements" },
        { icon: Monitor, text: "Include industry-specific tools and software" },
        { icon: CheckCircle, text: "Don't overstate your abilities" },
        { icon: Link, text: "Examples: JavaScript, Python, React, AWS, Docker" }
      ]
    },
    certifications: {
      title: "Certifications Tips",
      icon: Award,
      content: [
        { icon: CheckCircle, text: "Include only relevant and current certifications" },
        { icon: Building, text: "List the issuing organization" },
        { icon: Calendar, text: "Include expiration dates if applicable" },
        { icon: Star, text: "Prioritize industry-recognized certifications" },
        { icon: XCircle, text: "Don't include expired certifications" },
        { icon: Scroll, text: "Add any professional licenses you hold" }
      ]
    },
    languages: {
      title: "Languages Tips",
      icon: Languages,
      content: [
        { icon: Hash, text: "Be honest about your proficiency level" },
        { icon: BarChart3, text: "Use standard proficiency levels (Native, Fluent, Conversational, Basic)" },
        { icon: Scroll, text: "Include any language certifications" },
        { icon: Briefcase, text: "Mention if you've used the language professionally" },
        { icon: CheckCircle, text: "Don't overstate your abilities" },
        { icon: Globe, text: "Include dialects or regional variations if relevant" }
      ]
    }
  };

  // Check if tip should be shown (when section is empty)
  const shouldShowTip = (tipType) => {
    return cvData[tipType].length === 0; // Show tip only when section is empty
  };

  // Show tip modal (when section is empty)
  const showTip = (tipType) => {
    if (shouldShowTip(tipType)) {
      setCurrentTipType(tipType);
      setShowTipModal(true);
    }
  };

  // Handle tip modal close
  const handleTipClose = () => {
    setShowTipModal(false);
  };

  const updateSocialMedia = (index, field, value) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        socialMedia: prev.personalInfo.socialMedia.map((item, i) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const removeSocialMedia = (index) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        socialMedia: prev.personalInfo.socialMedia.filter((_, i) => i !== index)
      }
    }));
  };

  const addArrayItem = (section, template) => {
    // Show tip if section is empty (first time adding to this section)
    if (cvData[section].length === 0) {
      showTip(section);
    }
    
    setCvData(prev => ({
      ...prev,
      [section]: [...prev[section], { ...template }]
    }));
  };

  const removeArrayItem = (section, index) => {
    setCvData(prev => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index)
    }));
  };



  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitProgress(0);
      setShowDownload(false);
      setCvResult(null);
      setPollingStatus(null);
      
      console.log('Submitting CV data:', cvData);
      
      // Start progress simulation
      const progressInterval = setInterval(() => {
        setSubmitProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      // Submit CV data
      const result = await submitCV(cvData);
      
      clearInterval(progressInterval);
      setSubmitProgress(100);
      
      console.log('CV submission result:', result);
      
      if (result.success) {
        setCvResult(result);
        
        // Start polling for status updates
        setPollingStatus('generating');
        
        try {
          const finalStatus = await pollCVStatus(result.cvResultId, (status) => {
            setPollingStatus(status.status);
            setSubmitProgress(prev => Math.min(prev + 5, 95));
          });
          
          setCvResult(finalStatus);
          
          if (finalStatus.status === 'completed') {
        setShowDownload(true);
        setCompletionMessage('CV generated successfully! You can now download your PDF.');
        setShowCompletionModal(true);
            // Refresh CV list
            loadUserCVs();
          } else if (finalStatus.status === 'failed') {
            setCompletionMessage(`CV generation failed: ${finalStatus.errorMessage || 'Unknown error'}`);
            setShowCompletionModal(true);
          }
          
        } catch (pollError) {
          console.error('Polling error:', pollError);
          setCompletionMessage('CV submitted but status check failed. Please check your CVs below.');
          setShowCompletionModal(true);
        }
      } else {
        setCompletionMessage(result.message || 'CV submission failed.');
        setShowCompletionModal(true);
      }
      
    } catch (error) {
      console.error('Failed to submit CV:', error);
      setCompletionMessage(error.message || 'Failed to submit CV. Please try again.');
      setShowCompletionModal(true);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        setSubmitProgress(0);
        setPollingStatus(null);
      }, 2000);
    }
  };

  const handleDownload = async () => {
    if (!cvResult?.cvResultId) return;
    
    try {
      setIsDownloading(true);
      await downloadCV(cvResult.cvResultId, cvResult.filename || 'CV.pdf');
      // Refresh CV list to update download count
      loadUserCVs();
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadCV = async (cv) => {
    try {
      await downloadCV(cv.cvResultId, cv.filename);
      // Refresh CV list to update download count
      loadUserCVs();
    } catch (error) {
      console.error('Download failed:', error);
      alert(`Download failed: ${error.message}`);
    }
  };

  const showCVDetailsModal = (cv) => {
    setSelectedCV(cv);
    setShowCVDetails(true);
  };


  const renderPersonalInfo = () => (
    <div className="bg-color-2 rounded-lg p-6 mb-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-color">Personal Information</h2>
      </div>
      
      {/* Full Name Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-color mb-2">Full Name</label>
        <input
          type="text"
          value={cvData.personalInfo.fullName}
          onChange={(e) => handleInputChange('personalInfo', 'fullName', e.target.value)}
          className="w-full px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
          placeholder="Enter your full name"
        />
      </div>

      {/* Date of Birth Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-color mb-2">Date of Birth</label>
        <input
          type="date"
          value={cvData.personalInfo.dateOfBirth}
          onChange={(e) => handleInputChange('personalInfo', 'dateOfBirth', e.target.value)}
          className="w-full px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
        />
        <p className="text-xs text-gray mt-1">
          Optional: Some employers prefer to see age/date of birth for certain positions
        </p>
      </div>

      {/* Emails Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-color">Email Addresses</label>
          <button
            onClick={() => addDynamicField('emails')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
          >
            <Plus className="w-3 h-3" />
            Add Email
          </button>
        </div>
        <div className="space-y-3">
          {cvData.personalInfo.emails.map((email, index) => (
            <div key={email.id} className="flex items-center gap-2">
              <input
                type="email"
                value={email.value}
                onChange={(e) => updateDynamicField('emails', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
                placeholder="Enter your email address"
              />
              {cvData.personalInfo.emails.length > 1 && (
                <button
                  onClick={() => removeDynamicField('emails', index)}
                  className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Phone Numbers Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-color">Phone Numbers</label>
          <button
            onClick={() => addDynamicField('phones')}
            className="flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800"
          >
            <Plus className="w-3 h-3" />
            Add Phone
          </button>
        </div>
        <div className="space-y-3">
          {cvData.personalInfo.phones.map((phone, index) => (
            <div key={phone.id} className="flex items-center gap-2">
              <input
                type="tel"
                value={phone.value}
                onChange={(e) => updateDynamicField('phones', index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
                placeholder="Enter your phone number"
              />
              {cvData.personalInfo.phones.length > 1 && (
                <button
                  onClick={() => removeDynamicField('phones', index)}
                  className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Address Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-color mb-2">Address</label>
        <input
          type="text"
          value={cvData.personalInfo.address}
          onChange={(e) => handleInputChange('personalInfo', 'address', e.target.value)}
          className="w-full px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
          placeholder="Enter your address"
        />
      </div>

      {/* Social Media Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-color">Social Media & Links</label>
          <div className="w-48">
            <Select
              options={[
                { value: 'website', label: 'Website' },
                { value: 'linkedin', label: 'LinkedIn' },
                { value: 'instagram', label: 'Instagram' },
                { value: 'custom', label: 'Custom' }
              ]}
              onChange={(option) => {
                if (option?.value === 'custom') {
                  setShowCustomSocialModal(true);
                } else if (option?.value) {
                  addSocialMedia(option.value);
                }
              }}
              placeholder="Add Social Media"
              className="react-select-container"
              classNamePrefix="react-select"
              isClearable
              isSearchable={false}
            />
          </div>
        </div>
        
        {/* Social Media Tips */}
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start gap-2">
            <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded">
              <Wand2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Professional Social Media Tips</h4>
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Include only professional social media profiles. Avoid personal accounts like private Instagram or Facebook. 
                LinkedIn and professional websites are highly recommended.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {cvData.personalInfo.socialMedia.map((social, index) => (
            <div key={social.id} className="flex items-center gap-2 p-3 border border-gray rounded-lg bg-color-1">
              <div className="flex-shrink-0">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                  {social.type}
                </span>
              </div>
              <input
                type="url"
                value={social.url}
                onChange={(e) => updateSocialMedia(index, 'url', e.target.value)}
                className="flex-1 px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
                placeholder={`Enter your ${social.type} URL`}
              />
              <button
                onClick={() => removeSocialMedia(index)}
                className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900 rounded"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {cvData.personalInfo.socialMedia.length === 0 && (
            <p className="text-gray italic text-sm">No social media links added yet. Click "Add Social Media" to get started.</p>
          )}
        </div>
      </div>
    </div>
  );

  // Custom Date Picker Component
  const DatePicker = ({ value, onChange, placeholder, isEndDate = false }) => {
    const [showPicker, setShowPicker] = useState(false);
    const [year, setYear] = useState('');
    const [month, setMonth] = useState('');
    const [isPresent, setIsPresent] = useState(false);

    // Initialize values from existing value
    useEffect(() => {
      if (value) {
        if (value === 'Present') {
          setIsPresent(true);
        } else {
          const date = new Date(value);
          if (!isNaN(date.getTime())) {
            setYear(date.getFullYear().toString());
            setMonth((date.getMonth() + 1).toString().padStart(2, '0'));
          }
        }
      }
    }, [value]);

    const handleApply = () => {
      if (isPresent) {
        onChange('Present');
      } else if (year && month) {
        // Create date in YYYY-MM format for better display
        onChange(`${year}-${month}`);
      } else {
        onChange('');
      }
      setShowPicker(false);
    };

    const handleClear = () => {
      setYear('');
      setMonth('');
      setIsPresent(false);
      onChange('');
      setShowPicker(false);
    };

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);
    const months = [
      { value: '01', label: 'January' },
      { value: '02', label: 'February' },
      { value: '03', label: 'March' },
      { value: '04', label: 'April' },
      { value: '05', label: 'May' },
      { value: '06', label: 'June' },
      { value: '07', label: 'July' },
      { value: '08', label: 'August' },
      { value: '09', label: 'September' },
      { value: '10', label: 'October' },
      { value: '11', label: 'November' },
      { value: '12', label: 'December' }
    ];

    return (
      <div className="relative">
        <input
          type="text"
          value={value || ''}
          readOnly
          onClick={() => setShowPicker(!showPicker)}
          className="w-full px-3 py-2 border border-gray rounded-md bg-color-1 text-color cursor-pointer"
          placeholder={placeholder}
        />
        
        {showPicker && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-white dark:bg-gray-800 border border-gray rounded-md shadow-lg p-4">
            {isEndDate && (
              <div className="mb-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPresent}
                    onChange={(e) => {
                      setIsPresent(e.target.checked);
                      if (e.target.checked) {
                        setYear('');
                        setMonth('');
                      }
                    }}
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-color">Current Position (Present)</span>
                </label>
              </div>
            )}
            
            {!isPresent && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block text-xs font-medium text-color mb-1">Year</label>
                  <select
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    className="w-full px-2 py-1 border border-gray rounded text-sm bg-color-1 text-color"
                  >
                    <option value="">Select Year</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-color mb-1">Month</label>
                  <select
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    className="w-full px-2 py-1 border border-gray rounded text-sm bg-color-1 text-color"
                  >
                    <option value="">Select Month</option>
                    {months.map(m => (
                      <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="flex-1 px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark"
              >
                Apply
              </button>
              <button
                onClick={handleClear}
                className="flex-1 px-3 py-1 text-sm bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-500"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderArraySection = (title, section, template, fields) => (
    <div className="bg-color-2 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-color">{title}</h2>
        <button
          onClick={() => addArrayItem(section, template)}
          className="flex items-center gap-2 px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary-dark"
        >
          <Plus className="w-4 h-4" />
          Add {title.slice(0, -1)}
        </button>
      </div>
      
      {cvData[section].length === 0 ? (
        <p className="text-gray italic">No {title.toLowerCase()} added yet.</p>
      ) : (
        <div className="space-y-4">
          {cvData[section].map((item, index) => (
            <div key={index} className="border border-gray rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-color">
                  {item.title || item.company || item.school || item.name || `${title.slice(0, -1)} ${index + 1}`}
                </h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => removeArrayItem(section, index)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(field => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-color mb-1">
                      {field.label}
                    </label>
                    {field.type === 'textarea' ? (
                      <textarea
                        value={item[field.name] || ''}
                        onChange={(e) => handleInputChange(section, field.name, e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
                        rows={3}
                        placeholder={field.placeholder}
                      />
                    ) : field.type === 'date' ? (
                      <DatePicker
                        value={item[field.name] || ''}
                        onChange={(value) => handleInputChange(section, field.name, value, index)}
                        placeholder={field.placeholder}
                        isEndDate={field.name === 'endDate'}
                      />
                    ) : (
                      <input
                        type={field.type}
                        value={item[field.name] || ''}
                        onChange={(e) => handleInputChange(section, field.name, e.target.value, index)}
                        className="w-full px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}
              </div>
              
              {section === 'experience' && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-color mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={item.description || ''}
                    onChange={(e) => handleInputChange(section, 'description', e.target.value, index)}
                    className="w-full px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
                    rows={4}
                    placeholder="Write a detailed paragraph about your role, responsibilities, and achievements. Our AI will analyze and enhance your description to make it more professional and impactful."
                  />
                  <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-start gap-2">
                      <div className="p-1 bg-blue-100 dark:bg-blue-800 rounded">
                        <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">AI Enhancement Tip</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Write everything you did in paragraph form - your daily tasks, projects you worked on, 
                          achievements, and impact you made. Our AI will automatically pick the key points, 
                          enhance the language, and structure it professionally for your CV.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-color-1">
      {/* Header */}
      <div className="bg-color-2 border-b border-gray">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-color">CV Maker</h1>
              <p className="text-gray mt-1">Create your professional CV with AI assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderPersonalInfo()}
        
        {/* Professional Summary */}
        <div className="bg-color-2 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-color">Professional Summary</h2>
          </div>
          <textarea
            value={cvData.summary}
            onChange={(e) => handleInputChange('summary', 'summary', e.target.value)}
            className="w-full px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
            rows={4}
            placeholder="Write a brief summary of your professional background and key strengths..."
          />
        </div>

        {/* Experience */}
        {renderArraySection(
          'Work Experience',
          'experience',
          {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
          },
          [
            { name: 'company', label: 'Company', type: 'text', placeholder: 'Company name' },
            { name: 'title', label: 'Position', type: 'text', placeholder: 'Job title' },
            { name: 'startDate', label: 'Start Date', type: 'date', placeholder: 'Start date' },
            { name: 'endDate', label: 'End Date', type: 'date', placeholder: 'End date (leave empty if current)' }
          ]
        )}

        {/* Education */}
        {renderArraySection(
          'Education',
          'education',
          {
            school: '',
            degree: '',
            field: '',
            startDate: '',
            endDate: '',
            gpa: '',
            description: ''
          },
          [
            { name: 'school', label: 'School/University', type: 'text', placeholder: 'e.g., Harvard University, MIT, or Local High School' },
            { name: 'degree', label: 'Degree/Level', type: 'text', placeholder: 'e.g., Bachelor of Science, Master of Arts, High School Diploma' },
            { name: 'field', label: 'Field of Study', type: 'text', placeholder: 'e.g., Computer Science, Business Administration, General Studies' },
            { name: 'startDate', label: 'Start Date', type: 'date', placeholder: 'Start date' },
            { name: 'endDate', label: 'End Date', type: 'date', placeholder: 'End date or Expected graduation' },
            { name: 'gpa', label: 'GPA', type: 'text', placeholder: 'e.g., 3.8/4.0 (only if strong)' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'e.g., Relevant coursework, honors, achievements, or special programs' }
          ]
        )}

        {/* Soft Skills */}
        {renderArraySection(
          'Soft Skills',
          'softSkills',
          { name: '', level: 'Intermediate' },
          [
            { name: 'name', label: 'Soft Skill Name', type: 'text', placeholder: 'e.g., Leadership, Communication, Problem Solving' },
            { name: 'level', label: 'Level', type: 'select', placeholder: 'Skill level' }
          ]
        )}

        {/* Hard Skills */}
        {renderArraySection(
          'Hard Skills',
          'hardSkills',
          { name: '', level: 'Intermediate' },
          [
            { name: 'name', label: 'Hard Skill Name', type: 'text', placeholder: 'e.g., JavaScript, Python, React, AWS' },
            { name: 'level', label: 'Level', type: 'select', placeholder: 'Skill level' }
          ]
        )}

        {/* Certifications */}
        {renderArraySection(
          'Certifications',
          'certifications',
          {
            name: '',
            issuer: '',
            date: '',
            description: ''
          },
          [
            { name: 'name', label: 'Certification Name', type: 'text', placeholder: 'Certification name' },
            { name: 'issuer', label: 'Issuing Organization', type: 'text', placeholder: 'Organization name' },
            { name: 'date', label: 'Date', type: 'date', placeholder: 'Certification date' },
            { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Additional details' }
          ]
        )}

        {/* Languages */}
        {renderArraySection(
          'Languages',
          'languages',
          { name: '', proficiency: 'Intermediate' },
          [
            { name: 'name', label: 'Language', type: 'text', placeholder: 'Language name' },
            { name: 'proficiency', label: 'Proficiency', type: 'text', placeholder: 'Proficiency level' }
          ]
        )}

        {/* Submit Button */}
        <div className="bg-color-2 rounded-lg p-6 mt-8">
          <div className="flex flex-col items-center gap-4">
            {isSubmitting && (
              <div className="w-full max-w-md">
                <div className="flex justify-between text-sm text-gray mb-2">
                  <span>Generating PDF...</span>
                  <span>{submitProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${submitProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
            
            {showDownload && cvResult && (
              <div className="flex flex-col items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">PDF Ready for Download!</span>
                </div>
                <p className="text-sm text-green-700 dark:text-green-300 text-center">
                  Your CV has been generated successfully. Download will be available for {cvResult.minutesRemaining || 30} minutes.
                </p>
                {cvResult.expiresAt && (
                  <div className="flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
                    <Clock className="w-4 h-4" />
                    <span>Expires: {new Date(cvResult.expiresAt).toLocaleString()}</span>
                  </div>
                )}
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Downloading...
                    </>
                  ) : (
                    <>
                  <FileText className="w-5 h-5" />
                  Download PDF
                    </>
                  )}
                </button>
                <button
                  onClick={() => window.scrollTo({ top: document.querySelector('.cv-management-section').offsetTop - 100, behavior: 'smooth' })}
                  className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View All My CVs
                </button>
              </div>
            )}

            {/* Generation Status */}
            {pollingStatus && pollingStatus === 'generating' && (
              <div className="flex flex-col items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800 dark:text-blue-200">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">Generating PDF...</span>
                </div>
                <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                  Your CV is being processed. This usually takes 10-30 seconds.
                </p>
                <div className="w-full max-w-xs">
                  <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mb-1">
                    <span>Processing...</span>
                    <span>{submitProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                      style={{ width: `${submitProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className={`flex items-center gap-2 px-8 py-3 rounded-lg transition-colors font-medium text-lg ${
                isSubmitting 
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed' 
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Submit CV
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* CV Management Section */}
      <div className="bg-color-2 rounded-lg p-6 mt-8 cv-management-section">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-color">My CVs</h2>
            <p className="text-gray mt-1">View and manage all your generated CVs</p>
          </div>
          <button
            onClick={loadUserCVs}
            disabled={loadingCVs}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingCVs ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {loadingCVs ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray">Loading your CVs...</p>
          </div>
        ) : userCVs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-color mb-2">No CVs Found</h3>
            <p className="text-gray mb-6">You haven't created any CVs yet. Create your first professional CV above!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userCVs.map((cv) => (
              <div key={cv.cvResultId} className="bg-color-1 rounded-lg border border-gray p-6 hover:shadow-lg transition-shadow">
                {/* CV Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-color mb-1 truncate">
                      {cv.filename || 'CV Document'}
                    </h3>
                    <p className="text-sm text-gray">
                      {cv.fileSize ? `${Math.round(cv.fileSize / 1024)} KB` : 'Unknown size'}
                    </p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cv.status)}`}>
                    <span>{getStatusIcon(cv.status)}</span>
                    {cv.status.charAt(0).toUpperCase() + cv.status.slice(1)}
                  </span>
                </div>

                {/* CV Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(cv.createdAt).toLocaleDateString()}</span>
                  </div>
                  
                  {cv.expiresAt && (
                    <div className="flex items-center gap-2 text-sm text-gray">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeRemaining(cv.minutesRemaining)}</span>
                    </div>
                  )}
                  
                  {cv.downloadCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray">
                      <Download className="w-4 h-4" />
                      <span>Downloaded {cv.downloadCount} time{cv.downloadCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                </div>

                {/* CV Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => showCVDetailsModal(cv)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                  
                  {canDownloadCV(cv.status, cv.isExpired) ? (
                    <button
                      onClick={() => handleDownloadCV(cv)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-gray-400 text-gray-200 rounded-lg cursor-not-allowed"
                    >
                      {cv.status === 'generating' ? (
                        <>
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : cv.status === 'failed' ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          Failed
                        </>
                      ) : (
                        <>
                          <Clock className="w-4 h-4" />
                          Expired
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tip Modal */}
            <BaseModal 
              isOpen={showTipModal} 
              onClose={handleTipClose} 
              title={tipContent[currentTipType]?.title || "Tips"}
            >
              <div className="max-h-[70vh] overflow-y-auto sleek-scrollbar space-y-4 p-4">
                {/* Tips Header */}
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                      {tipContent[currentTipType]?.icon && (() => {
                        const IconComponent = tipContent[currentTipType].icon;
                        return <IconComponent className="w-6 h-6 text-blue-600 dark:text-blue-400" />;
                      })()}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
                        Professional Tips
                      </h4>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Follow these guidelines to create an impressive CV that stands out to employers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Tips Content */}
                <div className="space-y-3">
                  {tipContent[currentTipType]?.content.map((tip, index) => {
                    const IconComponent = tip.icon;
                    return (
                      <div key={index} className="flex items-start gap-3 p-3 bg-color-2 rounded-lg border border-gray-200 dark:border-gray-700">
                        <IconComponent className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-color leading-relaxed">{tip.text}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Education Examples */}
                {currentTipType === 'education' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4" />
                      Education Examples
                    </h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Higher Education (Bachelor's)</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>School:</strong> Massachusetts Institute of Technology<br/>
                          <strong>Degree:</strong> Bachelor of Science<br/>
                          <strong>Field:</strong> Computer Science<br/>
                          <strong>Period:</strong> 2018-2022<br/>
                          <strong>GPA:</strong> 3.8/4.0<br/>
                          <strong>Description:</strong> Relevant coursework in algorithms, data structures, and software engineering. Dean's List for 3 semesters.
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">High School</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>School:</strong> Lincoln High School<br/>
                          <strong>Degree:</strong> High School Diploma<br/>
                          <strong>Field:</strong> General Studies<br/>
                          <strong>Period:</strong> 2014-2018<br/>
                          <strong>GPA:</strong> 3.9/4.0<br/>
                          <strong>Description:</strong> Graduated with honors. Member of National Honor Society. Captain of debate team.
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Primary School</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>School:</strong> Roosevelt Elementary School<br/>
                          <strong>Degree:</strong> Elementary School Certificate<br/>
                          <strong>Field:</strong> General Studies<br/>
                          <strong>Period:</strong> 2008-2014<br/>
                          <strong>Description:</strong> Completed elementary education with excellent academic performance.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Soft Skills Examples */}
                {currentTipType === 'softSkills' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Soft Skills Examples
                    </h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Leadership & Management</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>Leadership:</strong> Advanced<br/>
                          <strong>Project Management:</strong> Expert<br/>
                          <strong>Team Management:</strong> Advanced<br/>
                          <strong>Strategic Planning:</strong> Intermediate
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Communication & Interpersonal</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>Communication:</strong> Expert<br/>
                          <strong>Public Speaking:</strong> Advanced<br/>
                          <strong>Teamwork:</strong> Expert<br/>
                          <strong>Negotiation:</strong> Intermediate
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Problem Solving & Creativity</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>Problem Solving:</strong> Advanced<br/>
                          <strong>Critical Thinking:</strong> Expert<br/>
                          <strong>Creativity:</strong> Advanced<br/>
                          <strong>Adaptability:</strong> Expert
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hard Skills Examples */}
                {currentTipType === 'hardSkills' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                      <Wrench className="w-4 h-4" />
                      Hard Skills Examples
                    </h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Programming Languages</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>JavaScript:</strong> Advanced<br/>
                          <strong>Python:</strong> Expert<br/>
                          <strong>Java:</strong> Intermediate<br/>
                          <strong>TypeScript:</strong> Advanced
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Frameworks & Libraries</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>React:</strong> Advanced<br/>
                          <strong>Node.js:</strong> Expert<br/>
                          <strong>Express.js:</strong> Advanced<br/>
                          <strong>Django:</strong> Intermediate
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Tools & Technologies</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>AWS:</strong> Advanced<br/>
                          <strong>Docker:</strong> Intermediate<br/>
                          <strong>Git:</strong> Expert<br/>
                          <strong>MongoDB:</strong> Advanced
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Languages Examples */}
                {currentTipType === 'languages' && (
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                    <h5 className="text-sm font-medium text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                      <Languages className="w-4 h-4" />
                      Languages Examples
                    </h5>
                    <div className="space-y-3">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Professional Languages</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>English:</strong> Native<br/>
                          <strong>Spanish:</strong> Fluent<br/>
                          <strong>French:</strong> Conversational<br/>
                          <strong>Mandarin:</strong> Basic
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">With Certifications</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>English:</strong> Native (TOEFL 110/120)<br/>
                          <strong>Spanish:</strong> Fluent (DELE B2)<br/>
                          <strong>Japanese:</strong> Intermediate (JLPT N3)<br/>
                          <strong>German:</strong> Conversational (Goethe B1)
                        </p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-green-200 dark:border-green-700">
                        <h6 className="text-xs font-semibold text-green-700 dark:text-green-300 mb-1">Regional Languages</h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <strong>Indonesian:</strong> Native<br/>
                          <strong>Javanese:</strong> Fluent<br/>
                          <strong>Sundanese:</strong> Conversational<br/>
                          <strong>Balinese:</strong> Basic
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Button */}
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleTipClose}
                    className="px-6 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200 font-medium"
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </BaseModal>

      {/* Custom Social Media Modal */}
      <BaseModal 
        isOpen={showCustomSocialModal} 
        onClose={() => {
          setShowCustomSocialModal(false);
          setCustomSocialType('');
        }} 
        title="Add Custom Social Media"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-color mb-2">
              Social Media Type
            </label>
            <input
              type="text"
              value={customSocialType}
              onChange={(e) => setCustomSocialType(e.target.value)}
              className="w-full px-3 py-2 border border-gray rounded-md bg-color-1 text-color"
              placeholder="e.g., Facebook, Twitter, GitHub"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setShowCustomSocialModal(false);
                setCustomSocialType('');
              }}
              className="px-4 py-2 text-sm border border-gray rounded-md text-color hover:bg-color-1"
            >
              Cancel
            </button>
            <button
              onClick={handleCustomSocialSubmit}
              disabled={!customSocialType.trim()}
              className="px-4 py-2 text-sm bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add
            </button>
          </div>
        </div>
      </BaseModal>

      {/* Completion Modal */}
      <BaseModal 
        isOpen={showCompletionModal} 
        onClose={() => setShowCompletionModal(false)} 
        title=""
      >
        <div className="text-center py-6">
          {/* Success State */}
          {completionMessage.includes('successfully') ? (
            <div className="space-y-6">
              {/* Success Icon with Animation */}
              <div className="relative">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <CheckCircle className="w-12 h-12 text-green-600" />
                </div>
                <div className="absolute inset-0 w-20 h-20 bg-green-200 rounded-full mx-auto animate-ping opacity-20"></div>
              </div>
              
              {/* Success Message */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-green-600">CV Generated Successfully!</h3>
                <p className="text-gray-600 text-lg">
                  Your professional CV is ready for download
                </p>
              </div>
              
              {/* Download Button */}
              <div className="pt-4">
                <button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {isDownloading ? (
                    <>
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                      <span className="text-lg font-semibold">Downloading...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-6 h-6 mr-3" />
                      <span className="text-lg font-semibold">Download PDF</span>
                    </>
                  )}
                </button>
              </div>
              
              {/* Additional Info */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-center gap-2 text-green-700">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">
                    Your CV will be available for download for 30 minutes
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Error State */
            <div className="space-y-6">
              {/* Error Icon */}
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <XCircle className="w-12 h-12 text-red-600" />
              </div>
              
              {/* Error Message */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-red-600">Generation Failed</h3>
                <p className="text-gray-600 text-lg">
                  {completionMessage}
                </p>
              </div>
              
              {/* Retry Button */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    setShowCompletionModal(false);
                    // You can add retry logic here
                  }}
                  className="inline-flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </button>
              </div>
            </div>
          )}
          
          {/* Close Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              onClick={() => setShowCompletionModal(false)}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </BaseModal>

      {/* CV Details Modal */}
      <BaseModal
        isOpen={showCVDetails}
        onClose={() => setShowCVDetails(false)}
        title=""
      >
        {selectedCV && (
          <div className="space-y-6">
            {/* Header with Status */}
            <div className="text-center">
              <div className="mb-4">
                {selectedCV.status === 'completed' ? (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                ) : selectedCV.status === 'generating' ? (
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto">
                    <Clock className="w-10 h-10 text-yellow-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <XCircle className="w-10 h-10 text-red-600" />
                  </div>
                )}
              </div>
              
              <h3 className="text-xl font-bold text-color mb-2">CV Details</h3>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedCV.status)}`}>
                <span>{getStatusIcon(selectedCV.status)}</span>
                {selectedCV.status.charAt(0).toUpperCase() + selectedCV.status.slice(1)}
              </div>
            </div>

            {/* File Information Card */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-blue-600 block mb-1">Filename</span>
                    <p className="text-color font-mono text-sm bg-white rounded px-2 py-1">{selectedCV.filename || 'CV Document'}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-600 block mb-1">File Size</span>
                    <p className="text-color">{selectedCV.fileSize ? `${Math.round(selectedCV.fileSize / 1024)} KB` : 'Unknown'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-blue-600 block mb-1">Downloads</span>
                    <p className="text-color flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      {selectedCV.downloadCount || 0}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-blue-600 block mb-1">Created</span>
                    <p className="text-color">{new Date(selectedCV.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Created</label>
                <p className="text-color">{new Date(selectedCV.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Last Updated</label>
                <p className="text-color">{new Date(selectedCV.updatedAt).toLocaleString()}</p>
              </div>
              {selectedCV.lastDownloadedAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Downloaded</label>
                  <p className="text-color">{new Date(selectedCV.lastDownloadedAt).toLocaleString()}</p>
                </div>
              )}
              {selectedCV.expiresAt && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Expires</label>
                  <p className="text-color">{new Date(selectedCV.expiresAt).toLocaleString()}</p>
                </div>
              )}
            </div>

            {/* Time Remaining */}
            {selectedCV.minutesRemaining !== undefined && (
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-amber-800 font-medium">Time Remaining</p>
                    <p className="text-amber-700 text-sm">{formatTimeRemaining(selectedCV.minutesRemaining)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {selectedCV.errorMessage && (
              <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <XCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-red-800 font-medium mb-1">Error Details</h4>
                    <p className="text-red-700 text-sm">{selectedCV.errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCVDetails(false)}
                className="px-6 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Close
              </button>
              
              {canDownloadCV(selectedCV.status, selectedCV.isExpired) && (
                <button
                  onClick={() => {
                    handleDownloadCV(selectedCV);
                    setShowCVDetails(false);
                  }}
                  className="flex items-center gap-2 px-6 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  Download CV
                </button>
              )}
            </div>
          </div>
        )}
      </BaseModal>
    </div>
  );
}
