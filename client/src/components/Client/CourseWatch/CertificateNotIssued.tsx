import {
  useCertificateGeneration,
  useCertificateStatus,
} from "../../../hooks/useCertificate";

type Props = {
  user: any;
  courseId: string | undefined;
  isCourseCompleted: () => boolean;
  course: any;
};
const CertificateNotIssued = ({
  user,
  courseId,
  isCourseCompleted,
  course,
}: Props) => {
  const { refetch: refetchCertificateStatus } = useCertificateStatus(
    courseId || "",
    user?.id || "",
    !!courseId && !!user?.id && isCourseCompleted()
  );

  const { completeCourseWithCertificate, isGeneratingCertificate } =
    useCertificateGeneration();

  // If course doesn't provide certificates, show appropriate message
  if (!course?.certificateProvided) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h4 className="text-xl font-bold text-white mb-2">
          Course Completed! 🎉
        </h4>
        <p className="text-gray-300 mb-4">
          Congratulations on completing this course!
        </p>
        <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/20 border border-blue-500/30 rounded-xl p-6">
          <p className="text-gray-300 text-sm">
            📋 This course does not provide a completion certificate, but you
            have successfully finished all the content and gained valuable
            knowledge and skills.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg
            className="w-8 h-8 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h4 className="text-xl font-bold text-white mb-2">
          📜 Certificate Ready
        </h4>
        <p className="text-gray-300">
          Your certificate of completion is ready to be generated and sent to
          your email.
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/20 border border-blue-500/30 rounded-xl p-6 mb-6">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <span className="text-green-300 text-sm font-medium">
              Course completed successfully
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <span className="text-blue-300 text-sm font-medium">
              Certificate will be sent to {user?.email}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <span className="text-purple-300 text-sm font-medium">
              Digitally signed and verifiable
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => {
          if (user && course) {
            completeCourseWithCertificate({
              course,
              userId: user.id,
              userEmail: user.email,
              studentName: `${user.firstName} ${user.lastName}`,
              instructorName: `${course.instructor.firstName} ${course.instructor.lastName}`,
            });
            // Refetch certificate status after generation
            setTimeout(() => {
              refetchCertificateStatus();
            }, 2000);
          }
        }}
        disabled={isGeneratingCertificate}
        className="group w-full bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 hover:from-blue-700 hover:via-purple-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl hover:shadow-blue-500/25 hover:scale-105 active:scale-95 disabled:hover:scale-100"
      >
        {isGeneratingCertificate ? (
          <>
            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <span>Generating Your Certificate...</span>
          </>
        ) : (
          <>
            <svg
              className="w-6 h-6 group-hover:scale-110 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>🎉 Request My Certificate</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500 text-center mt-4">
        ⚡ Certificate generation takes 15-30 seconds
      </p>

      <div className="mt-4 text-xs text-gray-500 text-center">
        📧 Certificate will be sent to your email as a PDF
      </div>
    </div>
  );
};

export default CertificateNotIssued;
