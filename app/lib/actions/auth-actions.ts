'use server';

import { createClient } from '@/lib/supabase/server';
import { LoginFormData, RegisterFormData } from '../types';

/**
 * Handles user login by authenticating with Supabase.
 * This function is a Next.js Server Action, meaning it runs on the server
 * and can be directly called from client components or forms.
 *
 * @param data - An object containing the user's email and password.
 * @returns A promise that resolves to an object indicating success or an error message.
 *          Returns `{ error: null }` on successful login, or `{ error: string }` if
 *          authentication fails (e.g., invalid credentials, network issues).
 * @why This approach centralizes authentication logic on the server, enhancing security
 *      by preventing sensitive operations from being exposed on the client-side.
 *      It also leverages Next.js Server Actions for efficient data mutations.
 */
export async function login(data: LoginFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password,
  });

  if (error) {
    // If an error occurs during sign-in, return the error message.
    // This could be due to invalid credentials, user not found, etc.
    return { error: error.message };
  }

  // If no error, login was successful.
  return { error: null };
}

/**
 * Handles user registration by creating a new user in Supabase.
 * This function is a Next.js Server Action.
 *
 * @param data - An object containing the user's email, password, and name.
 * @returns A promise that resolves to an object indicating success or an error message.
 *          Returns `{ error: null }` on successful registration, or `{ error: string }` if
 *          registration fails (e.g., email already exists, invalid password format).
 * @why Similar to login, centralizing registration on the server improves security
 *      and utilizes Server Actions for robust data handling.
 */
export async function register(data: RegisterFormData) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
      },
    },
  });

  if (error) {
    // If an error occurs during sign-up, return the error message.
    // This might happen if the email is already in use or password requirements are not met.
    return { error: error.message };
  }

  // If no error, registration was successful.
  return { error: null };
}

/**
 * Handles user logout by signing out from Supabase.
 * This function is a Next.js Server Action.
 *
 * @returns A promise that resolves to an object indicating success or an error message.
 *          Returns `{ error: null }` on successful logout, or `{ error: string }` if
 *          logout fails (e.g., network issues, session invalidation).
 * @why Provides a secure and reliable way to terminate a user's session on the server.
 */
export async function logout() {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    // If an error occurs during sign-out, return the error message.
    return { error: error.message };
  }
  return { error: null };
}

/**
 * Retrieves the current authenticated user's information from Supabase.
 * This function runs on the server.
 *
 * @returns A promise that resolves to the user object if authenticated, otherwise null.
 * @why Used to determine the authentication state of the user in server components
 *      and protect routes or display user-specific content.
 */
export async function getCurrentUser() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
}

/**
 * Retrieves the current Supabase session information.
 * This function runs on the server.
 *
 * @returns A promise that resolves to the session object if a session exists, otherwise null.
 * @why Provides access to session details, which can be useful for various authentication
 *      and authorization checks across the application.
 */
export async function getSession() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}
