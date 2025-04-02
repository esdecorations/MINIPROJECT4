import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Camera, Users, X } from 'lucide-react';
import axios from 'axios';
import Navbar from './Navbar';
import { BackgroundBeams } from './ui/background-beams';

interface JobListing {
  _id: string;
  id: string;
  title: string;
  description: string;
  requirements: string[];
  type: string;
  icon: string;
  isActive: boolean;
}

interface JobApplication {
  jobId: string;
  name: string;
  email: string;
  phone: string;
  experience: string;
  resume?: string;
  address?: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  experience?: string;
  address?: string;
  resume?: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
const ALLOWED_FILE_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

const CareersPage = () => {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<JobApplication>({
    jobId: '',
    name: '',
    email: '',
    phone: '',
    experience: '',
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [fileError, setFileError] = useState<string>('');

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get('http://127.0.0.1:8000/job-listings');
        // Filter only active jobs
        const activeJobs = response.data.filter((job: JobListing) => job.isActive);
        setJobs(activeJobs);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError('Failed to load job listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
      isValid = false;
    } else if (!/^[a-zA-Z\s]+$/.test(formData.name.trim())) {
      errors.name = 'Name should only contain letters and spaces';
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
      isValid = false;
    }

    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
      isValid = false;
    } else if (!/^[1-9][0-9]{9}$/.test(formData.phone.trim())) {
      errors.phone = 'Please enter a valid 10-digit phone number (should not start with 0)';
      isValid = false;
    }

    // Experience (Age) validation
    if (!formData.experience.trim()) {
      errors.experience = 'Age is required';
      isValid = false;
    } else {
      const age = parseInt(formData.experience);
      if (isNaN(age) || age < 18 || age > 60) {
        errors.experience = 'Age must be between 18 and 60';
        isValid = false;
      }
    }

    // Address validation for catering position
    if (formData.jobId === 'catering' && (!formData.address || !formData.address.trim())) {
      errors.address = 'Address is required for catering positions';
      isValid = false;
    }

    // Resume validation for non-catering positions
    if (formData.jobId !== 'catering' && !formData.resume) {
      errors.resume = 'Resume is required for this position';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'ChefHat':
        return ChefHat;
      case 'Camera':
        return Camera;
      case 'Users':
        return Users;
      default:
        return Users;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: '' });

    if (!validateForm()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const applicationData = {
        ...formData,
        status: 'pending',
        appliedDate: new Date().toISOString()
      };

      const response = await axios.post('http://127.0.0.1:8000/job-applications', applicationData);

      if (response.status === 200) {
        setSubmitStatus({
          type: 'success',
          message: 'Application submitted successfully! We will contact you soon.'
        });
        setSelectedJob(null);
        setFormData({
          jobId: '',
          name: '',
          email: '',
          phone: '',
          experience: '',
        });
        setFormErrors({});
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to submit application. Please try again.'
      });
      console.error('Error submitting application:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError('');
    setFormErrors(prev => ({ ...prev, resume: undefined }));
    const file = e.target.files?.[0];
    
    if (file) {
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        setFileError('File size must be less than 5MB');
        e.target.value = ''; // Clear the input
        return;
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        setFileError('Only PDF and Word documents are allowed');
        e.target.value = ''; // Clear the input
        return;
      }

      try {
        // Convert file to base64
        const base64String = await convertFileToBase64(file);
        setFormData({ ...formData, resume: base64String });
      } catch (error) {
        console.error('Error converting file:', error);
        setFileError('Error processing file. Please try again.');
      }
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const base64String = reader.result.split(',')[1];
          resolve(base64String);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="relative pt-20">
        <BackgroundBeams className="opacity-20" />
        <div className="container-width relative z-10 px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
              Join Our Team
            </h1>
            <p className="text-neutral-400 max-w-2xl mx-auto">
              Be part of something extraordinary. We're looking for talented individuals to join our growing team.
            </p>
          </motion.div>

          {error ? (
            <div className="text-center text-red-500 py-10">
              {error}
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center text-neutral-400 py-10">
              No job openings available at the moment.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-20">
              {jobs.map((job, index) => {
                const IconComponent = getIconComponent(job.icon);
                return (
                  <motion.div
                    key={job._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -10 }}
                    className="group cursor-pointer"
                    onClick={() => {
                      setSelectedJob(job._id);
                      setFormData({ ...formData, jobId: job.id });
                      setFormErrors({});
                      setFileError('');
                    }}
                  >
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden hover:border-neutral-700 transition-colors">
                      <div className="p-6">
                        <IconComponent className="w-10 h-10 text-blue-500 mb-4" />
                        <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                        <p className="text-neutral-400 mb-4">{job.description}</p>
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-neutral-300 mb-2">Requirements:</h4>
                          <ul className="space-y-2">
                            {job.requirements.map((req, i) => (
                              <li key={i} className="text-sm text-neutral-400 flex items-start">
                                <span className="text-blue-500 mr-2">•</span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex justify-between items-center text-sm text-neutral-500">
                          <span>{job.type}</span>
                          <span className="text-green-500">Active</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedJob && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setSelectedJob(null);
                setFormErrors({});
                setFileError('');
              }
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-neutral-900 rounded-xl p-6 max-w-md w-full relative"
            >
              <button
                onClick={() => {
                  setSelectedJob(null);
                  setFormErrors({});
                  setFileError('');
                }}
                className="absolute right-4 top-4 text-neutral-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold mb-4">
                Apply for {jobs.find(j => j._id === selectedJob)?.title}
              </h2>

              {submitStatus.type && (
                <div className={`mb-4 p-3 rounded-lg ${
                  submitStatus.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                }`}>
                  {submitStatus.message}
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) {
                        setFormErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 bg-neutral-800 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.name ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (formErrors.email) {
                        setFormErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 bg-neutral-800 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.email ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                      setFormData({ ...formData, phone: value });
                      if (formErrors.phone) {
                        setFormErrors(prev => ({ ...prev, phone: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 bg-neutral-800 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.phone ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.phone}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    min="18"
                    max="60"
                    value={formData.experience}
                    onChange={(e) => {
                      setFormData({ ...formData, experience: e.target.value });
                      if (formErrors.experience) {
                        setFormErrors(prev => ({ ...prev, experience: undefined }));
                      }
                    }}
                    className={`w-full px-3 py-2 bg-neutral-800 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none ${
                      formErrors.experience ? 'border-red-500' : 'border-neutral-700'
                    }`}
                  />
                  {formErrors.experience && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.experience}</p>
                  )}
                </div>

                {formData.jobId === 'catering' ? (
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Address
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => {
                        setFormData({ ...formData, address: e.target.value });
                        if (formErrors.address) {
                          setFormErrors(prev => ({ ...prev, address: undefined }));
                        }
                      }}
                      className={`w-full px-3 py-2 bg-neutral-800 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none h-24 ${
                        formErrors.address ? 'border-red-500' : 'border-neutral-700'
                      }`}
                    />
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.address}</p>
                    )}
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-1">
                      Resume
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className={`w-full px-3 py-2 bg-neutral-800 rounded-lg border focus:ring-2 focus:ring-blue-500 focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 ${
                        formErrors.resume || fileError ? 'border-red-500' : 'border-neutral-700'
                      }`}
                    />
                    {(fileError || formErrors.resume) && (
                      <p className="mt-1 text-sm text-red-500">{fileError || formErrors.resume}</p>
                    )}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CareersPage;