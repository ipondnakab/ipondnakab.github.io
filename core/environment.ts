export const environment = {
  baseUrl:
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5002/kittipat-resume/us-central1/app",
  secretKey: process.env.NEXT_PUBLIC_SECRET_KEY || "secret-key",
};
