import { NextResponse } from 'next/server';
import { db } from '../../db/db'; 
import { users } from '../../db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';

export async function POST(req) {
  try {
    const json = await req.json();
    const { name, email, password } = json;

 
    if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 });
    if (!email || !email.includes('@')) return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
    if (!password || password.length < 6) return NextResponse.json({ error: 'Password min 6 chars' }, { status: 400 });


    const existingUser = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);

    if (existingUser.length) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.insert(users).values({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      isAdmin: false,
      createdAt: new Date(),
    }).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      isAdmin: users.isAdmin,
    });

    const token = jwt.sign(
      { id: newUser[0].id, isAdmin: newUser[0].isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({ token, user: newUser[0] }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
