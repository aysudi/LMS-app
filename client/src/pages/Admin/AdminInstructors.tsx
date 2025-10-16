import React, { useState } from "react";
import {
  FaUser,
  FaGraduationCap,
  FaCheck,
  FaTimes,
  FaEye,
  FaBookOpen,
  FaSpinner,
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
  useInstructorApplications,
  useApproveInstructorApplication,
  useRejectInstructorApplication,
} from "../../hooks/useInstructorApplication";
import type { InstructorApplication } from "../../types/instructorApplication.type";

const AdminInstructors: React.FC = () => {
  const [selectedApplication, setSelectedApplication] =
    useState<InstructorApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Fetch instructor applications
  const { data, isLoading, error } = useInstructorApplications({
    page: currentPage,
    limit,
    ...(filterStatus !== "all" && { status: filterStatus }),
  });

  // Mutations for approve/reject
  const approveMutation = useApproveInstructorApplication();
  const rejectMutation = useRejectInstructorApplication();

  const applications = data?.data?.applications || [];
  const pagination = data?.data?.pagination;

  const handleApprove = async (application: InstructorApplication) => {
    const result = await Swal.fire({
      title: "Approve Instructor Application",
      html: `
        <div class="text-left">
          <p class="mb-4">You are about to approve <strong>${application.firstName} ${application.lastName}</strong> as an instructor.</p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Admin Feedback (Optional)
            </label>
            <textarea 
              id="adminFeedback" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              rows="3"
              placeholder="Add any feedback or welcome message..."
            ></textarea>
          </div>
        </div>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "✅ Approve Application",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const feedback = (
          document.getElementById("adminFeedback") as HTMLTextAreaElement
        )?.value;
        return { adminFeedback: feedback };
      },
    });

    if (result.isConfirmed) {
      approveMutation.mutate({
        applicationId: application._id,
        adminFeedback: result.value.adminFeedback || undefined,
      });
      setSelectedApplication(null);
    }
  };

  const handleReject = async (application: InstructorApplication) => {
    const result = await Swal.fire({
      title: "Reject Instructor Application",
      html: `
        <div class="text-left">
          <p class="mb-4">You are about to reject <strong>${application.firstName} ${application.lastName}</strong>'s instructor application.</p>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Rejection Reason <span class="text-red-500">*</span>
            </label>
            <select 
              id="rejectionReason" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 mb-3"
              required
            >
              <option value="">Select a reason...</option>
              <option value="insufficient_experience">Insufficient Teaching Experience</option>
              <option value="incomplete_application">Incomplete Application</option>
              <option value="expertise_mismatch">Expertise Doesn't Match Platform Needs</option>
              <option value="quality_concerns">Quality/Professionalism Concerns</option>
              <option value="other">Other Reason</option>
            </select>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Additional Feedback (Optional)
            </label>
            <textarea 
              id="adminFeedback" 
              class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              rows="3"
              placeholder="Add specific feedback to help the applicant improve..."
            ></textarea>
          </div>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#DC2626",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "❌ Reject Application",
      cancelButtonText: "Cancel",
      preConfirm: () => {
        const rejectionReason = (
          document.getElementById("rejectionReason") as HTMLSelectElement
        )?.value;
        const feedback = (
          document.getElementById("adminFeedback") as HTMLTextAreaElement
        )?.value;

        if (!rejectionReason) {
          Swal.showValidationMessage("Please select a rejection reason");
          return false;
        }

        return {
          rejectionReason,
          adminFeedback: feedback || undefined,
        };
      },
    });

    if (result.isConfirmed) {
      rejectMutation.mutate({
        applicationId: application._id,
        rejectionReason: result.value.rejectionReason,
        adminFeedback: result.value.adminFeedback,
      });
      setSelectedApplication(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            ✅ Approved
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ❌ Rejected
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            ⏳ Pending Review
          </span>
        );
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FaSpinner className="animate-spin text-4xl text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading instructor applications...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <div className="text-center">
          <FaTimes className="text-red-500 text-4xl mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Error Loading Applications
          </h3>
          <p className="text-red-600">
            {error instanceof Error
              ? error.message
              : "Failed to load instructor applications. Please try again."}
          </p>
        </div>
      </div>
    );
  }

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
              {pagination?.totalApplications || 0}
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
          onChange={(e) => {
            setFilterStatus(e.target.value);
            setCurrentPage(1);
          }}
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
        {applications.length === 0 ? (
          <div className="text-center py-12">
            <FaUser className="text-gray-300 text-6xl mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Applications Found
            </h3>
            <p className="text-gray-500">
              {filterStatus === "all"
                ? "No instructor applications have been submitted yet."
                : `No ${filterStatus} applications found.`}
            </p>
          </div>
        ) : (
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
                {applications.map((application) => (
                  <tr
                    key={application._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          {application.user?.avatar ? (
                            <img
                              src={application.user.avatar}
                              alt={`${application.firstName} ${application.lastName}`}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-white font-bold text-sm">
                              {application.firstName[0]}
                              {application.lastName[0]}
                            </span>
                          )}
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
                      {new Date(application.submittedAt).toLocaleDateString()}
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
                              onClick={() => handleApprove(application)}
                              disabled={approveMutation.isPending}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Approve"
                            >
                              {approveMutation.isPending ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaCheck />
                              )}
                            </button>
                            <button
                              onClick={() => handleReject(application)}
                              disabled={rejectMutation.isPending}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Reject"
                            >
                              {rejectMutation.isPending ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <FaTimes />
                              )}
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
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-200/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing page {pagination.currentPage} of {pagination.totalPages}{" "}
              ({pagination.totalApplications} total applications)
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg ${
                    currentPage === i + 1
                      ? "bg-indigo-600 text-white"
                      : "text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Application Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
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

            <div className="p-6 overflow-y-auto max-h-[60vh]">
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
                      {selectedApplication.phone && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">
                            Phone:
                          </span>
                          <p className="text-slate-900">
                            {selectedApplication.phone}
                          </p>
                        </div>
                      )}
                      <div>
                        <span className="text-sm font-medium text-slate-600">
                          Status:
                        </span>
                        <div className="mt-1">
                          {getStatusBadge(selectedApplication.status)}
                        </div>
                      </div>
                      {selectedApplication.portfolio && (
                        <div className="md:col-span-2">
                          <span className="text-sm font-medium text-slate-600">
                            Portfolio:
                          </span>
                          <a
                            href={selectedApplication.portfolio}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 break-all block"
                          >
                            {selectedApplication.portfolio}
                          </a>
                        </div>
                      )}
                      {selectedApplication.linkedIn && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">
                            LinkedIn:
                          </span>
                          <a
                            href={selectedApplication.linkedIn}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 break-all block"
                          >
                            {selectedApplication.linkedIn}
                          </a>
                        </div>
                      )}
                      {selectedApplication.website && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">
                            Website:
                          </span>
                          <a
                            href={selectedApplication.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-700 break-all block"
                          >
                            {selectedApplication.website}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedApplication.bio && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Bio
                    </h3>
                    <p className="text-slate-700 bg-slate-50 rounded-xl p-4">
                      {selectedApplication.bio}
                    </p>
                  </div>
                )}

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
                    {selectedApplication.motivation}
                  </p>
                </div>

                {/* Sample Course */}
                {selectedApplication.sampleCourseTitle && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Sample Course Proposal
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <div>
                        <span className="text-sm font-medium text-slate-600">
                          Course Title:
                        </span>
                        <p className="text-slate-900 font-medium">
                          {selectedApplication.sampleCourseTitle}
                        </p>
                      </div>
                      {selectedApplication.sampleCourseDescription && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">
                            Course Description:
                          </span>
                          <p className="text-slate-700">
                            {selectedApplication.sampleCourseDescription}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Review Information */}
                {selectedApplication.reviewedAt && (
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-3">
                      Review Information
                    </h3>
                    <div className="bg-slate-50 rounded-xl p-4 space-y-3">
                      <div>
                        <span className="text-sm font-medium text-slate-600">
                          Reviewed At:
                        </span>
                        <p className="text-slate-900">
                          {new Date(
                            selectedApplication.reviewedAt
                          ).toLocaleString()}
                        </p>
                      </div>
                      {selectedApplication.reviewedBy && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">
                            Reviewed By:
                          </span>
                          <p className="text-slate-900">
                            {selectedApplication.reviewedBy.firstName}{" "}
                            {selectedApplication.reviewedBy.lastName}
                          </p>
                        </div>
                      )}
                      {selectedApplication.adminFeedback && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">
                            Admin Feedback:
                          </span>
                          <p className="text-slate-700">
                            {selectedApplication.adminFeedback}
                          </p>
                        </div>
                      )}
                      {selectedApplication.rejectionReason && (
                        <div>
                          <span className="text-sm font-medium text-slate-600">
                            Rejection Reason:
                          </span>
                          <p className="text-red-700">
                            {selectedApplication.rejectionReason.replace(
                              /_/g,
                              " "
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            {selectedApplication.status === "pending" && (
              <div className="p-6 border-t border-slate-200 bg-slate-50">
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      handleApprove(selectedApplication);
                      setSelectedApplication(null);
                    }}
                    disabled={approveMutation.isPending}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approveMutation.isPending ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaCheck className="mr-2" />
                    )}
                    Approve Application
                  </button>
                  <button
                    onClick={() => {
                      handleReject(selectedApplication);
                      setSelectedApplication(null);
                    }}
                    disabled={rejectMutation.isPending}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-xl font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectMutation.isPending ? (
                      <FaSpinner className="animate-spin mr-2" />
                    ) : (
                      <FaTimes className="mr-2" />
                    )}
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
