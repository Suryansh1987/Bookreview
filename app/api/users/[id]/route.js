import { NextResponse } from 'next/server';
import { db } from '../../db/db';
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

// Dummy auth
async function authMiddleware(request) {
  const token = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!token) throw new Error('Unauthorized');
  return { id: 'user-id-from-token' };
}

function validateUpdateData(data) {
  const errors = [];
  if (data.name !== undefined) {
    if (typeof data.name !== 'string' || data.name.trim().length < 2) {
      errors.push({ field: 'name', message: 'Name must be at least 2 characters' });
    }
  }
  if (data.avatar !== undefined) {
    try {
      new URL(data.avatar);
    } catch {
      errors.push({ field: 'avatar', message: 'Avatar must be a valid URL' });
    }
  }
  if (data.newPassword !== undefined && typeof data.newPassword === 'string' && data.newPassword.length < 6) {
    errors.push({ field: 'newPassword', message: 'Password must be at least 6 characters' });
  }
  return errors;
}

// GET /api/users/:id
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const userResult = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      bio: users.bio,
      avatar: users.avatar,
      createdAt: users.createdAt
    })
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(userResult[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}


export async function PUT(request, { params }) {
  try {
    let user;
    try {
      user = await authMiddleware(request);
    } catch (e) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    if (id !== user.id) {
      return NextResponse.json({ message: 'You can only update your own profile' }, { status: 403 });
    }

    const body = await request.json();
    const errors = validateUpdateData(body);
    if (errors.length > 0) {
      return NextResponse.json({ errors }, { status: 400 });
    }

    const { name, bio, avatar, currentPassword, newPassword } = body;

    const userResult = await db.select().from(users).where(eq(users.id, id)).limit(1);

    if (!userResult.length) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const currentUser = userResult[0];
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (avatar !== undefined) updateData.avatar = avatar;

    if (currentPassword && newPassword) {
      const passwordValid = await bcrypt.compare(currentPassword, currentUser.password);
      if (!passwordValid) {
        return NextResponse.json({ message: 'Current password is incorrect' }, { status: 400 });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    } else if ((currentPassword && !newPassword) || (!currentPassword && newPassword)) {
      return NextResponse.json({ message: 'Both current and new password are required' }, { status: 400 });
    }

    const updatedUser = await db.update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        bio: users.bio,
        avatar: users.avatar,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      });

    return NextResponse.json(updatedUser[0]);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Server error' }, { status: 500 });
  }
}
