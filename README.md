# Blogify - AI-Powered Blogging Platform

![Blogify Logo](blogify/public/icon.png)

Blogify is a modern, feature-rich blogging platform built with Next.js and enhanced with AI capabilities through Google's Gemini AI integration. It provides a seamless writing experience with real-time AI assistance, user authentication, and interactive features.

## 🌟 Features

- **AI-Powered Writing Assistance**
  - Real-time content suggestions using Gemini AI
  - Voice-to-text capabilities
  - Smart content enhancement tools

- **User Management**
  - Secure authentication with multiple providers
  - Profile customization with avatars
  - Interest-based user categorization
  - Email verification system

- **Blog Management**
  - Rich text editor for post creation
  - Comments and likes functionality
  - Post reporting system
  - Real-time updates

- **Modern UI/UX**
  - Dark/Light mode support
  - Responsive design
  - Geist font integration
  - Smooth transitions and animations

- **Security Features**
  - Secure password handling
  - Protected API routes

## 🚀 Tech Stack

- **Frontend**
  - Next.js 14+
  - TypeScript
  - TailwindCSS
  - React
  - FontAwesome Icons

- **Backend**
  - MongoDB
  - Next.js API Routes
  - Google Gemini AI API

- **Authentication**
  - NextAuth.js
  - Multiple OAuth providers
  - Email/Password authentication

- **Additional Tools**
  - Redis for caching
  - Cloudinary for image storage
  - Google reCAPTCHA

## 📦 Installation

1. Clone the repository:
```powershell
git clone https://github.com/Saksham-goel1107/blogify.git
cd blogify
```

2. Install dependencies:
```powershell
pnpm install
```

3. Set up environment variables:
Create a `.env.local` file with the following variables:
```env
# Database
MONGODB_URI=your_mongodb_uri

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth Providers
GOOGLE_ID=your_google_client_id
GOOGLE_SECRET=your_google_client_secret

# AI Integration
GEMINI_API_KEY=your_gemini_api_key

# Image Upload
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

```

4. Run the development server:
```powershell
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Project Structure

- `/app` - Next.js app directory containing routes and components
  - `/actions` - Server actions and database connections
  - `/api` - API routes for various functionalities
  - `/components` - Reusable React components
  - `/models` - MongoDB schema definitions
  - `/utils` - Utility functions and helpers

## 🔒 Security Features

- Protected API routes with authentication checks
- Input validation and sanitization
- CSRF protection through NextAuth.js
- Rate limiting on sensitive endpoints
- Secure password hashing
- Protection against disposable email domains

## 🎨 Customization

### Theme Configuration
The app supports both light and dark modes, customizable through the DarkMode context provider.

### Font Configuration
Using Geist and Geist Mono fonts from Google Fonts, configurable in `layout.tsx`.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository.

## 🌟 Acknowledgments

- Next.js team for the amazing framework
- Google for the Gemini AI API
- All contributors and supporters of the project