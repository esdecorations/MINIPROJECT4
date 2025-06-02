import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, Send } from "lucide-react";
import axios from "axios";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  is_solved?: boolean;
}

const API_BASE_URL = "https://es-decorations.onrender.com/inquiries";

const UserInquiries = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [replyMessage, setReplyMessage] = useState<string>("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setInquiries(response.data.filter((inq: Inquiry) => !inq.is_solved));
    } catch (error) {
      console.error("Error fetching inquiries:", error);
      setError("Failed to fetch inquiries");
    } finally {
      setLoading(false);
    }
  };

  const markAsSolved = async (id: string) => {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/solve`);

      if (response.status === 200) {
        setInquiries((prev) => prev.filter((inq) => inq.id !== id));
        if (selectedInquiry?.id === id) setSelectedInquiry(null);
        setSuccess("Inquiry marked as solved");
      }
    } catch (error) {
      console.error("Error marking inquiry as solved:", error);
      setError("Failed to mark inquiry as solved");
    }
  };

  const handleSendMessage = async () => {
    if (!replyMessage.trim() || !selectedInquiry) return;

    setSending(true);
    setError(null);
    setSuccess(null);

    try {
      const emailData = {
        plain_text_body: replyMessage, // Send the admin's reply
        html_body: `<p style="font-family: Arial, sans-serif; color: #333;">${replyMessage.replace(
          /\n/g,
          "<br>"
        )}</p>`, // Convert new lines to HTML <br>
      };

      const response = await axios.post(
        `${API_BASE_URL}/${selectedInquiry.id}/reply`,
        emailData,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        setSuccess("Reply sent successfully");
        setReplyMessage("");
        await markAsSolved(selectedInquiry.id);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError("Failed to send reply");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        <h2 className="text-3xl font-bold">User Inquiries</h2>

        {loading ? (
          <p className="text-center text-neutral-400">Loading inquiries...</p>
        ) : (
          <div className="grid md:grid-cols-[350px,1fr] gap-6">
            {/* Left Sidebar - List of Inquiries */}
            <div className="bg-neutral-900 rounded-xl p-4 h-[calc(100vh-240px)] overflow-y-auto">
              {inquiries.length === 0 ? (
                <p className="text-center text-neutral-400 py-4">
                  No pending inquiries
                </p>
              ) : (
                inquiries.map((inquiry) => (
                  <motion.div
                    key={inquiry.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedInquiry?.id === inquiry.id
                        ? "bg-blue-500/10 border border-blue-500/50"
                        : "hover:bg-neutral-800 border border-transparent"
                    }`}
                    onClick={() => setSelectedInquiry(inquiry)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-neutral-400" />
                      </div>
                      <div>
                        <h3 className="font-medium">{inquiry.name}</h3>
                        <p className="text-sm text-neutral-400">
                          {inquiry.subject}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Right Section - Inquiry Details */}
            {selectedInquiry ? (
              <div className="bg-neutral-900 rounded-xl p-6">
                <h3 className="text-2xl font-semibold">
                  {selectedInquiry.subject}
                </h3>
                <p className="text-neutral-400">
                  From: {selectedInquiry.name} ({selectedInquiry.email})
                </p>
                <div className="bg-neutral-800 rounded-lg p-4 mt-4">
                  <p className="text-neutral-300 whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>

                {/* Action Buttons and Message Box */}
                <div className="mt-4 space-y-4">
                  {/* Message Input Area */}
                  <div className="bg-neutral-800 rounded-lg p-2">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="w-full bg-transparent border-none focus:ring-0 text-neutral-300 placeholder-neutral-500 resize-none min-h-[100px] p-2"
                    />
                  </div>

                  {/* Status Messages */}
                  {error && (
                    <div className="text-red-500 bg-red-500/10 p-3 rounded-lg">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="text-green-500 bg-green-500/10 p-3 rounded-lg">
                      {success}
                    </div>
                  )}

                  {/* Buttons Row */}
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => markAsSolved(selectedInquiry.id)}
                      className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Mark as Solved
                    </button>

                    <button
                      onClick={handleSendMessage}
                      disabled={!replyMessage.trim() || sending}
                      className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                      {sending ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-neutral-900 rounded-xl p-6 flex items-center justify-center text-neutral-400">
                <p>Select an inquiry to view details</p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default UserInquiries;
