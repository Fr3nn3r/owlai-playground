import { useState } from 'react';
import config from '../config';

function FeedbackComponent({ queryId, agentId, onFeedbackSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedComment, setSubmittedComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const { API_URL } = config;

  const handleRatingClick = async (selectedRating) => {
    setRating(selectedRating);
    if (isSubmitted && !isEditing) {
      // Start editing mode when clicking stars after submission
      setIsEditing(true);
      setComment(submittedComment); // Restore previous comment
    }
    setShowCommentBox(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query_id: queryId,
          agent_id: agentId,
          rating,
          comment: comment.trim() || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit feedback');
      }

      // Save the submitted feedback
      setSubmittedComment(comment.trim());
      setIsSubmitted(true);
      setShowCommentBox(false);
      setIsEditing(false);
      if (onFeedbackSubmitted) {
        onFeedbackSubmitted();
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (isEditing) {
      // Reset to previous submitted state
      setRating(rating);
      setComment(submittedComment);
      setShowCommentBox(false);
      setIsEditing(false);
    } else {
      // Reset everything
      setShowCommentBox(false);
      setRating(0);
      setComment('');
    }
  };

  return (
    <div className="mt-2 space-y-3">
      {/* Rating Stars */}
      <div className="flex items-center gap-1">
        <span className="text-sm text-gray-600 mr-2">
          {isSubmitted && !isEditing 
            ? 'Thank you for your feedback!' 
            : 'Was this response helpful?'}
        </span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => handleRatingClick(star)}
              className={`p-1 rounded-full transition-all duration-200 ${
                rating >= star
                  ? 'text-yellow-400 hover:text-yellow-500'
                  : 'text-gray-300 hover:text-gray-400'
              }`}
              disabled={isSubmitting}
            >
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Submitted Comment Display */}
      {isSubmitted && submittedComment && !isEditing && (
        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
          <p className="font-medium mb-1">Your comment:</p>
          <p className="italic">{submittedComment}</p>
        </div>
      )}

      {/* Comment Box - Shows after rating or when editing */}
      {(showCommentBox || isEditing) && (
        <div className="space-y-2">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Additional comments (optional)"
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows="2"
            disabled={isSubmitting}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || rating === 0}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Submitting...' : isEditing ? 'Update Feedback' : 'Submit Feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default FeedbackComponent; 