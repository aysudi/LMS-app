import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaEnvelope,
  FaEnvelopeOpen,
  FaSearch,
  FaFilter,
  FaReply,
  FaTrash,
  FaEye,
  FaTimes,
  FaUser,
  FaCalendar,
  FaPhone,
  FaCheck,
  FaClock,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useContacts, useContactMutations } from "../../hooks/useContact";
import Loading from "../../components/Common/Loading";
import { formatDistanceToNow } from "date-fns";
import type { ContactMessage } from "../../types/contact.type";

const AdminContacts: React.FC = () => {
  const [selectedContact, setSelectedContact] = useState<ContactMessage | null>(
    null
  );
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "replied" | "unreplied"
  >("all");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    data: contactsData,
    isLoading,
    error,
  } = useContacts({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    isReplied: filterStatus === "all" ? undefined : filterStatus === "replied",
  });

  const { replyToContact, deleteContact } = useContactMutations();

  const contacts = contactsData?.contacts || [];
  const pagination = contactsData?.pagination;

  const handleReplySubmit = () => {
    if (!selectedContact || !replyMessage.trim()) return;

    replyToContact.mutate(
      {
        contactId: selectedContact._id,
        replyData: { replyMessage: replyMessage.trim() },
      },
      {
        onSuccess: () => {
          setIsReplyModalOpen(false);
          setReplyMessage("");
          setSelectedContact(null);
        },
      }
    );
  };

  const handleDeleteContact = (contactId: string) => {
    if (
      window.confirm("Are you sure you want to delete this contact message?")
    ) {
      deleteContact.mutate(contactId);
    }
  };

  const openReplyModal = (contact: ContactMessage) => {
    setSelectedContact(contact);
    setIsReplyModalOpen(true);
  };

  const getStatusColor = (isReplied: boolean) => {
    return isReplied
      ? "text-emerald-600 bg-emerald-100"
      : "text-amber-600 bg-amber-100";
  };

  const getStatusIcon = (isReplied: boolean) => {
    return isReplied ? FaEnvelopeOpen : FaEnvelope;
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FaExclamationTriangle className="mx-auto text-4xl text-red-500 mb-4" />
          <p className="text-gray-600">Failed to load contacts</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contact Messages</h1>
          <p className="text-gray-600 mt-1">
            Manage and respond to user inquiries
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Total Messages
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {pagination?.totalContacts || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-xl">
              <FaEnvelope className="text-blue-600 text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Replied</p>
              <p className="text-2xl font-bold text-emerald-600">
                {contacts.filter((c) => c.isReplied).length}
              </p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-xl">
              <FaCheck className="text-emerald-600 text-xl" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-amber-600">
                {contacts.filter((c) => !c.isReplied).length}
              </p>
            </div>
            <div className="p-3 bg-amber-100 rounded-xl">
              <FaClock className="text-amber-600 text-xl" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts by name, email, or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center gap-2">
            <FaFilter className="text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Messages</option>
              <option value="unreplied">Pending</option>
              <option value="replied">Replied</option>
            </select>
          </div>
        </div>
      </div>

      {/* Contact Messages */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loading
              variant="default"
              size="lg"
              message="Loading contacts..."
            />
          </div>
        ) : contacts.length === 0 ? (
          <div className="text-center py-12">
            <FaEnvelope className="mx-auto text-4xl text-gray-400 mb-4" />
            <p className="text-gray-600 text-lg">No contact messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {contacts.map((contact, index) => {
              const StatusIcon = getStatusIcon(contact.isReplied);
              return (
                <motion.div
                  key={contact._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <StatusIcon
                          className={`text-lg ${
                            contact.isReplied
                              ? "text-emerald-600"
                              : "text-amber-600"
                          }`}
                        />
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400 text-sm" />
                          <span className="font-semibold text-gray-900">
                            {contact.name}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            contact.isReplied
                          )}`}
                        >
                          {contact.isReplied ? "Replied" : "Pending"}
                        </span>
                      </div>

                      <div className="space-y-1 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaEnvelope className="text-xs" />
                          <span>{contact.email}</span>
                        </div>
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <FaPhone className="text-xs" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <FaCalendar className="text-xs" />
                          <span>
                            {formatDistanceToNow(new Date(contact.createdAt), {
                              addSuffix: true,
                            })}
                          </span>
                        </div>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-2">
                        {contact.subject}
                      </h3>
                      <p className="text-gray-600 text-sm line-clamp-2">
                        {contact.message}
                      </p>

                      {contact.isReplied && contact.replyMessage && (
                        <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                          <p className="text-sm text-emerald-800">
                            <strong>Your Reply:</strong> {contact.replyMessage}
                          </p>
                          <p className="text-xs text-emerald-600 mt-1">
                            Replied{" "}
                            {formatDistanceToNow(new Date(contact.repliedAt!), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedContact(contact)}
                        className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors duration-200"
                        title="View Details"
                      >
                        <FaEye />
                      </motion.button>

                      {!contact.isReplied && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openReplyModal(contact)}
                          className="p-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-600 rounded-lg transition-colors duration-200"
                          title="Reply"
                        >
                          <FaReply />
                        </motion.button>
                      )}

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleDeleteContact(contact._id)}
                        className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors duration-200"
                        title="Delete"
                        disabled={deleteContact.isLoading}
                      >
                        <FaTrash />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-center">
            <div className="flex gap-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Details Modal */}
      <AnimatePresence>
        {selectedContact && !isReplyModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedContact(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Contact Details
                </h2>
                <button
                  onClick={() => setSelectedContact(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <p className="text-gray-900 font-semibold">
                      {selectedContact.name}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-gray-900">{selectedContact.email}</p>
                  </div>
                  {selectedContact.phone && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900">{selectedContact.phone}</p>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                        selectedContact.isReplied
                      )}`}
                    >
                      {selectedContact.isReplied ? "Replied" : "Pending"}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subject
                  </label>
                  <p className="text-gray-900 font-semibold text-lg">
                    {selectedContact.subject}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>
                </div>

                {selectedContact.isReplied && selectedContact.replyMessage && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Reply
                    </label>
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
                      <p className="text-emerald-800 whitespace-pre-wrap">
                        {selectedContact.replyMessage}
                      </p>
                      <p className="text-sm text-emerald-600 mt-2">
                        Sent{" "}
                        {formatDistanceToNow(
                          new Date(selectedContact.repliedAt!),
                          { addSuffix: true }
                        )}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  {!selectedContact.isReplied && (
                    <button
                      onClick={() => openReplyModal(selectedContact)}
                      className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <FaReply />
                      Reply
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteContact(selectedContact._id)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                    disabled={deleteContact.isLoading}
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reply Modal */}
      <AnimatePresence>
        {isReplyModalOpen && selectedContact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setIsReplyModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                  Reply to {selectedContact.name}
                </h2>
                <button
                  onClick={() => setIsReplyModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Original Message:
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    <strong>Subject:</strong> {selectedContact.subject}
                  </p>
                  <p className="text-gray-700">{selectedContact.message}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Reply
                  </label>
                  <textarea
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Type your reply here..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleReplySubmit}
                    disabled={!replyMessage.trim() || replyToContact.isLoading}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200"
                  >
                    {replyToContact.isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <FaReply />
                        Send Reply
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsReplyModalOpen(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminContacts;
