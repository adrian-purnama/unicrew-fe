import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";

const CTAButtons = () => {
  const [showRegisterOptions, setShowRegisterOptions] = useState(false);
  const containerRef = useRef(null);

  // Close options on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showRegisterOptions &&
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setShowRegisterOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showRegisterOptions]);

  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  return (
    <div
      ref={containerRef}
      role="group"
      aria-label="Call to Action buttons"
      className="flex flex-col sm:flex-row gap-6 justify-center mt-6"
    >
      <AnimatePresence mode="wait">
        {!showRegisterOptions ? (
          <motion.div
            key="main"
            className="flex flex-col sm:flex-row gap-6"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              aria-expanded={showRegisterOptions}
              aria-controls="register-options"
              onClick={() => setShowRegisterOptions(true)}
              className="px-8 py-3 bg-primary text-white font-semibold rounded-full shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/70 focus-visible:ring-offset-2 transition-transform cursor-pointer text-lg hover:bg-primary/90"
            >
              📝 Register
            </button>

            <Link
              to="/user"
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-full shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600 focus-visible:ring-offset-2 cursor-pointer text-lg hover:from-blue-700 hover:to-blue-800"
            >
              🔍 Explore Jobs
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="register-options"
            id="register-options"
            className="flex flex-col sm:flex-row gap-6"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={{ duration: 0.3 }}
          >
            <Link
              to="/auth/user/register"
              onClick={() => setShowRegisterOptions(false)}
              className="px-8 py-3 bg-primary text-white font-semibold rounded-full shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/70 focus-visible:ring-offset-2 cursor-pointer text-lg hover:bg-primary/90"
            >
              👩‍🎓 Register as Student
            </Link>

            <Link
              to="/auth/company/register"
              onClick={() => setShowRegisterOptions(false)}
              className="px-8 py-3 bg-purple-600 text-white font-semibold rounded-full shadow-md focus:outline-none focus-visible:ring-4 focus-visible:ring-purple-600 focus-visible:ring-offset-2 cursor-pointer text-lg hover:bg-purple-700"
            >
              🏢 Register as Company
            </Link>

            <button
              type="button"
              onClick={() => setShowRegisterOptions(false)}
              className="px-8 py-3 bg-gray-300 text-gray-800 font-semibold rounded-full shadow focus:outline-none focus-visible:ring-4 focus-visible:ring-gray-400 focus-visible:ring-offset-2 transition-colors cursor-pointer text-lg hover:bg-gray-400"
            >
              Cancel
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CTAButtons;
