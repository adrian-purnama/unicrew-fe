import React, { useState } from "react";
import toast from "react-hot-toast";

export default function ReviewForm({ application, onSubmit, onCancel }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }
    onSubmit(application._id, rating, comment);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-primary-20 rounded-lg border border-primary">
        <div className="w-12 h-12 bg-gradient-to-r from-primary to-highlight rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
          {application.user.fullName.charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 className="font-semibold text-color">{application.user.fullName}</h3>
          <p className="text-sm text-gray">{application.user.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray mb-3">How would you rate this candidate?</label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className={`text-3xl transition-all duration-200 hover:scale-110 ${star <= (hoveredRating || rating) ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}`}
              >
                ★
              </button>
            ))}
            <span className="ml-3 text-sm text-gray">
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Very Good"}
              {rating === 5 && "Excellent"}
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray mb-2">Review Comments</label>
          <textarea className="w-full border border-gray rounded-lg px-4 py-3 text-color bg-color-1 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none" rows="4" placeholder="Share your experience working with this candidate (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
          <p className="text-xs text-gray mt-1">This review will help other employers make informed decisions.</p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium transition-all duration-200">Cancel</button>
          <button type="submit" className="btn-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-200">Submit Review</button>
        </div>
      </form>
    </div>
  );
}
