import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '../../../models/user';
import { connect } from 'mongoose';

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { fcmToken } = await request.json();
        
        if (!fcmToken) {
            return NextResponse.json(
                { error: 'FCM token is required' },
                { status: 400 }
            );
        }

        await connect(process.env.MONGODB_URI!);
        
        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            { fcmToken },
            { new: true }
        );

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({
            message: 'FCM token updated successfully'
        });
    } catch (error) {
        console.error('FCM token update error:', error);
        return NextResponse.json(
            { error: 'Failed to update FCM token' },
            { status: 500 }
        );
    }
}
