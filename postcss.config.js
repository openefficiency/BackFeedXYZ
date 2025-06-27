// PostCSS configuration
export default {
  plugins: {
    // Only include autoprefixer if available, skip tailwindcss
    ...((() => {
      try {
        require.resolve('autoprefixer');
        return { autoprefixer: {} };
      } catch {
        return {};
      }
    })()),
  },
}