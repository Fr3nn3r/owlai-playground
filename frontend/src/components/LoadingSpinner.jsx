import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center">
      <div role="status" className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
    </div>
  );
};

export default LoadingSpinner; 