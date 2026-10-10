import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { conflict, unauthorized } from '../lib/httpError.js';
import { serializeUser } from '../lib/serializers.js';
import { signToken } from '../middleware/auth.js';

const authResponse = (user) => ({ token: signToken(user), user: serializeUser(user) });

/** POST /api/auth/register - public sign-up always creates a USER (never an admin). */
export const register = async (req, res) => {
  const { name, email, password } = req.valid.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw conflict('An account with this email already exists');
  }

  const user = await prisma.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10), role: 'USER' },
  });

  res.status(201).json(authResponse(user));
};

/** POST /api/auth/login */
export const login = async (req, res) => {
  const { email, password } = req.valid.body;

  const user = await prisma.user.findUnique({ where: { email } });
  // Same message for unknown email and wrong password to avoid account enumeration.
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw unauthorized('Invalid email or password');
  }

  res.json(authResponse(user));
};

/** GET /api/auth/me - returns the currently authenticated user. */
export const me = async (req, res) => {
  res.json({ user: serializeUser(req.user) });
};
