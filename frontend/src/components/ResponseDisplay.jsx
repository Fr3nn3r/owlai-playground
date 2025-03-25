import React from 'react';

const ResponseDisplay = ({ response }) => {
  if (!response) return null;

  return (
    <div className="mt-6">
      <div className="bg-gray-50 rounded-lg p-6 shadow-sm border border-gray-100">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="h-5 w-5 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h2 className="text-lg font-semibold text-gray-900">Response</h2>
        </div>
        <div className="prose prose-pink max-w-none">
          {response.split('\n').map((paragraph, index) => (
            <p key={index} className="text-gray-700 mb-4">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResponseDisplay;
