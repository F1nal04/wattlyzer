import { execSync } from "node:child_process";
import type { NextConfig } from "next";

function getCommitSha(): string {
  const shaFromEnv =
    process.env.NEXT_PUBLIC_COMMIT_SHA ||
    process.env.COMMIT_REF ||
    process.env.GITHUB_SHA ||
    process.env.VERCEL_GIT_COMMIT_SHA;

  if (shaFromEnv) {
    return shaFromEnv.slice(0, 12);
  }

  try {
    return execSync("git rev-parse --short=12 HEAD", {
      encoding: "utf8",
    }).trim();
  } catch {
    return "unknown";
  }
}

const nextConfig: NextConfig = {
  reactCompiler: true,
  env: {
    NEXT_PUBLIC_COMMIT_SHA: getCommitSha(),
  },
};

export default nextConfig;
