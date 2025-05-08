import { getServerSession } from 'next-auth';
import { notFound } from 'next/navigation';
import Post from '../../models/post';
import connectDB from '../../actions/connectDB';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import PostDetails from './PostDetails';

interface Props {
  params: {
    slug: string;
  };
}

export default async function PostPage({ params }: Props) {
  await connectDB();
  const session = await getServerSession(authOptions);
  const slug = params.slug;
  const post = await Post.findOne({ slug })
    .populate('author', 'name image')
    .populate({
      path: 'comments',
      populate: [
        { path: 'author', select: 'name image' },
        {
          path: 'replies',
          populate: { path: 'author', select: 'name image' }
        }
      ]
    });

  if (!post) {
    notFound();
  }

  return <PostDetails post={post} session={session} />;
}
