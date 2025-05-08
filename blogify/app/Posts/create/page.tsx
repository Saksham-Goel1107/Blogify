"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { useTheme } from '../../actions/DarkMode';

const categories = [
  'AI', 'Web Development', 'Mobile Development', 'DevOps',
  'Data Science', 'Cybersecurity', 'Blockchain', 'Cloud Computing',
  'Machine Learning', 'Programming Languages', 'Software Engineering', 'Other'
];

export default function CreatePost() {
  const { darkMode } = useTheme();
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
  });
  const [media, setMedia] = useState<{ file: File; preview: string; type: 'image' | 'video' | 'pdf' }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;    const newMedia = await Promise.all(
      Array.from(files).map(async (file) => {
        let type: 'image' | 'video' | 'pdf';
        if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type.startsWith('video/')) {
          type = 'video';
        } else if (file.type === 'application/pdf') {
          type = 'pdf';
        } else {
          throw new Error('Unsupported file type');
        }

        return {
          file,
          preview: type === 'pdf' ? '/pdf-icon.png' : URL.createObjectURL(file),
          type,
        };
      })
    );

    setMedia([...media, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setError('');

      // Upload media files first
      const mediaUrls = await Promise.all(
        media.map(async (m) => {
          const formData = new FormData();
          formData.append('file', m.file);
          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          const data = await res.json();
          return {
            url: data.url,
            type: m.type,
          };
        })
      );      // Create post
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          content: formData.content.trim(),
          category: formData.category,
          tags: formData.tags.split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0),
          media: mediaUrls.filter(m => m.url && m.type),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to create post');
      }

      const post = await res.json();
      router.push(`/Posts/${post.slug}`);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className={`max-w-4xl mx-auto px-6 py-12 transition-all ${darkMode ? 'text-gray-100 bg-gray-900' : 'text-gray-800 bg-gray-50'} rounded-3xl shadow-2xl`}>
  <h1 className="text-4xl font-extrabold mb-10 text-center tracking-tight">
    ✨ Create a New Post
  </h1>

  <form onSubmit={handleSubmit} className="space-y-10">
    {/* Title */}
    <div>
      <label htmlFor="title" className="block text-sm font-semibold mb-2">
        Title
      </label>
      <input
        type="text"
        id="title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className={`w-full px-5 py-3 rounded-2xl border text-sm shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200 ${
          darkMode
            ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
        }`}
        placeholder="Write a beautiful title..."
        required
      />
    </div>

    {/* Category */}
    <div>
      <label htmlFor="category" className="block text-sm font-semibold mb-2">
        Category
      </label>
      <select
        id="category"
        value={formData.category}
        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        className={`w-full px-5 py-3 rounded-2xl border text-sm shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none transition ${
          darkMode
            ? 'bg-gray-800 border-gray-700 text-gray-100'
            : 'bg-white border-gray-300 text-gray-900'
        }`}
        required
      >
        <option value="">Select a category</option>
        {categories.map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>

    {/* Tags */}
    <div>
      <label htmlFor="tags" className="block text-sm font-semibold mb-2">
        Tags <span className="text-xs text-gray-400">(comma-separated)</span>
      </label>
      <input
        type="text"
        id="tags"
        value={formData.tags}
        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
        placeholder="e.g. javascript, react, web dev"
        className={`w-full px-5 py-3 rounded-2xl border text-sm shadow-md focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          darkMode
            ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder-gray-500'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
        }`}
      />
    </div>

    {/* Media Upload */}
    <div>
      <label className="block text-sm font-semibold mb-3">Upload Media</label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {media.map((m, index) => (
          <div key={index} className="relative aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-600">            {m.type === 'video' ? (
              <video 
                src={m.preview} 
                className="w-full h-full object-cover" 
                controls 
                title="Preview of uploaded video"
              />
            ) : (
              <Image 
                src={m.preview} 
                alt={m.type === 'pdf' ? 'Preview of uploaded PDF document' : 'Preview of uploaded image'} 
                fill 
                className="object-cover"
                priority
              />
            )}
            <button
              type="button"
              onClick={() => removeMedia(index)}
              className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 shadow"
              title="Remove"
            >
              <X size={16} />
            </button>
          </div>
        ))}
        <label
          className={`relative aspect-video flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:shadow-lg transition ${
            darkMode ? 'border-gray-600 hover:border-blue-500' : 'border-gray-300 hover:border-blue-500'
          }`}
        >
          <input
            type="file"
            onChange={handleMediaSelect}
            accept="image/*,video/*,application/pdf"
            className="hidden"
            multiple
          />
          <ImagePlus className={`w-8 h-8 mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Upload Image, Video, or PDF
          </span>
        </label>
      </div>
    </div>

    {/* Content */}
    <div>
      <label htmlFor="content" className="block text-sm font-semibold mb-2">
        Content
      </label>
      <textarea
        id="content"
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
        rows={10}
        placeholder="What's on your mind? ✨"
        className={`w-full px-5 py-3 rounded-2xl border shadow-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none ${
          darkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-300 text-gray-900'
        }`}
        required
      />
    </div>

    {error && (
      <div className="text-red-500 text-sm font-medium">{error}</div>
    )}

    {/* Buttons */}
    <div className="flex justify-between items-center mt-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="text-sm text-gray-400 hover:text-gray-200 hover:underline transition"
      >
        ← Cancel
      </button>

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="animate-spin" size={20} />
            Creating...
          </>
        ) : (
          'Create Post'
        )}
      </button>
    </div>
  </form>
</div>

  );
}