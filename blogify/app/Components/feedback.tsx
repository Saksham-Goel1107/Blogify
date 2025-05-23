"use client";
import { useState, useEffect } from "react";
import { useTheme } from "../actions/DarkMode";

const Feedback = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"success" | "error" | null>(
    null
  );
  const [errorMessage, setErrorMessage] = useState("");
  const [charactersLeft, setCharactersLeft] = useState(200);
  const { darkMode } = useTheme();

  useEffect(() => {
    setCharactersLeft(200 - comments.length);
  }, [comments]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (rating === 0) {
      setSubmitStatus("error");
      setErrorMessage("Please select a rating before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stars: rating, comments }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setRating(0);
        setComments("");
        setHover(0);
        window.dispatchEvent(new Event("feedback-submitted"));
      } else {
        const data = await response.json();
        setSubmitStatus("error");
        setErrorMessage(
          response.status === 429
            ? "You've reached the limit of 2 feedback submissions per day. Please try again tomorrow."
            : data.error || "Failed to submit feedback"
        );
      }
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage("An unexpected error occurred. Please try again later.");
      console.error("Error submitting feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
    return (
      <div
        className={`w-full max-w-2xl mx-auto p-6 ${
          darkMode ? "bg-gray-900" : "bg-gray-100"
        } rounded-xl shadow-lg transition-all`}
      >
        <div className="text-green-500 text-center p-4 animate-fade-in">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-xl font-bold mb-2">Thank you for your feedback!</p>
          <p className="text-gray-400 mb-4">
            Your input helps us improve our product
          </p>
          <button
            onClick={() => setSubmitStatus(null)}
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-semibold transition-colors cursor-pointer"
          >
            Submit another feedback
          </button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={`w-full max-w-2xl mx-auto p-6 ${
        darkMode ? "bg-gray-900" : "bg-white"
      } rounded-xl shadow-lg transition-all`}
    >
      <h2
        className={`text-2xl font-bold mb-2 text-center ${
          darkMode ? "text-white" : "text-gray-900"
        }`}
      >
        Share your feedback
      </h2>
      <p className="text-center text-gray-500 text-sm mb-6">
        Help us improve by rating your experience
      </p>

      <div className="flex justify-center space-x-2 text-3xl mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`transition-all duration-200 transform ${
              hover >= star
                ? "text-yellow-400 scale-110"
                : rating >= star
                ? "text-yellow-400"
                : "text-gray-400"
            }`}
          >
            ★
          </button>
        ))}
      </div>

      {rating > 0 && (
        <div className="text-center mb-4 text-blue-500 font-medium">
          {["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1]}
        </div>
      )}

      <textarea
        value={comments}
        onChange={(e) => setComments(e.target.value.slice(0, 200))}
        placeholder="Tell us what you think about our product..."
        className={`w-full h-28 resize-none p-3 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all
    ${
      darkMode
        ? "bg-gray-800 text-white placeholder-gray-400"
        : "bg-gray-100 text-gray-800 placeholder-gray-500"
    }`}
        required
        minLength={5}
      />

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-3 rounded-md font-semibold transition-colors cursor-pointer disabled:cursor-not-allowed ${
          isSubmitting
            ? "bg-blue-800 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin mr-2 h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Submitting...
          </span>
        ) : (
          "Submit Feedback"
        )}
      </button>

      {submitStatus === "error" && (
        <div className="text-red-500 text-sm text-center mt-3 font-medium max-w-md mx-auto">
          {errorMessage ||
            "There was a problem submitting your feedback. Please try again."}
        </div>
      )}
    </form>
  );
};

export default Feedback;
