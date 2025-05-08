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

    // Search posts
    if (type === 'all' || type === 'posts') {
      const posts = await Post.find({
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { content: { $regex: query, $options: 'i' } },
          { tags: { $regex: query, $options: 'i' } }
        ]
      })
      .select('title category slug')
      .limit(5);

      results.push({
        type: 'Posts',
        items: posts.map(post => ({
          id: post._id,
          title: post.title,
          category: post.category,
          slug: post.slug,
          type: 'post'
        }))
      });
    }

    // Search users
    if (type === 'all' || type === 'people') {
      const users = await User.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } }
        ]
      })
      .select('name email image')
      .limit(5);

      results.push({
        type: 'People',
        items: users.map(user => ({
          id: user._id,
          title: user.name,
          subtitle: user.email,
          image: user.image,
          type: 'user'
        }))
      });
    }

    // Search topics/categories
    if (type === 'all' || type === 'topics') {
      const categories: string[] = ['Technology', 'Health', 'Science', 'Education', 'Travel']; // Example categories
      const topics = categories.filter((cat: string) => 
        cat.toLowerCase().includes(query.toLowerCase())
      ).map((cat: string) => ({
        id: cat,
        title: cat,
        type: 'topic'
      }));

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
