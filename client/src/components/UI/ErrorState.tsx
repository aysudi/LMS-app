import { FaExclamationTriangle } from "react-icons/fa";

interface ErrorStateProps {
  message: string;
}

const ErrorState = ({ message }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <FaExclamationTriangle className="text-red-500 text-4xl mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        Oops! Something went wrong
      </h3>
      <p className="text-gray-500">{message}</p>
    </div>
  );
};

export default ErrorState;
