import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import connectDB from '../../../actions/connectDB';
import Post from '../../../models/post';
import User from '../../../models/user';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();

    // Find the user to get their ID
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Find all posts that have been saved by this user
    const savedPosts = await Post.find({
      savedBy: user._id
    }).populate('author', 'name image')
      .sort({ createdAt: -1 });

    return NextResponse.json({ posts: savedPosts });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch saved posts' },
      { status: 500 }
    );
  }
}
