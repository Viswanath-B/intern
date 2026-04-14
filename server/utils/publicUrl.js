export function buildPublicFileUrl(request, fileName) {
  const publicBaseUrl = process.env.PUBLIC_BASE_URL?.replace(/\/$/, "");

  if (publicBaseUrl) {
    return `${publicBaseUrl}/uploads/${encodeURIComponent(fileName)}`;
  }

  const protocol = (request.get("x-forwarded-proto") || request.protocol || "http").split(",")[0].trim();
  const host = request.get("host");

  return `${protocol}://${host}/uploads/${encodeURIComponent(fileName)}`;
}
