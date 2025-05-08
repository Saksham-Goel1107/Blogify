import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import connectDB from '../../actions/connectDB';
import Post from '../../models/post';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const category = searchParams.get('category');
    const tag = searchParams.get('tag');
    const author = searchParams.get('author');
    const search = searchParams.get('search');
    
    const query: any = { status: 'published' };
    
    if (category) query.category = category;
    if (tag) query.tags = tag;
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    const totalPosts = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .populate('author', 'name image')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
    
    return NextResponse.json({
      posts,
      currentPage: page,
      totalPages: Math.ceil(totalPosts / limit),
      totalPosts
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// Create a new post
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    await connectDB();
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.category) {
      return NextResponse.json(
        { error: 'Title, content, and category are required' },
        { status: 400 }
      );
    }

    // Validate category
    const validCategories = [
      'AI', 'Web Development', 'Mobile Development', 'DevOps', 
      'Data Science', 'Cybersecurity', 'Blockchain', 'Cloud Computing', 
      'Machine Learning', 'Programming Languages', 'Software Engineering', 'Other'
    ];
    
    if (!validCategories.includes(body.category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }

    // Create slug from title
    const baseSlug = body.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check if slug exists and append number if needed
    let slug = baseSlug;
    let counter = 1;
    while (await Post.exists({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Process tags
    const tags = Array.isArray(body.tags) 
      ? body.tags.map((tag: string) => tag.trim()).filter(Boolean)
      : [];

    // Create post
    const post = new Post({
      title: body.title,
      content: body.content,
      category: body.category,
      slug,
      tags,
      media: body.media || [],
      author: session.user.id,
      status: 'published'
    });
    
    await post.save();
    
    // Return the post with populated author
    const populatedPost = await Post.findById(post._id)
      .populate('author', 'name image');
    
    return NextResponse.json(populatedPost, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to create post' },
      { status: 500 }
    );
  }
}
