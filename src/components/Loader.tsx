"use client";

import { motion } from "framer-motion";

interface LoaderProps {
  size?: "small" | "medium" | "large";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loader({
  size = "medium",
  text,
  fullScreen = false,
  className = "",
}: LoaderProps) {
  const sizeMap = {
    small: "h-5 w-5",
    medium: "h-8 w-8",
    large: "h-12 w-12",
  };

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: { duration: 0.3 },
    },
  };

  const spinnerVariants = {
    animate: {
      rotate: 360,
      transition: {
        repeat: Infinity,
        duration: 1,
        ease: "linear",
      },
    },
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.7, 1, 0.7],
      transition: {
        repeat: Infinity,
        duration: 1.5,
      },
    },
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-50"
    : "flex flex-col items-center justify-center py-4";

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className={`${containerClasses} ${className}`}
    >
      <motion.div
        variants={spinnerVariants}
        animate="animate"
        className={`${sizeMap[size]} text-indigo-600`}
      >
        <svg
          className="animate-spin h-full w-full"
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
      </motion.div>
      <>
        {text && (
          <motion.p
            variants={pulseVariants}
            animate="animate"
            className="mt-3 text-sm text-gray-600 dark:text-gray-300"
          >
            {text}
          </motion.p>
        )}
      </>
    </motion.div>
  );
}
