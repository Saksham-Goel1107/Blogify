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
    const { commentId } = await request.json();
    
    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const comment = commentId 
      ? post.comments.id(commentId)
      : post;

    if (!comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      );
    }

    const userLikeIndex = comment.likes.indexOf(session.user.id);
    
    if (userLikeIndex === -1) {
      comment.likes.push(session.user.id);
    } else {
      comment.likes.splice(userLikeIndex, 1);
    }

    await post.save();
    
    return NextResponse.json({
      likes: comment.likes.length,
      isLiked: userLikeIndex === -1
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
