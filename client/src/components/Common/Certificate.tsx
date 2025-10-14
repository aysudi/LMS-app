import React from "react";

interface CertificateProps {
  studentName: string;
  courseName: string;
  instructorName: string;
  completionDate: Date;
  certificateId: string;
}

const Certificate: React.FC<CertificateProps> = ({
  studentName,
  courseName,
  instructorName,
  completionDate,
  certificateId,
}) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border-8 border-gradient-to-r from-blue-600 via-purple-600 to-blue-600 shadow-2xl">
      {/* Decorative Border */}
      <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 p-12">
        {/* Corner Decorations */}
        <div className="absolute top-4 left-4 w-16 h-16 border-l-4 border-t-4 border-blue-600 opacity-30"></div>
        <div className="absolute top-4 right-4 w-16 h-16 border-r-4 border-t-4 border-blue-600 opacity-30"></div>
        <div className="absolute bottom-4 left-4 w-16 h-16 border-l-4 border-b-4 border-blue-600 opacity-30"></div>
        <div className="absolute bottom-4 right-4 w-16 h-16 border-r-4 border-b-4 border-blue-600 opacity-30"></div>

        {/* Header Logo/Badge */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <svg
              className="w-12 h-12 text-white"
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
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            SKILLIFY
          </h1>
          <p className="text-slate-600 text-lg font-medium">
            Learning Management System
          </p>
        </div>

        {/* Certificate Title */}
        <div className="text-center mb-8">
          <h2 className="text-5xl font-bold text-slate-800 mb-4 tracking-wider">
            CERTIFICATE
          </h2>
          <h3 className="text-2xl text-slate-600 font-light tracking-wide">
            OF COMPLETION
          </h3>
          <div className="w-32 h-1 bg-gradient-to-r from-blue-600 to-purple-600 mx-auto mt-4 rounded-full"></div>
        </div>

        {/* Certificate Body */}
        <div className="text-center mb-8 space-y-6">
          <p className="text-lg text-slate-700 leading-relaxed">
            This is to certify that
          </p>

          {/* Student Name */}
          <div className="my-8">
            <h4 className="text-4xl font-bold text-slate-800 mb-2 tracking-wide border-b-2 border-slate-300 pb-2 inline-block">
              {studentName}
            </h4>
          </div>

          <p className="text-lg text-slate-700 leading-relaxed max-w-2xl mx-auto">
            has successfully completed the course
          </p>

          {/* Course Name */}
          <div className="my-8">
            <h5 className="text-2xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent italic">
              "{courseName}"
            </h5>
          </div>

          <p className="text-lg text-slate-700">
            and has demonstrated the knowledge and skills required for course
            completion.
          </p>
        </div>

        {/* Footer Information */}
        <div className="flex justify-between items-end mt-12 pt-8 border-t border-slate-300">
          {/* Date */}
          <div className="text-left">
            <div className="mb-2">
              <p className="text-slate-600 text-sm font-medium">Date Issued</p>
              <p className="text-slate-800 font-semibold text-lg">
                {formatDate(completionDate)}
              </p>
            </div>
          </div>

          {/* Instructor Signature */}
          <div className="text-center">
            <div className="mb-4">
              <div className="w-48 h-0.5 bg-slate-400 mb-2"></div>
              <p className="text-slate-800 font-semibold text-lg">
                {instructorName}
              </p>
              <p className="text-slate-600 text-sm">Course Instructor</p>
            </div>
          </div>

          {/* Certificate ID */}
          <div className="text-right">
            <p className="text-slate-600 text-sm font-medium">Certificate ID</p>
            <p className="text-slate-800 font-mono text-sm bg-slate-100 px-2 py-1 rounded">
              {certificateId}
            </p>
          </div>
        </div>

        {/* Verification Footer */}
        <div className="text-center mt-8 pt-6 border-t border-slate-200">
          <div className="inline-flex items-center space-x-2 text-slate-500 text-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
            <span>
              This certificate is digitally signed and verified by Skillify LMS
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Certificate;
