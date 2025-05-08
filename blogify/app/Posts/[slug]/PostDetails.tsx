"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Heart, MessageCircle, Share2, Flag, MoreHorizontal } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  _id: string;
  content: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  likes: string[];
  replies: Comment[];
  createdAt: string;
}

interface PostDetailsProps {
  post: {
    _id: string;
    title: string;
    content: string;
    category: string;
    media: { url: string; type: 'image' | 'video' | 'pdf' }[];
    author: {
      id: string;
      name: string;
      image: string;
    };
    likes: string[];
    comments: Comment[];
    createdAt: string;
    tags: string[];
  };
  session: any;
}

export default function PostDetails({ post, session }: PostDetailsProps) {
  const [isLiked, setIsLiked] = useState(post.likes.includes(session?.user?.id));
  const [likesCount, setLikesCount] = useState(post.likes.length);
  const [comment, setComment] = useState('');
  const [replyTo, setReplyTo] = useState<{ id: string; author: string } | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleLike = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/posts/${post._id}/like`, {
        method: 'POST',
      });
      const data = await response.json();
      setIsLiked(data.isLiked);
      setLikesCount(data.likes);
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !comment.trim()) return;

    try {
      const response = await fetch(`/api/posts/${post._id}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment,
          parentCommentId: replyTo?.id,
        }),
      });
      
      if (response.ok) {
        setComment('');
        setReplyTo(null);
        // Refresh the page to show new comment
        window.location.reload();
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  const handleReport = async () => {
    if (!session || !reportReason.trim()) return;

    try {
      await fetch(`/api/posts/${post._id}/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reason: reportReason }),
      });
      setShowReportModal(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting post:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Author Info */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/profile/${post.author.id}`} className="flex items-center gap-3">
          <Image
            src={post.author.image || '/default-avatar.png'}
            alt={post.author.name}
            width={48}
            height={48}
            className="rounded-full"
          />
          <div>
            <h3 className="font-semibold text-gray-200">{post.author.name}</h3>
            <p className="text-sm text-gray-400">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>
        <button
          onClick={() => setShowReportModal(true)}
          className="text-gray-400 hover:text-red-500"
        >
          <Flag size={20} />
        </button>
      </div>

      {/* Post Content */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-100">{post.title}</h1>
        
        {/* Media Gallery */}
        {post.media && post.media.length > 0 && (
          <div className="grid gap-4 my-6">
            {post.media.map((media, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden">
                {media.type === 'video' ? (
                  <video
                    src={media.url}
                    controls
                    className="w-full h-full object-cover"
                  />
                ) : media.type === 'pdf' ? (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <a 
                      href={media.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-blue-500 hover:text-blue-400"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <span>View PDF</span>
                    </a>
                  </div>
                ) : (
                  <Image
                    src={media.url}
                    alt={`Post image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="prose prose-invert max-w-none">
          {post.content}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 pt-4">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/Posts?tag=${tag}`}
              className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm hover:bg-gray-700"
            >
              #{tag}
            </Link>
          ))}
        </div>

        {/* Interaction Buttons */}
        <div className="flex items-center gap-6 py-4 border-t border-gray-800">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 ${
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={isLiked ? 'fill-current' : ''} size={24} />
            <span>{likesCount}</span>
          </button>
          <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500">
            <MessageCircle size={24} />
            <span>{post.comments.length}</span>
          </button>
          <button className="text-gray-400 hover:text-green-500">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-200 mb-4">Comments</h2>
        
        {/* Comment Form */}
        {session ? (
          <form onSubmit={handleComment} className="mb-8">
            {replyTo && (
              <div className="flex items-center gap-2 mb-2 text-sm text-gray-400">
                Replying to {replyTo.author}
                <button
                  onClick={() => setReplyTo(null)}
                  className="text-gray-500 hover:text-gray-300"
                >
                  ×
                </button>
              </div>
            )}
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
            <button
              type="submit"
              className="mt-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={!comment.trim()}
            >
              Post Comment
            </button>
          </form>
        ) : (
          <p className="text-gray-400 mb-8">
            Please <Link href="/login" className="text-blue-500 hover:underline">sign in</Link> to comment
          </p>
        )}

        {/* Comments List */}
        <div className="space-y-6">
          {post.comments.map((comment) => (
            <div key={comment._id} className="space-y-4">
              {/* Comment */}
              <div className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <Link href={`/profile/${comment.author.id}`} className="flex items-center gap-2">
                    <Image
                      src={comment.author.image || '/default-avatar.png'}
                      alt={comment.author.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                    <span className="font-medium text-gray-200">{comment.author.name}</span>
                  </Link>
                  <button className="text-gray-400 hover:text-gray-300">
                    <MoreHorizontal size={20} />
                  </button>
                </div>
                <p className="text-gray-300">{comment.content}</p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <button className="text-gray-400 hover:text-red-500">
                    Like ({comment.likes.length})
                  </button>
                  <button
                    onClick={() => setReplyTo({ id: comment._id, author: comment.author.name })}
                    className="text-gray-400 hover:text-blue-500"
                  >
                    Reply
                  </button>
                </div>
              </div>

              {/* Replies */}
              {comment.replies.length > 0 && (
                <div className="ml-8 space-y-4">
                  {comment.replies.map((reply) => (
                    <div key={reply._id} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Link href={`/profile/${reply.author.id}`} className="flex items-center gap-2">
                          <Image
                            src={reply.author.image || '/default-avatar.png'}
                            alt={reply.author.name}
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                          <span className="font-medium text-gray-200">{reply.author.name}</span>
                        </Link>
                      </div>
                      <p className="text-gray-300">{reply.content}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <button className="text-gray-400 hover:text-red-500">
                          Like ({reply.likes.length})
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-semibold text-gray-200 mb-4">Report Post</h3>
            <textarea
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Why are you reporting this post?"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={4}
            />
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleReport}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                disabled={!reportReason.trim()}
              >
                Submit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
