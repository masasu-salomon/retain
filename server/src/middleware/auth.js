import jwt from 'jsonwebtoken';
import { env } from '../lib/env.js';
import { prisma } from '../lib/prisma.js';
import { forbidden, unauthorized } from '../lib/httpError.js';

export const signToken = (user) =>
  jwt.sign({ sub: user.id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

/**
 * Requires a valid "Authorization: Bearer <token>" header.
 * The user is re-loaded from the database on every request so that deleted
 * accounts or role changes take effect immediately.
 */
export const authenticate = async (req, _res, next) => {
  const header = req.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw unauthorized();
  }

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw unauthorized('Session expired or invalid. Please sign in again.');
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) {
    throw unauthorized('Account no longer exists');
  }

  req.user = user;
  next();
};

/** Restricts a route to users holding one of the given roles. Use after `authenticate`. */
export const requireRole =
  (...roles) =>
  (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw forbidden();
    }
    next();
  };
