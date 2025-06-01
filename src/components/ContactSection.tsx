import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { MapPin, Phone, Mail, Clock, Shield } from "lucide-react";
import { BackgroundBeams } from "./ui/background-beams";

// Add this to your HTML head or create a separate script loader
declare global {
  interface Window {
    grecaptcha: any;
  }
}

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);

  // IMPORTANT: Replace with your actual site key from Google reCAPTCHA console
  const RECAPTCHA_SITE_KEY = "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Replace with your actual site key

  // Enhanced Load reCAPTCHA script with debug logging
  useEffect(() => {
    console.log("reCAPTCHA Site Key:", RECAPTCHA_SITE_KEY);
    console.log("Current domain:", window.location.hostname);
    
    const style = document.createElement('style');
    style.innerHTML = '.grecaptcha-badge { display: none !important; }';
    document.head.appendChild(style);

    const loadRecaptcha = () => {
      if (!window.grecaptcha) {
        console.log("Loading reCAPTCHA script...");
        const script = document.createElement("script");
        script.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
        script.async = true;
        script.defer = true;
        script.onload = () => {
          console.log("reCAPTCHA script loaded successfully");
          setRecaptchaLoaded(true);
        };
        script.onerror = () => {
          console.error("Failed to load reCAPTCHA script");
        };
        document.head.appendChild(script);
      } else {
        console.log("reCAPTCHA already loaded");
        setRecaptchaLoaded(true);
      }
    };

    loadRecaptcha();
  }, []);

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Enhanced Get reCAPTCHA token with debug logging
  const getReCaptchaToken = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      console.log("=== reCAPTCHA Debug Info ===");
      console.log("Site Key:", RECAPTCHA_SITE_KEY);
      console.log("recaptchaLoaded:", recaptchaLoaded);
      console.log("window.grecaptcha exists:", !!window.grecaptcha);
      console.log("Current domain:", window.location.hostname);
      
      if (!window.grecaptcha || !recaptchaLoaded) {
        console.error("reCAPTCHA not ready");
        reject(new Error("reCAPTCHA not loaded"));
        return;
      }

      console.log("Calling grecaptcha.ready()...");
      window.grecaptcha.ready(() => {
        console.log("grecaptcha.ready() callback executed");
        console.log("Executing reCAPTCHA with action: contact_form");
        
        window.grecaptcha
          .execute(RECAPTCHA_SITE_KEY, { action: "contact_form" })
          .then((token: string) => {
            console.log("✅ reCAPTCHA token received:", token ? token.substring(0, 20) + "..." : "null/empty");
            if (token) {
              resolve(token);
            } else {
              console.error("❌ reCAPTCHA returned null token");
              reject(new Error("reCAPTCHA returned null token"));
            }
          })
          .catch((error: any) => {
            console.error("❌ reCAPTCHA execute failed:", error);
            reject(error);
          });
      });
    });
  };

  // Enhanced Handle form submission with debug logging
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMessage("");

    try {
      console.log("=== Form Submission Started ===");
      
      // Basic form validation
      if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
        setStatusMessage("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setStatusMessage("Please enter a valid email address");
        setIsSubmitting(false);
        return;
      }

      // Get reCAPTCHA token
      let recaptchaToken = "";
      try {
        console.log("Attempting to get reCAPTCHA token...");
        recaptchaToken = await getReCaptchaToken();
        console.log("✅ reCAPTCHA token obtained successfully");
      } catch (error) {
        console.warn("⚠️ reCAPTCHA failed, proceeding without token:", error);
        // Continue without reCAPTCHA if it fails to load
      }

      // Prepare form data with reCAPTCHA token
      const submissionData = {
        ...formData,
        recaptcha_token: recaptchaToken,
      };

      console.log("Submitting form data:", { 
        ...submissionData, 
        recaptcha_token: recaptchaToken ? "***TOKEN_PRESENT***" : "***NO_TOKEN***" 
      });

      // Submit to your backend
      const response = await axios.post(
        "http://127.0.0.1:8000/submit", // Update this to your production URL when deploying
        submissionData,
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 second timeout
        }
      );

      console.log("✅ Backend response:", response.status, response.data);

      if (response.status === 200) {
        setStatusMessage("✅ Message sent successfully! We'll get back to you soon.");
        // Clear form
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
        });
      } else {
        setStatusMessage("❌ Something went wrong. Please try again.");
      }
    } catch (error: any) {
      console.error("❌ Form submission error:", error);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      
      if (error.response?.status === 429) {
        setStatusMessage("❌ Too many requests. Please try again later.");
      } else if (error.response?.status === 400) {
        const errorDetail = error.response?.data?.detail || "Invalid form data. Please check your inputs.";
        console.error("Backend validation error:", errorDetail);
        setStatusMessage(`❌ ${errorDetail}`);
      } else if (error.code === "ECONNABORTED") {
        setStatusMessage("❌ Request timed out. Please try again.");
      } else {
        setStatusMessage("❌ Error submitting form. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact-us" className="relative min-h-screen bg-neutral-950">
      <div className="container-width relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 pt-20"
        >
          <h2 className="text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-neutral-200 to-neutral-600">
            Get in Touch
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Let's create something extraordinary together
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-start space-x-4">
              <MapPin className="w-6 h-6 text-neutral-400 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-neutral-200">
                  Location
                </h3>
                <p className="text-neutral-400">
                  Nadelpeedika Junction, Pampady, Kottayam
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Phone className="w-6 h-6 text-neutral-400 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-neutral-200">
                  Phone
                </h3>
                <p className="text-neutral-400">+91 95620 39676</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Mail className="w-6 h-6 text-neutral-400 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-neutral-200">
                  Email
                </h3>
                <p className="text-neutral-400">esdecorationsind@gmail.com</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <Clock className="w-6 h-6 text-neutral-400 mt-1" />
              <div>
                <h3 className="text-xl font-semibold mb-2 text-neutral-200">
                  Hours
                </h3>
                <p className="text-neutral-400">
                  Monday - Friday: 9:00 AM - 6:00 PM
                </p>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-neutral-900/50 rounded-lg border border-neutral-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-neutral-200 placeholder:text-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Your name"
                  required
                  maxLength={100}
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-neutral-300 mb-2"
                >
                  Email *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-3 bg-neutral-900/50 rounded-lg border border-neutral-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-neutral-200 placeholder:text-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Your email"
                  required
                  maxLength={100}
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full px-4 py-3 bg-neutral-900/50 rounded-lg border border-neutral-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-neutral-200 placeholder:text-neutral-500 disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Subject"
                maxLength={150}
              />
            </div>
            <div>
              <label
                htmlFor="message"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Message *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                disabled={isSubmitting}
                rows={4}
                className="w-full px-4 py-3 bg-neutral-900/50 rounded-lg border border-neutral-800 focus:ring-2 focus:ring-blue-500 focus:outline-none text-neutral-200 placeholder:text-neutral-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="Your message"
                required
                maxLength={1000}
              ></textarea>
            </div>

            {/* reCAPTCHA Status Indicator */}
            <div className="flex items-center space-x-2 text-sm text-neutral-400">
              <Shield className="w-4 h-4" />
              <span>
                {recaptchaLoaded 
                  ? "Protected by reCAPTCHA" 
                  : "Loading security verification..."
                }
              </span>
            </div>

            {statusMessage && (
              <div 
                className={`text-center text-sm font-medium mt-4 p-3 rounded-lg ${
                  statusMessage.includes("✅") 
                    ? "text-green-400 bg-green-900/20 border border-green-800" 
                    : "text-red-400 bg-red-900/20 border border-red-800"
                }`}
              >
                {statusMessage}
              </div>
            )}

            <motion.button
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              className="w-full px-8 py-4 bg-gradient-to-r from-blue-500 to-violet-500 text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Sending...</span>
                </>
              ) : (
                <span>Send Message</span>
              )}
            </motion.button>

            {/* reCAPTCHA Terms */}
            <p className="text-xs text-neutral-500 text-center">
              This site is protected by reCAPTCHA and the Google{" "}
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Privacy Policy
              </a>{" "}
              and{" "}
              <a 
                href="https://policies.google.com/terms" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                Terms of Service
              </a>{" "}
              apply.
            </p>
          </motion.form>
        </div>
      </div>
      <BackgroundBeams />
    </section>
  );
};

export default ContactSection;