export const isAndroidUserAgent = (userAgent: string) => {
  return /android/i.test(userAgent);
};
