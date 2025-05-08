import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import userModel from '../../../models/user'
import connectDB from '../../../actions/connectDB'

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('Please provide NEXTAUTH_SECRET environment variable');
}

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || '',
      clientSecret: process.env.GOOGLE_SECRET ||'',
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID ||'',
      clientSecret: process.env.GITHUB_SECRET ||'',
    }),
  ],  callbacks: {
    async jwt({ token, user, account }: { token: any; user: any; account: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      try {
        await connectDB();
        const dbUser = await userModel.findOne({ email: token.email });
        if (dbUser) {
          session.user.id = dbUser._id.toString();
          session.user.email = dbUser.email;
          session.user.hasSetUsername = dbUser.hasSetUsername;
        }
        return session;
      } catch (error) {
        console.error('Session error:', error);
        return session;
      }
    },
    async signIn({ user, account }: { user: any; account: any }) {
      try {
        await connectDB();
        let dbUser = await userModel.findOne({ email: user.email });
        
        if (!dbUser) {
          dbUser = new userModel({ 
            email: user.email,
            provider: account.provider,
            hasSetUsername: false
          });
          await dbUser.save();
        }
        
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    }
  },
  pages: {
    signIn: '/Authlogin'
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }