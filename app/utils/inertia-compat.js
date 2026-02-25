// Compatibility layer for Inertia components in Next.js
import NextLink from "next/link";
import { useState } from "react";

// Mock Head component
export const Head = ({ title, children }) => {
  if (typeof window !== 'undefined') {
    document.title = title || document.title;
  }
  return null;
};

// Mock Link component that uses Next.js Link
export const Link = ({ href, method, data, ...props }) => {
  return <NextLink href={href} {...props} />;
};

// Mock useForm hook  
export const useForm = (initialData = {}) => {
  const [data, setData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  return {
    data,
    setData,
    errors,
    setError: (field, message) => setErrors(prev => ({ ...prev, [field]: message })),
    clearErrors: () => setErrors({}),
    processing,
    post: (url, options = {}) => {
      setProcessing(true);
      // Mock post - just navigate or call onSuccess if provided
      if (options.onSuccess) options.onSuccess();
      setProcessing(false);
    },
    put: (url, options = {}) => {
      setProcessing(true);
      if (options.onSuccess) options.onSuccess();
      setProcessing(false);
    },
    reset: () => setData(initialData),
  };
};

// Mock router object
export const router = {
  get: (url, data = {}, options = {}) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  },
  post: (url, data = {}, options = {}) => {
    if (typeof window !== 'undefined') {
      window.location.href = url;
    }
  },
};
