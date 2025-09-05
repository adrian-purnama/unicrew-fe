import { useEffect, useState } from "react";
import axiosInstance from "../../../utils/ApiHelper";
import toast from "react-hot-toast";
import BaseModal from "../../component/BaseModal";
import { MessageCircle, CheckCircle, Building, MapPin, Calendar, DollarSign } from "lucide-react";
import { emitApplicationsUpdated } from "../../../utils/appEvent";

const MODAL_GAP_MS = 200; // small delay to let the confirm modal close fully

export default function AcceptedJobs({ setActiveChatRoom }) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);

  // review state
  const [reviewApp, setReviewApp] = useState(null);
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchJobs = async () => {
    try {
      const res = await axiosInstance.get("/applicant/my-applications", {
        params: { status: "accepted" },
      });
      setJobs(res.data);
    } catch (err) {
      toast.error("Failed to fetch accepted jobs.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // End job, then open review modal
  const handleEnd = async () => {
    if (!selectedApp) return;
    const toastId = toast.loading("Ending job…");
    try {
      await axiosInstance.post("/applicant/application/end", {
        applicationId: selectedApp._id,
      });

      toast.success("Job ended successfully.", { id: toastId });
      emitApplicationsUpdated()

      // Remove from the list
      setJobs((prev) => prev.filter((j) => j._id !== selectedApp._id));

      // 1) Close the confirm modal
      const ended = selectedApp;
      setSelectedApp(null);

      // 2) Open the review modal after a tiny delay
      setTimeout(() => {
        setReviewApp(ended);
        setRating(5);
        setHovered(0);
        setComment("");
      }, MODAL_GAP_MS);
    } catch (err) {
      console.error(err);
      toast.error("Failed to end job.", { id: toastId });
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewApp || submittingReview) return;
    if (!rating) {
      toast.error("Please select a rating");
      return;
    }
    setSubmittingReview(true);
    const toastId = toast.loading("Submitting review…");
    try {
      await axiosInstance.post("/review/review", {
        applicationId: reviewApp._id,
        rating,
        comment,
      });
      toast.success("Review submitted. Thank you! ⭐", { id: toastId });
      setReviewApp(null);
      emitApplicationsUpdated()
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to submit review", {
        id: toastId,
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  // ------- Main content (no early return so modals always mount) -------
  let content = null;

  if (loading) {
    content = (
      <div className="bg-color-2 rounded-xl border border-gray p-6">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-gray rounded-lg p-4">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  } else if (jobs.length === 0) {
    content = (
      <div className="bg-color-2 rounded-xl border border-gray p-12 text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 opacity-30 mb-4" />
        <h3 className="text-lg font-semibold text-color mb-2">No Accepted Jobs</h3>
        <p className="text-gray">Your accepted job offers will appear here.</p>
      </div>
    );
  } else {
    content = (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map((item) => (
          <div
            key={item._id}
            className="bg-color-2 border border-gray p-6 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary group relative overflow-hidden"
          >
            {/* Success Badge */}
            <div className="absolute top-0 right-0 bg-green-500 text-white px-3 py-1 rounded-bl-lg text-xs font-medium">
              Accepted
            </div>

            {/* Job Info */}
            <div className="mb-4 pt-2">
              <h3 className="text-lg font-bold text-color mb-2 group-hover:text-primary transition-colors">
                {item.job?.title || "Untitled Job"}
              </h3>

              <div className="space-y-2 text-sm text-gray">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-primary" />
                  <span>{item.company?.name || "No company data"}</span>
                </div>

                {item.job?.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>
                      {item.job.location.kabupaten?.name},{" "}
                      {item.job.location.provinsi?.name}
                    </span>
                  </div>
                )}

                {item.job?.salaryRange && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="font-medium">
                      {item.job.salaryRange.currency}{" "}
                      {item.job.salaryRange.min?.toLocaleString()} -{" "}
                      {item.job.salaryRange.max?.toLocaleString()}
                    </span>
                  </div>
                )}

                {item.acceptedDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-orange-500" />
                    <span>
                      Accepted on {new Date(item.acceptedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray">
              <button
                onClick={() => {
                  if (!item.chatRoom?._id) {
                    toast.error("Chat not available.");
                    return;
                  }
                  setActiveChatRoom(item.chatRoom._id);
                }}
                className="btn-primary text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Message Employer
              </button>

              <button
                onClick={() => setSelectedApp(item)}
                className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-300 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
              >
                🔚 End Job
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {content}

      {/* Confirm End Modal (always mounted) */}
      <BaseModal isOpen={!!selectedApp} onClose={() => setSelectedApp(null)} title="End this job?">
        <div className="space-y-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
            <p className="text-sm text-yellow-800">
              <strong>⚠️ Warning:</strong> Are you sure you want to mark this job as
              ended? This action cannot be undone.
            </p>
          </div>

          {selectedApp && (
            <div className="bg-color-1 rounded-lg p-4 border border-gray">
              <h4 className="font-medium text-color mb-1">{selectedApp.job?.title}</h4>
              <p className="text-sm text-gray">{selectedApp.company?.name}</p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setSelectedApp(null)}
              className="px-4 py-2 text-sm rounded-lg border border-gray hover:bg-color-1 text-color font-medium transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handleEnd}
              className="px-4 py-2 text-sm rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-all shadow-md hover:shadow-lg"
            >
              Confirm End Job
            </button>
          </div>
        </div>
      </BaseModal>

      {/* Review Modal (always mounted) */}
      <BaseModal isOpen={!!reviewApp} onClose={() => setReviewApp(null)} title="Write a Review">
        {reviewApp && (
          <div className="space-y-6">
            {/* Who you’re reviewing */}
            <div className="flex items-center gap-4 p-4 bg-primary-20 rounded-lg border border-primary">
              <div className="w-12 h-12 bg-gradient-to-r from-primary to-highlight rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                <Building className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-color">
                  {reviewApp.company?.name || "Company"}
                </h3>
                <p className="text-sm text-gray">{reviewApp.job?.title}</p>
              </div>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray mb-3">
                Rate your experience with {reviewApp.company?.name || "this company"}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className={`text-3xl transition-all duration-200 hover:scale-110 ${
                      star <= (hovered || rating)
                        ? "text-yellow-400"
                        : "text-gray-300 hover:text-yellow-300"
                    }`}
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

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray mb-2">
                Review Comments
              </label>
              <textarea
                className="w-full border border-gray rounded-lg px-4 py-3 text-color bg-color-1 focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 resize-none"
                rows="4"
                placeholder="Share your experience (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray">
              <button
                type="button"
                onClick={() => setReviewApp(null)}
                className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200"
              >
                Maybe later
              </button>
              <button
                type="button"
                disabled={submittingReview}
                onClick={handleSubmitReview}
                className="btn-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-75"
              >
                {submittingReview ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </div>
        )}
      </BaseModal>
    </>
  );
}
