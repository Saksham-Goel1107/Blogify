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
    const { content, parentCommentId } = await request.json();
    
    const post = await Post.findById(params.postId);
    if (!post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const newComment = {
      content,
      author: session.user.id,
      createdAt: new Date(),
      likes: [],
      replies: [],
      reports: []
    };

    if (parentCommentId) {
      const parentComment = post.comments.id(parentCommentId);
      if (!parentComment) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
      parentComment.replies.push(newComment);
    } else {
      post.comments.push(newComment);
    }

    await post.save();
    
    // Populate the author details
    const populatedPost = await Post.findById(post._id)
      .populate('comments.author', 'name image')
      .populate('comments.replies.author', 'name image');

    return NextResponse.json(
      parentCommentId 
        ? populatedPost.comments.id(parentCommentId)
        : populatedPost.comments[populatedPost.comments.length - 1]
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to add comment' },
      { status: 500 }
    );
  }
}
