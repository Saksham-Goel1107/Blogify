import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import User from '../../../models/user';
import { connect } from 'mongoose';

// Follow a user
export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await request.json();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        await connect(process.env.MONGODB_URI!);
        
        const currentUser = await User.findOne({ email: session.user.email });
        const userToFollow = await User.findById(userId);

        if (!currentUser || !userToFollow) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (currentUser._id.toString() === userId) {
            return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 });
        }

        if (currentUser.following.includes(userId)) {
            return NextResponse.json({ error: 'Already following this user' }, { status: 400 });
        }

        currentUser.following.push(userId);
        userToFollow.followers.push(currentUser._id);

        await currentUser.save();
        await userToFollow.save();        
        if (userToFollow.fcmToken && userToFollow.notificationPreferences?.newFollower) {
            try {
                const { sendNotification } = await import('../../../utils/firebase');
                await sendNotification(
                    userToFollow.fcmToken,
                    'New Follower',
                    `${currentUser.username || 'Someone'} started following you`
                );
            } catch (error) {
                console.error('Error sending notification:', error);
            }
        }return NextResponse.json({
            message: 'Successfully followed user',
            followersCount: userToFollow.followers.length,
            followingCount: currentUser.following.length
        });
    } catch (error) {
        console.error('Follow error:', error);
        return NextResponse.json(
            { error: 'Failed to follow user' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await request.json();
        
        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required' },
                { status: 400 }
            );
        }

        await connect(process.env.MONGODB_URI!);
        
        const currentUser = await User.findOne({ email: session.user.email });
        const userToUnfollow = await User.findById(userId);

        if (!currentUser || !userToUnfollow) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        if (!currentUser.following.includes(userId)) {
            return NextResponse.json({ error: 'Not following this user' }, { status: 400 });
        }

        currentUser.following = currentUser.following.filter((id: string) => id.toString() !== userId);
        userToUnfollow.followers = userToUnfollow.followers.filter((id:string) => id.toString() !== currentUser._id.toString());

        await currentUser.save();
        await userToUnfollow.save();

        return NextResponse.json({
            message: 'Successfully unfollowed user'
        });
    } catch (error) {
        console.error('Unfollow error:', error);
        return NextResponse.json(
            { error: 'Failed to unfollow user' },
            { status: 500 }
        );
    }
}
