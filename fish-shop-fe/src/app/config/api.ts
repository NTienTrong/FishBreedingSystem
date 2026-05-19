const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export const API_URL = RAW_API_URL.replace(/\/api\/?$/, "");