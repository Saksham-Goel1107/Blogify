import { NextRequest, NextResponse } from 'next/server';
import connectDB from '../../actions/connectDB';
import Post from '../../models/post';
import User from '../../models/user';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const type = searchParams.get('type') || 'all';

    if (query.length < 2) {
      return NextResponse.json({ suggestions: [] });
    }

    const results: { type: string; items: any[] }[] = [];    
    if (type === 'all' || type === 'users') {
      const users = await User.find({
        username: { $regex: query, $options: 'i' }
      })
      .select('username profilepic bio twoFactorEnabled twoFactorSecret followers following')
      .limit(5)
      .lean();

      results.push({
        type: 'Users',
        items: users.map(user => ({
          id: user._id,
          username: user.username,
          profilepic: user.profilepic,
          bio: user.bio?.length > 100 ? user.bio.substring(0, 100) + '...' : user.bio,
          isVerified: user.twoFactorEnabled && user.twoFactorSecret,
          followersCount: user.followers?.length || 0,
          followingCount: user.following?.length || 0,
          type: 'user'
        }))
      });
    }

    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      })
      .populate('author', 'username profilepic twoFactorEnabled twoFactorSecret')
      .select('title content category slug author createdAt')
      .limit(5)
      .lean();

      results.push({
        type: 'Posts',
        items: posts.map(post => ({
          id: post._id,
          title: post.title,
          preview: post.content.length > 100 
            ? post.content.substring(0, 100) + '...' 
            : post.content,
          category: post.category,
          slug: post.slug,
          author: {
            name: post.author.name,
            image: post.author.image
          },
          type: 'post'
        }))
      });
    }

    if (type === 'all' || type === 'people') {
      const users = await User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { username: { $regex: query, $options: 'i' } }
        ]
      })
      .select('name username image bio interests')
      .limit(5)
      .lean();

      results.push({
        type: 'People',
        items: users.map(user => ({
          id: user._id,
          title: user.name || user.username,
          subtitle: user.bio ? user.bio.substring(0, 60) + '...' : undefined,
          image: user.image || '/default-avatar.png',
          interests: user.interests,
          type: 'user'
        }))
      });
    }

    if (type === 'all' || type === 'users') {
      const users = await User.find({
        username: { $regex: query, $options: 'i' }
      })
      .select('username profilepic bio twoFactorEnabled twoFactorSecret')
      .limit(5)
      .lean();

      results.push({
        type: 'Users',
        items: users.map(user => ({
          id: user._id,
          username: user.username,
          profilepic: user.profilepic,
          bio: user.bio?.length > 100 ? user.bio.substring(0, 100) + '...' : user.bio,
          isVerified: user.twoFactorEnabled && user.twoFactorSecret,
          type: 'user'
        }))
      });
    }

    if (type === 'all' || type === 'topics') {
      const categories = await Post.distinct('category');
      
      const topics = categories
        .filter(cat => cat.toLowerCase().includes(query.toLowerCase()))
        .map(cat => ({
          id: cat,
          title: cat,
          type: 'topic',
          count: 0 
        }));

      for (const topic of topics) {
        topic.count = await Post.countDocuments({ category: topic.title });
      }

      results.push({
        type: 'Topics',
        items: topics.slice(0, 5)
      });
    }

    return NextResponse.json({ suggestions: results });
  } catch (error: any) {
    console.error('Search suggestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch suggestions' },
      { status: 500 }
    );
  }
}
