import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '../../../../actions/connectDB';
import Post from '../../../../models/post';
import User from '../../../../models/user';

export async function POST(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    
    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const userSavedIndex = post.savedBy.indexOf(user._id);
    
    if (userSavedIndex === -1) {
      post.savedBy.push(user._id);
    } else {
      post.savedBy.splice(userSavedIndex, 1);
    }

    await post.save();
    
    return NextResponse.json({
      savedBy: post.savedBy.length,
      isSaved: userSavedIndex === -1
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to toggle save' },
      { status: 500 }
    );
  }
}
