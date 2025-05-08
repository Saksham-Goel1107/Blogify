import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import connectDB from '../../../../actions/connectDB';
import Post from '../../../../models/post';

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
    const { reason, commentId } = await request.json();
    
    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const report = {
      userId: session.user.id,
      reason,
      createdAt: new Date()
    };

    if (commentId) {
      const comment = post.comments.id(commentId);
      if (!comment) {
        return NextResponse.json(
          { error: 'Comment not found' },
          { status: 404 }
        );
      }
      comment.reports.push(report);
    } else {
      post.reports.push(report);
    }

    await post.save();
    
    return NextResponse.json({
      message: 'Report submitted successfully'
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to submit report' },
      { status: 500 }
    );
  }
}
