import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_here'; // Use env var in production!

export function verifyToken(token: string) {
  try {
    // jwt.verify throws if invalid/expired
    const decoded = jwt.verify(token, JWT_SECRET);

    return decoded;
  } catch (error) {
    // Invalid token
    return null;
  }
}
