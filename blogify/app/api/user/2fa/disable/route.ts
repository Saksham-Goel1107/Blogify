import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import User from '../../../../models/user';
import { connect } from 'mongoose';
import { authenticator } from 'otplib';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { token } = await request.json();
        
        if (!token) {
            return NextResponse.json(
                { error: 'Token is required' },
                { status: 400 }
            );
        }

        await connect(process.env.MONGODB_URI!);
        const user = await User.findOne({ email: session.user.email });

        if (!user || !user.twoFactorSecret) {
            return NextResponse.json({ error: 'User not found or 2FA not setup' }, { status: 404 });
        }

        // Verify token
        const isValid = authenticator.verify({
            token,
            secret: user.twoFactorSecret
        });

        if (!isValid) {
            return NextResponse.json(
                { error: 'Invalid token' },
                { status: 400 }
            );
        }

        // Disable 2FA
        user.twoFactorEnabled = false;
        user.twoFactorSecret = undefined;
        user.twoFactorQRCode = undefined;
        await user.save();

        return NextResponse.json({
            message: '2FA disabled successfully'
        });
    } catch (error) {
        console.error('2FA disable error:', error);
        return NextResponse.json(
            { error: 'Failed to disable 2FA' },
            { status: 500 }
        );
    }
}
