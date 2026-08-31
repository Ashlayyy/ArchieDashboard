import { RequestHandler } from 'express';
import { auth } from 'express-oauth2-jwt-bearer';

export default function createAuthMiddleware(): RequestHandler {
  const audience = process.env.AUTH0_AUDIENCE;
  const domain = process.env.AUTH0_DOMAIN;
  const isProduction = process.env.NODE_ENV === 'production';

  if (!audience || !domain) {
    if (isProduction) {
      throw new Error('AUTH0_DOMAIN and AUTH0_AUDIENCE are required when NODE_ENV=production');
    }

    const skipAuth: RequestHandler = (_req, _res, next) => {
      next();
    };
    return skipAuth;
  }

  return auth({
    audience,
    issuerBaseURL: `https://${domain}/`,
    tokenSigningAlg: 'RS256'
  });
}
