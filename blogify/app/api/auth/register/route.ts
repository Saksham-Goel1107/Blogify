import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '../../../actions/connectDB';
import userModel from '../../../models/user';
import zxcvbn from 'zxcvbn';
import { isDisposableEmail } from '../../../utils/emailValidator';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const email = body?.email?.trim();
    const password = body?.password;    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await userModel.findOne({
      $or: [{ email }],
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error:
             'User with this email already exists'
        },
        { status: 400 }
      );
    }

    if (isDisposableEmail(email)) {
      return NextResponse.json(
        { error: 'Disposable email addresses are not allowed' },
        { status: 400 }
      );
    }

    const result = zxcvbn(password);
    if (result.score < 3) {
      return NextResponse.json(
        { error: 'Password is too weak. Please choose a stronger one.' },
        { status: 400 }
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      email,
      password: hashedPassword,
      provider: 'credentials',
      hasSetUsername: false,
    });

    await newUser.save();

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method Not Allowed' }, { status: 405 });
}
