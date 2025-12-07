import React, { useState } from "react";
import { useCreateContact } from "../../hooks/useContact";
import type { CreateContactData } from "../../types/contact.type";
import { motion } from "framer-motion";
import { FaCheckCircle, FaPaperPlane } from "react-icons/fa";
import Loading from "../Common/Loading";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    phone: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { createContact, isLoading: isSubmitting } = useCreateContact();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.subject.trim() ||
      !formData.message.trim()
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert("Please enter a valid email address.");
      return;
    }

    // Prepare data for API
    const contactData: CreateContactData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      subject: formData.subject.trim(),
      message: formData.message.trim(),
      phone: formData.phone.trim() || undefined,
    };

    createContact(contactData, {
      onSuccess: () => {
        setIsSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          phone: "",
          message: "",
        });

        // Reset success message after 5 seconds
        setTimeout(() => setIsSubmitted(false), 5000);
      },
      onError: (error) => {
        console.error("Contact form submission error:", error);
        // alert("Failed to send message. Please try again.");
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
    >
      <div className="bg-white rounded-3xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            Send Us a Message
          </h3>
          <p className="text-gray-600">
            Fill out the form below and we'll get back to you within 24 hours.
          </p>
        </div>

        {isSubmitted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3"
          >
            <FaCheckCircle className="text-green-500 text-xl" />
            <div>
              <p className="text-green-800 font-semibold">
                Message sent successfully!
              </p>
              <p className="text-green-600 text-sm">
                We'll get back to you soon.
              </p>
            </div>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                placeholder="Your phone number"
              />
            </div>
            <div>
              <label
                htmlFor="subject"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Subject *
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white"
                placeholder="Brief subject line"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleInputChange}
              required
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 bg-gray-50 focus:bg-white resize-none"
              placeholder="Tell us more about your inquiry..."
            />
          </div>

          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
            whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            className="w-full py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-3 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loading variant="default" size="sm" message="" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <FaPaperPlane />
                <span>Send Message</span>
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default ContactForm;
