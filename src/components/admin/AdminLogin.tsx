import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Briefcase, Lock, Mail } from "lucide-react";
import axios from "axios";

const AdminLogin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Auto-logout functionality
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let isTabActive = true;

    // Function to logout user
    const logoutUser = () => {
      localStorage.removeItem("adminToken");
      sessionStorage.removeItem("adminSession");
      navigate("/admin/login");
      console.log("🔒 Auto-logout: Session expired");
    };

    // Handle tab visibility changes
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab became inactive
        isTabActive = false;
        console.log("👁️ Tab became inactive");

        // Set a timeout for auto-logout (5 seconds after tab switch)
        timeoutId = setTimeout(() => {
          if (!isTabActive) {
            logoutUser();
          }
        }, 5000); // 5 seconds delay
      } else {
        // Tab became active again
        isTabActive = true;
        console.log("👁️ Tab became active");

        // Clear the logout timeout if user returns quickly
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
      }
    };

    // Handle window focus/blur events (alternative detection)
    const handleFocus = () => {
      isTabActive = true;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };

    const handleBlur = () => {
      isTabActive = false;
      // Immediate logout on window blur (more aggressive)
      timeoutId = setTimeout(() => {
        if (!isTabActive) {
          logoutUser();
        }
      }, 3000); // 3 seconds for window blur
    };

    // Add event listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);

    // Cleanup function
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [navigate]);

  // Session management - check if user should be logged out
  useEffect(() => {
    const checkSession = () => {
      const token = localStorage.getItem("adminToken");
      const sessionId = sessionStorage.getItem("adminSession");

      // If there's a token but no session ID, it means user opened a new tab
      if (token && !sessionId) {
        console.log("🚫 New tab detected - logging out");
        localStorage.removeItem("adminToken");
        navigate("/admin/login");
      }
    };

    checkSession();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/admin/login",
        new URLSearchParams({
          username: formData.email,
          password: formData.password,
        }),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      // Store token and create session identifier
      localStorage.setItem("adminToken", response.data.access_token);
      sessionStorage.setItem("adminSession", Date.now().toString());

      console.log("✅ Login successful");
      navigate("/admin/dashboard");
    } catch (error) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-neutral-900 p-8 rounded-xl"
      >
        <div className="text-center">
          <motion.div
            className="flex justify-center mb-6"
            whileHover={{ scale: 1.05 }}
          >
            <Briefcase className="h-12 w-12 text-blue-500" />
          </motion.div>
          <h2 className="text-3xl font-bold text-white">Admin Login</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Sign in to access the admin dashboard
          </p>

          {/* Security Notice */}
          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-xs text-yellow-400">
              🔒 Enhanced Security: Session will auto-logout when switching tabs
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-neutral-300 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-neutral-500" />
                </div>
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="block w-full pl-10 pr-3 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Sign In
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
