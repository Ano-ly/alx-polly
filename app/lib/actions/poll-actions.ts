"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Creates a new poll in the database.
 * This is a Next.js Server Action, allowing direct invocation from client components.
 *
 * @param formData - A FormData object containing the poll question and options.
 *                   Expected fields: 'question' (string) and 'options' (array of strings).
 * @returns A promise that resolves to an object indicating success or an error message.
 *          Returns `{ error: null }` on successful poll creation, or `{ error: string }`
 *          if validation fails or a database error occurs.
 * @why Centralizes poll creation logic on the server, ensuring data integrity and security.
 *      Leverages Server Actions for efficient form submission without client-side API routes.
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  // Filter out any empty strings from the options array to ensure valid options.
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Validate input: ensure a question is provided and at least two options exist.
  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get the current authenticated user from the session.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    // Handle cases where user authentication fails or session is invalid.
    return { error: userError.message };
  }
  if (!user) {
    // Ensure only logged-in users can create polls.
    return { error: "You must be logged in to create a poll." };
  }

  // Insert the new poll into the 'polls' table.
  const { error } = await supabase.from("polls").insert([
    {
      user_id: user.id,
      question,
      options,
    },
  ]);

  if (error) {
    // Handle any database insertion errors.
    return { error: error.message };
  }

  // Revalidate the '/polls' path to reflect the new poll immediately.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Retrieves all polls created by the current authenticated user.
 * This function runs on the server and fetches data directly from Supabase.
 *
 * @returns A promise that resolves to an object containing the user's polls or an error message.
 *          Returns `{ polls: Poll[], error: null }` on success, or `{ polls: [], error: string }`
 *          if authentication fails or a database error occurs.
 * @why Provides a dedicated server-side function to fetch user-specific poll data,
 *      optimizing data retrieval for the user dashboard and ensuring data privacy.
 */
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // If no user is authenticated, return an empty array and an error.
  if (!user) return { polls: [], error: "Not authenticated" };

  // Fetch polls associated with the current user ID, ordered by creation date.
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  // Return fetched polls, defaulting to an empty array if no data is found.
  return { polls: data ?? [], error: null };
}

/**
 * Retrieves a single poll by its ID.
 * This function runs on the server and fetches data directly from Supabase.
 *
 * @param id - The unique identifier of the poll.
 * @returns A promise that resolves to an object containing the poll data or an error message.
 *          Returns `{ poll: Poll, error: null }` on success, or `{ poll: null, error: string }`
 *          if the poll is not found or a database error occurs.
 * @why Enables server-side fetching of individual poll details, crucial for displaying
 *      poll pages and ensuring that only valid poll data is accessed.
 */
export async function getPollById(id: string) {
  const supabase = await createClient();
  // Fetch a single poll matching the provided ID.
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single(); // Use .single() to expect exactly one row.

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

/**
 * Submits a vote for a specific poll option.
 * This is a Next.js Server Action.
 *
 * @param pollId - The ID of the poll being voted on.
 * @param optionIndex - The index of the chosen option (0-based).
 * @returns A promise that resolves to an object indicating success or an error message.
 *          Returns `{ error: null }` on successful vote submission, or `{ error: string }`
 *          if a database error occurs.
 * @why Handles the voting process securely on the server, preventing client-side manipulation
 *      of vote counts and ensuring that votes are correctly recorded in the database.
 */
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Optionally require login to vote. Uncomment the line below if voting should be restricted to authenticated users.
  // if (!user) return { error: 'You must be logged in to vote.' };

  // Insert the vote record into the 'votes' table.
  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null, // Record user ID if authenticated, otherwise null for anonymous votes.
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}

/**
 * Deletes a poll from the database.
 * This is a Next.js Server Action.
 *
 * @param id - The ID of the poll to be deleted.
 * @returns A promise that resolves to an object indicating success or an error message.
 *          Returns `{ error: null }` on successful deletion, or `{ error: string }`
 *          if a database error occurs.
 * @why Provides a server-side mechanism for poll owners to remove their polls,
 *      ensuring that deletion is handled securely and consistently.
 */
export async function deletePoll(id: string) {
  const supabase = await createClient();
  // Delete the poll matching the provided ID.
  const { error } = await supabase.from("polls").delete().eq("id", id);
  if (error) return { error: error.message };
  // Revalidate the '/polls' path to reflect the deletion immediately.
  revalidatePath("/polls");
  return { error: null };
}

/**
 * Updates an existing poll in the database.
 * This is a Next.js Server Action.
 *
 * @param pollId - The ID of the poll to be updated.
 * @param formData - A FormData object containing the updated poll question and options.
 *                   Expected fields: 'question' (string) and 'options' (array of strings).
 * @returns A promise that resolves to an object indicating success or an error message.
 *          Returns `{ error: null }` on successful poll update, or `{ error: string }`
 *          if validation fails, authentication fails, or a database error occurs.
 * @why Allows poll owners to modify their polls securely on the server, ensuring
 *      that updates are validated and only authorized users can make changes.
 */
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  // Filter out any empty strings from the options array.
  const options = formData.getAll("options").filter(Boolean) as string[];

  // Validate input: ensure a question is provided and at least two options exist.
  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get the current authenticated user from the session.
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    // Handle cases where user authentication fails or session is invalid.
    return { error: userError.message };
  }
  if (!user) {
    // Ensure only logged-in users can update polls.
    return { error: "You must be logged in to update a poll." };
  }

  // Update the poll, ensuring that only the owner can modify it.
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId)
    .eq("user_id", user.id); // Crucial for ensuring ownership before update.

  if (error) {
    // Handle any database update errors.
    return { error: error.message };
  }

  return { error: null };
}
