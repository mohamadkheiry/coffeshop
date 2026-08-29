import jwt from 'jsonwebtoken';

const COOKIE_NAME = 'cafe_seda_session';

function secret() {
  return process.env.JWT_SECRET || 'development-only-change-this-secret';
}

export function createToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    secret(),
    { expiresIn: '8h', issuer: 'cafe-seda' },
  );
}

export function setAuthCookie(response, token) {
  const secure = process.env.COOKIE_SECURE === undefined
    ? process.env.NODE_ENV === 'production'
    : process.env.COOKIE_SECURE === 'true';
  response.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure,
    maxAge: 8 * 60 * 60 * 1000,
    path: '/',
  });
}

export function clearAuthCookie(response) {
  response.clearCookie(COOKIE_NAME, { path: '/' });
}

export function requireAuth(request, response, next) {
  const token = request.cookies?.[COOKIE_NAME];
  if (!token) return response.status(401).json({ message: 'برای ادامه وارد پنل مدیریت شوید.' });
  try {
    request.user = jwt.verify(token, secret(), { issuer: 'cafe-seda' });
    return next();
  } catch {
    return response.status(401).json({ message: 'نشست شما منقضی شده است.' });
  }
}
