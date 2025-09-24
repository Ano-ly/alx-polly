"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Initialize JSDOM for DOMPurify
const window = new JSDOM("").window;
const purify = DOMPurify(window);

/**
 * Sanitizes a string to prevent XSS attacks.
 * @param {string} input - The string to sanitize.
 * @returns {string} The sanitized string.
 */
const sanitizeInput = (input: string): string => {
  return purify.sanitize(input);
};

/**
 * Server Action to create a new poll.
 * Handles form submission from the client, validates input, and inserts the poll into the database.
 *
 * @param {FormData} formData - The form data submitted by the client.
 * @returns {Promise<void>} - A promise that resolves when the poll is created and redirects the user.
 */
export async function createPoll(formData: FormData) {
  const supabase = await createClient();

  const question = sanitizeInput(formData.get("question") as string);
  const options = (formData.getAll("options") as string[])
    .filter((option) => option.trim() !== "")
    .map((option) => sanitizeInput(option));

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to create a poll." };
  }

  const { error } = await supabase
    .from("polls")
    .insert([{ user_id: user.id, question, options,}]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/polls");
  return { error: null };
}

/**
 * Server Action to get all polls created by the current user.
 * Fetches polls associated with the authenticated user's ID.
 *
 * @returns {Promise<Poll[] | null>} - A promise that resolves to an array of polls or null if an error occurs.
 */
export async function getUserPolls() {
  const supabase = await createClient();
  const {
    data: {
      user: {
        id: user_id
      }
    },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("user_id", user_id)
    .order("created_at", { ascending: false });

  if (error) return { polls: [], error: error.message };
  return { polls: data ?? [], error: null };
}

//GET POLL BY ID
export async function getPollById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("polls")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return { poll: null, error: error.message };
  return { poll: data, error: null };
}

//SUBMIT VOTE
export async function submitVote(pollId: string, optionIndex: number) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Optionally require login to vote
  // if (!user) return { error: 'You must be logged in to vote.' };

  const { error } = await supabase.from("votes").insert([
    {
      poll_id: pollId,
      user_id: user?.id ?? null,
      option_index: optionIndex,
    },
  ]);

  if (error) return { error: error.message };
  return { error: null };
}
// DELETE POLL
export async function deletePoll(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("polls").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/polls");
  return { error: null };
}

// UPDATE POLL
export async function updatePoll(pollId: string, formData: FormData) {
  const supabase = await createClient();

  const question = formData.get("question") as string;
  const options = formData.getAll("options").filter(Boolean) as string[];

  if (!question || options.length < 2) {
    return { error: "Please provide a question and at least two options." };
  }

  // Get user from session
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError) {
    return { error: userError.message };
  }
  if (!user) {
    return { error: "You must be logged in to update a poll." };
  }

  // Only allow updating polls owned by the user
  const { error } = await supabase
    .from("polls")
    .update({ question, options })
    .eq("id", pollId)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}
