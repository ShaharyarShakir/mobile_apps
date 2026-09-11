const APP_ROOT = "/home/shaharyarshakir/01__git_repos/mobile_apps/tiny-com";

const config = {
  appRoot: APP_ROOT,
  appPath: `${APP_ROOT}/ios/build/TinyCompressor.app`,
  bundleId: "com.mytinyapps.tinycompressor",
  devices: ["pixel-10-pro"],
  locales: ["en-US"],
  appearance: "dark",

  android: {
    applicationId: "com.mytinyapps.tinycompressor",
    appPath: `${APP_ROOT}/android/app/build/outputs/apk/release/app-release.apk`,
  },

  frame: { variant: "17-pro-blue" },

  theme: {
    screenOnly: true,
    background: "linear-gradient(160deg, #0D1117 0%, #161B22 50%, #090D16 100%)",
    headlineColor: "#F0F6FC",
    subheadColor: "#8B949E",
    fontFamily: '-apple-system, "SF Pro Display", "Inter", system-ui, sans-serif',
    copyHeightRatio: 0.18,
    deviceWidthRatio: 0.90,
    layout: "classic",
  },

  store: {
    name: "Tiny Compressor",
    subtitle: { "en-US": "Fast Image & PDF Compression" },
    developer: "Tiny Apps",
    category: "Utilities",
    rating: 4.9,
    ratingCount: "3.4K Ratings",
    ageRating: "4+",
    price: "Free",
    description: {
      "en-US":
        "Compress photos and PDF documents securely on-device with zero data leaving your phone. Customize resolution from 4K down to 720p and reclaim up to 80% of storage space.",
    },
  },

  scenes: [
    {
      kind: "screenshot",
      id: "home",
      flow: "store-01-home",
      headline: { "en-US": "Shrink Files in Seconds" },
      subhead: { "en-US": "Lightning-fast image and PDF compression right on your device." },
    },
    {
      kind: "screenshot",
      id: "image-presets",
      flow: "store-02-presets",
      headline: { "en-US": "Smart Presets & Resizing" },
      subhead: { "en-US": "Select 4K, 2K, 1080p or custom quality presets with extreme space savings." },
    },
    {
      kind: "screenshot",
      id: "pdf-compress",
      flow: "store-03-pdf",
      headline: { "en-US": "Heavy PDFs Made Light" },
      subhead: { "en-US": "Reduce large documents and multipage PDFs for effortless sharing." },
    },
    {
      kind: "screenshot",
      id: "results-savings",
      flow: "store-04-results",
      headline: { "en-US": "Reclaim Up to 80% Storage" },
      subhead: { "en-US": "Instant before-and-after comparison with visual size reduction stats." },
    },
    {
      kind: "screenshot",
      id: "recent-history",
      flow: "store-05-recent",
      headline: { "en-US": "Track Space Reclaimed" },
      subhead: { "en-US": "Access, share, and review all your compressed files in one place." },
    },
    {
      kind: "preview",
      id: "preview",
      segments: [
        { id: "select", flow: "store-preview-01-select" },
        { id: "configure", flow: "store-preview-02-configure" },
        { id: "complete", flow: "store-preview-03-complete", holdSeconds: 3 },
      ],
    },
  ],
};

export default config;
