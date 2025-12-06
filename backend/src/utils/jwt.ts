import jwt, { SignOptions } from 'jsonwebtoken';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN as string) || '1h'
  } as SignOptions);
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: (process.env.REFRESH_TOKEN_EXPIRES_IN as string) || '7d'
  } as SignOptions);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET!) as TokenPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET!) as { userId: string };
}
