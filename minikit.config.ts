const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  "accountAssociation": {
    "header": "eyJmaWQiOjQxMTEyNiwidHlwZSI6ImF1dGgiLCJrZXkiOiIweDY1MGYzYzAwOUJFZDAwRTMzRTM5REUwM2NENEFDQTZlYjM0MGZEOGEifQ",
    "payload": "eyJkb21haW4iOiJ3YXJwLXJvdWxldHRlLnZlcmNlbC5hcHAifQ",
    "signature": "tyhqgfb0CqaBIGovIZfqRj4SgtvVsIIjARYkJBrTBc5n6l2uIFcqG6P4CM83EEbcoa00k3pQV+AXi9O4vawhjRw="
  },
  miniapp: {
    version: "1",
    name: "Warp Roulette", 
    subtitle: "Discover random profiles", 
    description: "Spin to make new friends!",
    screenshotUrls: [`${ROOT_URL}/logo.png`],
    iconUrl: `${ROOT_URL}/logo.png`,
    splashImageUrl: `${ROOT_URL}/logo.png`,
    splashBackgroundColor: "#000000",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "social",
    tags: ["friends", "social", "roulette", "casino"],
    heroImageUrl: `${ROOT_URL}/logo.png`, 
    tagline: "",
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: `${ROOT_URL}/logo.png`,
  },
} as const;

