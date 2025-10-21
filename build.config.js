// Build configuration for SaranOS
module.exports = {
  // Environment variables for build
  env: {
    NEXT_TELEMETRY_DISABLED: "1",
    NODE_ENV: process.env.NODE_ENV || "production",
    NEXT_PUBLIC_APP_NAME: "SaranOS",
    NEXT_PUBLIC_APP_VERSION: "2.0.0",
  },

  // Build optimization settings
  optimization: {
    // Disable telemetry during build
    telemetry: false,

    // Memory settings for large builds
    maxMemory: 4096,

    // Parallel processing
    parallel: true,
  },

  // Error handling
  onBuildError: (error) => {
    console.error("Build failed:", error.message);
    process.exit(1);
  },

  // Success callback
  onBuildSuccess: () => {
    console.log("✅ Build completed successfully");
  },
};
