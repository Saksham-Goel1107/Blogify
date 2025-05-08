import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import User from '../../../../models/user';
import { connect } from 'mongoose';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await connect(process.env.MONGODB_URI!);
        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const secret = authenticator.generateSecret();
        
        const otpAuthUrl = authenticator.keyuri(
            user.email,
            'Blogify',
            secret
        );

        const qrCode = await QRCode.toDataURL(otpAuthUrl);

        user.twoFactorSecret = secret;
        user.twoFactorQRCode = qrCode;
        await user.save();

        return NextResponse.json({
            qrCode,
            secret
        });
    } catch (error) {
        console.error('2FA setup error:', error);
        return NextResponse.json(
            { error: 'Failed to setup 2FA' },
            { status: 500 }
        );
    }
}
