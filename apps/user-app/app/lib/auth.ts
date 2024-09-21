import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';
import bcrypt from 'bcrypt';
import db from '@repo/db/client'; // Replace with your actual database path

// Define a Zod schema to validate credentials
const credentialsSchema = z.object({
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  password: z.string(),
});

// Create a type for the credentials based on the schema
type Credentials = z.infer<typeof credentialsSchema>;

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        phone: { label: "Phone number", type: "text", placeholder: "1231231231", required: true },
        password: { label: "Password", type: "password", required: true }
      },

      // Authorize function with Zod validation and strong typing
      async authorize(credentials: Credentials | undefined) {
        // Validate the credentials using Zod
        const parsedCredentials = credentialsSchema.safeParse(credentials);
        if (!parsedCredentials.success) {
          throw new Error(parsedCredentials.error.errors.map(e => e.message).join(', '));
        }

        const { phone, password } = parsedCredentials.data;

        // Hash the provided password (this is optional based on your logic)
        const hashedPassword = await bcrypt.hash(password, 10);

        // Find existing user in the database
        const existingUser = await db.user.findFirst({
          where: { number: phone }
        });

        console.log(existingUser)
        if (existingUser) {
          // Compare password with hashed password
          const passwordValidation = await bcrypt.compare(password, existingUser.password);
          if (passwordValidation) {
            // Return user object on successful authorization
            return {
              id: existingUser.id.toString(),
              name: existingUser.name,
              email: existingUser.number
            };
          }
          return null; // Return null if password validation fails
        }

        // If no existing user, create a new one
        try {
          const newUser = await db.user.create({
            data: {
              number: phone,
              password: hashedPassword
            }
          });

          return {
            id: newUser.id.toString(),
            name: newUser.name,
            email: newUser.number
          };
        } catch (error) {
          console.error('Error creating user:', error);
          return null;
        }
      }
    })
  ],

    secret: process.env.JWT_SECRET || "secret",
    callbacks: {
        // TODO: can u fix the type here? Using any is bad
        async session({ token, session }: any) {
            session.user.id = token.sub

            return session
        }
    }
  }
  