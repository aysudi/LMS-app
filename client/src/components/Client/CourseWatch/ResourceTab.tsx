type Props = {
  resource: {
    name: string;
    type: string;
    url: string;
  };
  index: number;
};

const ResourceTab = ({ resource, index }: Props) => {
  return (
    <div
      key={index}
      className="bg-gray-700 p-4 rounded-lg hover:bg-gray-600 transition-colors"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
              resource.type === "pdf"
                ? "bg-red-500"
                : resource.type === "zip"
                ? "bg-yellow-500"
                : resource.type === "doc"
                ? "bg-blue-500"
                : "bg-gray-500"
            }`}
          >
            {resource.type === "pdf"
              ? "PDF"
              : resource.type === "zip"
              ? "ZIP"
              : resource.type === "doc"
              ? "DOC"
              : "FILE"}
          </div>
          <div>
            <h4 className="font-semibold text-white">{resource.name}</h4>
            <p className="text-sm text-gray-400 capitalize">
              {resource.type} file
            </p>
          </div>
        </div>
        <a
          href={resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
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
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <span>Download</span>
        </a>
      </div>
    </div>
  );
};

export default ResourceTab;
