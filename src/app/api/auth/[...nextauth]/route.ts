import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import Restaurant from '@/lib/models/Restaurant';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            email: string;
            name: string;
        };
    }
}

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Please enter email and password');
                }

                await dbConnect();

                const restaurant = await Restaurant.findOne({ email: credentials.email });

                if (!restaurant) {
                    throw new Error('No restaurant found with this email');
                }

                const isPasswordValid = await bcrypt.compare(
                    credentials.password,
                    restaurant.password
                );

                if (!isPasswordValid) {
                    throw new Error('Invalid password');
                }

                return {
                    id: restaurant._id.toString(),
                    email: restaurant.email,
                    name: restaurant.name,
                };
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                session.user.id = token.id as string;
            }
            return session;
        },
    },
    pages: {
        signIn: '/auth/login',
    },
});

export { handler as GET, handler as POST };
