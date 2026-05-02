import crypto from "crypto";

function readAdminTokenFromRequest(request) {
  const directHeaderToken = request.get("x-admin-token")?.trim();

  if (directHeaderToken) {
    return directHeaderToken;
  }

  const authorizationHeader = request.get("authorization")?.trim();

  if (!authorizationHeader || !authorizationHeader.toLowerCase().startsWith("bearer ")) {
    return "";
  }

  return authorizationHeader.slice(7).trim();
}

function tokensMatch(expectedToken, providedToken) {
  const expectedBuffer = Buffer.from(expectedToken);
  const providedBuffer = Buffer.from(providedToken);

  if (expectedBuffer.length !== providedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, providedBuffer);
}

export function requireAdminAccess(request, response, next) {
  const configuredAdminToken = process.env.ADMIN_DASHBOARD_TOKEN?.trim();

  if (!configuredAdminToken) {
    response.status(503).json({
      message: "Admin dashboard access is not configured on this server."
    });
    return;
  }

  const providedToken = readAdminTokenFromRequest(request);

  if (!providedToken || !tokensMatch(configuredAdminToken, providedToken)) {
    response.status(401).json({
      message: "Unauthorized admin access."
    });
    return;
  }

  next();
}