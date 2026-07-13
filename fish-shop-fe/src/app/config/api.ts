const getApiUrl = () => {
  if (typeof window === "undefined") {
    return process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:8083";
};

const RAW_API_URL = getApiUrl();

export const API_URL = RAW_API_URL.replace(/\/api\/?$/, "");