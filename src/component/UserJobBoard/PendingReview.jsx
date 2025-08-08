import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import axiosInstance from "../../../utils/ApiHelper";
import BaseModal from "../../component/BaseModal";
import { Star, Building, User, Briefcase, Calendar } from "lucide-react";

export default function PendingReview() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedApplication, setSelectedApplication] = useState(null);

    useEffect(() => {
        axiosInstance
            .get("/company/pending-reviews")
            .then((res) => {setItems(res.data); console.log(res)})
            .catch((err) => {
                console.error(err);
                toast.error("Failed to load reviews");
            })
            .finally(() => setLoading(false));
    }, []);

    const handleReviewSubmit = async (applicationId, rating, comment) => {
        try {
            await axiosInstance.post("/company/review", {
                applicationId,
                rating,
                comment,
            });
            setItems((prev) => prev.filter(item => item._id !== applicationId));
            toast.success("Review submitted successfully! ⭐");
            setSelectedApplication(null);
        } catch (err) {
            console.error(err);
            toast.error("Failed to submit review");
        }
    };

    if (loading) {
        return (
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
    }

    if (items.length === 0) {
        return (
            <div className="bg-color-2 rounded-xl border border-gray p-12 text-center">
                <div className="text-4xl mb-4 animate-bounce">⭐</div>
                <h3 className="text-lg font-semibold text-color mb-2">No Pending Reviews</h3>
                <p className="text-gray">All reviews have been completed. Great job!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            {/* <div className="bg-gradient-to-r from-primary/20 to-transparent rounded-xl p-6 border border-primary/30">
                <h2 className="text-xl font-bold text-color mb-2">Pending Reviews</h2>
                <p className="text-gray">Please leave reviews for your completed job experiences to help the community.</p>
            </div> */}

            {/* Review Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                    <div 
                        key={item._id} 
                        className="bg-color-2 border border-gray rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-primary"
                    >
                        <div className="flex justify-between items-start">
                            <div className="flex-1">
                                {/* Job Info */}
                                <div className="mb-4">
                                    <h3 className="font-semibold text-lg text-color mb-2">
                                        {item.job?.title}
                                    </h3>
                                    <div className="space-y-1 text-sm text-gray">
                                        {item.counterpartyType === "Company" ? (
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4 text-primary" />
                                                <span>Review Company: <strong className="text-color">{item.company?.companyName || item.company?.name}</strong></span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary" />
                                                <span>Review Applicant: <strong className="text-color">{item.user?.fullName}</strong></span>
                                            </div>
                                        )}
                                        
                                        {item.completedDate && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-orange-500" />
                                                <span>Completed: {new Date(item.completedDate).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Reminder Badge */}
                                <div className="mb-4">
                                    <span className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-3 py-1.5 rounded-full font-medium">
                                        <Star className="w-3 h-3" />
                                        Awaiting review
                                    </span>
                                </div>

                                {/* Action Button */}
                                <button
                                    onClick={() => setSelectedApplication(item)}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 transform hover:scale-105 shadow-md hover:shadow-lg w-full justify-center"
                                >
                                    ⭐ Leave Review
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Review Modal */}
            {selectedApplication && (
                <BaseModal
                    isOpen={true}
                    onClose={() => setSelectedApplication(null)}
                    title="Write a Review"
                >
                    <ReviewForm
                        application={selectedApplication}
                        onSubmit={handleReviewSubmit}
                        onCancel={() => setSelectedApplication(null)}
                    />
                </BaseModal>
            )}
        </div>
    );
}

function ReviewForm({ application, onSubmit, onCancel }) {
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
            {/* Review Target Info */}
            <div className="flex items-center gap-4 p-4 bg-primary-20 rounded-lg border border-primary">
                <div className="w-12 h-12 bg-gradient-to-r from-primary to-highlight rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {application.counterpartyType === "Company" ? (
                        <Building className="w-6 h-6" />
                    ) : (
                        application.user?.fullName?.charAt(0).toUpperCase() || "?"
                    )}
                </div>
                <div>
                    <h3 className="font-semibold text-color">
                        {application.counterpartyType === "Company" 
                            ? application.company?.companyName || application.company?.name
                            : application.user?.fullName}
                    </h3>
                    <p className="text-sm text-gray">
                        {application.job?.title}
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray mb-3">
                        How would you rate your experience with {application.counterpartyType === "Company" ? `${application.company?.companyName || application.company?.name}` : `${application.user?.fullName}`}?
                    </label>
                    <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHoveredRating(star)}
                                onMouseLeave={() => setHoveredRating(0)}
                                className={`text-3xl transition-all duration-200 hover:scale-110 ${
                                    star <= (hoveredRating || rating) 
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
                        placeholder={`Share your experience ${application.counterpartyType === "Company" ? "working with this company" : "with this candidate"} (optional)`}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                    <p className="text-xs text-gray mt-1">
                        This review will help {application.counterpartyType === "Company" ? "other job seekers" : "other employers"} make informed decisions.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 font-medium transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary text-white font-medium shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        Submit Review
                    </button>
                </div>
            </form>
        </div>
    );
}