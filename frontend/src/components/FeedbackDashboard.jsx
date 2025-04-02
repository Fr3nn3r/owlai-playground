import { useState, useEffect } from 'react';
import config from '../config';

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

      {/* Feedback Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedFeedback.map((item, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`${
                        i < item.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
              <span className="text-sm font-medium px-2 py-1 rounded-full bg-gray-100">
                {item.agent_id}
              </span>
            </div>
            
            <div className="mb-4">
              <div className="font-medium text-gray-700 mb-2">Query:</div>
              <div className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
                {item.query}
              </div>
            </div>

            <div className="mb-4">
              <div className="font-medium text-gray-700 mb-2">Response:</div>
              <div className="text-gray-600 bg-gray-50 p-3 rounded-lg text-sm">
                {item.response}
              </div>
            </div>

            {item.comment && (
              <div className="mb-4">
                <div className="font-medium text-gray-700 mb-2">Comment:</div>
                <div className="text-gray-600 italic">
                  "{item.comment}"
                </div>
              </div>
            )}

            {/* View Details Button */}
            <button
              onClick={() => window.open(`/query/${item.query_id}/logs`, '_blank')}
              className="mt-4 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              View Query Logs →
            </button>
          </div>
        ))}
      </div>

      {sortedFeedback.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          No feedback found matching the current filters.
        </div>
      )}
    </div>
  );
}

export default FeedbackDashboard; 