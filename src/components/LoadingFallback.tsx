
import React from 'react';

const LoadingFallback = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-fitpath-gray">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fitpath-blue mx-auto mb-4"></div>
        <p className="text-gray-600">Loading FitPath AI...</p>
      </div>
    </div>
  );
};

export default LoadingFallback;
