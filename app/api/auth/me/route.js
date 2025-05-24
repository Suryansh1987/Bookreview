export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { db } from '../../db/db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import { verify } from 'jsonwebtoken';

export async function GET(req) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) return NextResponse.json({ error: 'No token provided' }, { status: 401 });

    const token = authHeader.split(' ')[1]; // Expect Bearer token
    if (!token) return NextResponse.json({ error: 'Invalid token' }, { status: 401 });

    let decoded;
    try {
      decoded = verify(token, process.env.JWT_SECRET);
    } catch {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;

    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      bio: users.bio,
      avatar: users.avatar,
      isAdmin: users.isAdmin,
      createdAt: users.createdAt,
    })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userResult[0]);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
