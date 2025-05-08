import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import { connect } from 'mongoose';
import User from '../../../models/user';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connect(process.env.MONGODB_URI!);
    const user = await User.findOne({ email: session.user.email })
      .populate('followers', '_id username profilepic')
      .populate('following', '_id username profilepic');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // After successful 2FA verification, update isVerified status
    const isVerified = user.twoFactorEnabled && user.twoFactorSecret;

    return NextResponse.json({
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        profilepic: user.profilepic,
        bio: user.bio,
        interests: user.interests || [],
        hasSetUsername: user.hasSetUsername,
        isVerified,
        twoFactorEnabled: user.twoFactorEnabled || false,
        followers: user.followers || [],
        following: user.following || [],
        followersCount: user.followers?.length || 0,
        followingCount: user.following?.length || 0,
        notificationPreferences: user.notificationPreferences || {
          newFollower: true,
          followingPost: true
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { username, bio, interests, removeProfilePic, notificationPreferences } = data;

    await connect(process.env.MONGODB_URI!);
    const currentUser = await User.findOne({ email: session.user.email });

    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Username validation
    if (username && username !== currentUser.username) {
      if (currentUser.hasSetUsername) {
        return NextResponse.json(
          { error: 'Username can only be set once' },
          { status: 400 }
        );
      }

      if (username.length < 3 || username.length > 30) {
        return NextResponse.json(
          { error: 'Username must be between 3 and 30 characters' },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({
        username,
        email: { $ne: session.user.email }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'Username is already taken' },
          { status: 400 }
        );
      }
    }

    // Bio validation
    if (bio) {
      if (bio.length < 10) {
        return NextResponse.json(
          { error: 'Bio must be at least 10 characters long' },
          { status: 400 }
        );
      }
      if (bio.length > 500) {
        return NextResponse.json(
          { error: 'Bio cannot exceed 500 characters' },
          { status: 400 }
        );
      }
    }

    // Interests validation
    if (interests && (!Array.isArray(interests) || interests.length > 5)) {
      return NextResponse.json(
        { error: 'You can select up to 5 interests' },
        { status: 400 }
      );
    }

    const updateData: any = {
      $set: {
        ...(typeof bio === 'string' && { bio }),
        ...(notificationPreferences && { notificationPreferences }),
        interests: interests || [],
        updatedAt: new Date()
      }
    };

    if (username && username !== currentUser.username && !currentUser.hasSetUsername) {
      updateData.$set.username = username;
      updateData.$set.hasSetUsername = true;
    }

    if (removeProfilePic) {
      updateData.$set.profilepic = '/default-avatar.png';
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: session.user.email },
      updateData,
      { new: true }
    ).populate('followers').populate('following');

    const isVerified = updatedUser.twoFactorEnabled && updatedUser.twoFactorSecret;

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilepic: updatedUser.profilepic,
        bio: updatedUser.bio,
        interests: updatedUser.interests || [],
        hasSetUsername: updatedUser.hasSetUsername,
        isVerified,
        twoFactorEnabled: updatedUser.twoFactorEnabled || false,
        followers: updatedUser.followers || [],
        following: updatedUser.following || [],
        followersCount: updatedUser.followers?.length || 0,
        followingCount: updatedUser.following?.length || 0,
        notificationPreferences: updatedUser.notificationPreferences || {
          newFollower: true,
          followingPost: true
        }
      }
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { error: 'Failed to update user profile' },
      { status: 500 }
    );
  }
}