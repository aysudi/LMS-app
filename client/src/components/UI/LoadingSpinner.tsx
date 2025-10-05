interface LoadingSpinnerProps {
  fullScreen?: boolean;
}

const LoadingSpinner = ({ fullScreen = false }: LoadingSpinnerProps) => {
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-indigo-600 border-t-transparent"></div>
    </div>
  );
};

export default LoadingSpinner;
