const allowedImageHosts = (process.env.ALLOWED_IMAGE_HOSTS ?? "")
  .split(",")
  .map((entry) => entry.trim().toLowerCase())
  .filter(Boolean);

function isLocalAsset(src: string) {
  return src.startsWith("/");
}

function hasAllowedRemoteHost(src: string) {
  try {
    const url = new URL(src);
    return allowedImageHosts.includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function canUseOptimizedImage(src: string) {
  return isLocalAsset(src) || hasAllowedRemoteHost(src);
}
