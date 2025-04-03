import { useState, useEffect } from 'react';
import config from '../config';

function TruncatedText({ text, maxLength = 100 }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = text.length > maxLength;
  
  if (!shouldTruncate) return <span>{text}</span>;
  
  return (
    <div className="relative">
      <span>
        {isExpanded ? text : `${text.slice(0, maxLength)}...`}
      </span>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ml-2 text-xs text-blue-600 hover:text-blue-800"
      >
        {isExpanded ? 'Voir moins' : 'Voir plus'}
      </button>
    </div>
  );
}

function FeedbackDashboard() {
  const [feedback, setFeedback] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, positive (4-5), negative (1-2)
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, rating
  const { API_URL } = config;

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const response = await fetch(`${API_URL}/feedback/all`);
        if (!response.ok) throw new Error('Failed to fetch feedback');
        const data = await response.json();
        setFeedback(data);
      } catch (err) {
        console.error('Error fetching feedback:', err);
        setError('Failed to load feedback data');
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, [API_URL]);

  const filteredFeedback = feedback.filter(item => {
    if (filter === 'positive') return item.rating >= 4;
    if (filter === 'negative') return item.rating <= 2;
    return true;
  });

  const sortedFeedback = [...filteredFeedback].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.timestamp) - new Date(a.timestamp);
    if (sortBy === 'oldest') return new Date(a.timestamp) - new Date(b.timestamp);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );

  if (error) return (
    <div className="text-red-500 text-center p-4">
      {error}
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Feedback Dashboard</h1>
      
      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Feedback</option>
          <option value="positive">Positive (4-5 ★)</option>
          <option value="negative">Negative (1-2 ★)</option>
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating">By Rating</option>
        </select>
      </div>

      {/* Feedback Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-sm rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Query</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Response</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredFeedback.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${
                          i < item.rating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    {item.comment ? (
                      <TruncatedText text={item.comment} maxLength={50} />
                    ) : (
                      <span className="text-gray-400 italic">No comment</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    <TruncatedText text={item.query} maxLength={75} />
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-gray-900">
                    <TruncatedText text={item.response} maxLength={100} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredFeedback.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No feedback found matching the current filters.
        </div>
      )}
    </div>
  );
}

export default FeedbackDashboard; 