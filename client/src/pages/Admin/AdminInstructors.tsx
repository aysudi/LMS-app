import React, { useState } from "react";
import {
  FaUser,
  FaGraduationCap,
  FaCheck,
  FaTimes,
  FaEye,
  FaBookOpen,
} from "react-icons/fa";

interface InstructorApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  expertise: string[];
  experience: string;
  education: string;
  portfolio: string;
  reason: string;
  appliedDate: string;
  status: "pending" | "approved" | "rejected";
}

const AdminInstructors: React.FC = () => {
  const [applications] = useState<InstructorApplication[]>([
    {
      id: "1",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@example.com",
      expertise: ["React", "JavaScript", "TypeScript"],
      experience: "5+ years of professional development, led teams at Google",
      education: "MS Computer Science - Stanford University",
      portfolio: "https://sarahjohnson.dev",
      reason:
        "I want to share my knowledge and help others learn web development",
      appliedDate: "2024-01-15",
      status: "pending",
    },
    {
      id: "2",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@example.com",
      expertise: ["Python", "Machine Learning", "Data Science"],
      experience: "8+ years in AI/ML, worked at OpenAI and Meta",
      education: "PhD Machine Learning - MIT",
      portfolio: "https://michaelchen.ai",
      reason: "Passionate about democratizing AI education",
      appliedDate: "2024-01-12",
      status: "approved",
    },
  ]);

  const [selectedApplication, setSelectedApplication] =
    useState<InstructorApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const filteredApplications = applications.filter(
    (app) => filterStatus === "all" || app.status === filterStatus
  );

  const handleApprove = (id: string) => {
    console.log("Approve instructor:", id);
    // TODO: Implement API call
  };

  const handleReject = (id: string) => {
    console.log("Reject instructor:", id);
    // TODO: Implement API call
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Review
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Instructor Applications
            </h1>
            <p className="text-slate-600">
              Review and manage instructor applications for the platform
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200/50">
            <div className="text-2xl font-bold text-blue-700">
              {applications.length}
            </div>
            <div className="text-blue-600 text-sm font-medium">
              Total Applications
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200/50">
            <div className="text-2xl font-bold text-yellow-700">
              {applications.filter((a) => a.status === "pending").length}
            </div>
            <div className="text-yellow-600 text-sm font-medium">Pending</div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200/50">
            <div className="text-2xl font-bold text-green-700">
              {applications.filter((a) => a.status === "approved").length}
            </div>
            <div className="text-green-600 text-sm font-medium">Approved</div>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200/50">
            <div className="text-2xl font-bold text-red-700">
              {applications.filter((a) => a.status === "rejected").length}
            </div>
            <div className="text-red-600 text-sm font-medium">Rejected</div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
        >
          <option value="all">All Applications</option>
          <option value="pending">Pending Review</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Applications List */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Applicant
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Expertise
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-slate-900">
                  Applied Date
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredApplications.map((application) => (
                <tr
                  key={application.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-sm">
                          {application.firstName[0]}
                          {application.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">
                          {application.firstName} {application.lastName}
                        </div>
                        <div className="text-sm text-slate-500">
                          {application.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {application.expertise.slice(0, 3).map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {skill}
                        </span>
                      ))}
                      {application.expertise.length > 3 && (
                        <span className="text-xs text-slate-500">
                          +{application.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(application.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(application.appliedDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <FaEye />
                      </button>
                      {application.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleApprove(application.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            onClick={() => handleReject(application.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-slate-900">
                  Instructor Application Details
                </h2>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
                >
                  <FaTimes />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-96">
              <div className="space-y-6">
                {/* Applicant Info */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <FaUser className="mr-2 text-blue-600" />
                    Applicant Information
                  </h3>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-slate-600">
                          Name:
                        </span>
                        <p className="text-slate-900">
                          {selectedApplication.firstName}{" "}
                          {selectedApplication.lastName}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-slate-600">
                          Email:
                        </span>
                        <p className="text-slate-900">
                          {selectedApplication.email}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-sm font-medium text-slate-600">
                          Portfolio:
                        </span>
                        <a
                          href={selectedApplication.portfolio}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-700 break-all"
                        >
                          {selectedApplication.portfolio}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expertise */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <FaBookOpen className="mr-2 text-green-600" />
                    Expertise
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplication.expertise.map((skill) => (
                      <span
                        key={skill}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Professional Experience
                  </h3>
                  <p className="text-slate-700 bg-slate-50 rounded-xl p-4">
                    {selectedApplication.experience}
                  </p>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center">
                    <FaGraduationCap className="mr-2 text-purple-600" />
                    Education
                  </h3>
                  <p className="text-slate-700 bg-slate-50 rounded-xl p-4">
                    {selectedApplication.education}
                  </p>
                </div>

                {/* Motivation */}
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-3">
                    Why do you want to become an instructor?
                  </h3>
                  <p className="text-slate-700 bg-slate-50 rounded-xl p-4">
                    {selectedApplication.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            {selectedApplication.status === "pending" && (
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleApprove(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center"
                  >
                    <FaCheck className="mr-2" />
                    Approve Application
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedApplication.id);
                      setSelectedApplication(null);
                    }}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center"
                  >
                    <FaTimes className="mr-2" />
                    Reject Application
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInstructors;
