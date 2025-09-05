'use client';

import { useState } from 'react';
import { updatePoll } from '@/app/lib/actions/poll-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

/**
 * EditPollForm component for editing existing polls.
 * This is a Client Component because it uses `useState` for managing form input
 * and dynamic option fields, and `setTimeout` for redirection.
 *
 * It interacts with the `updatePoll` Server Action to submit the updated form data.
 *
 * @param {Object} props - The component props.
 * @param {any} props.poll - The poll object to be edited, containing its current question and options.
 * @returns A React component that renders a form for editing an existing poll.
 * @why This component is a Client Component to provide interactive form elements,
 *      such as dynamically adding/removing poll options and immediate feedback
 *      to the user (e.g., error messages, success messages, and redirection).
 *      The actual poll update logic is offloaded to a Server Action for security
 *      and to minimize client-side bundle size.
 */
export default function EditPollForm({ poll }: { poll: any }) {
  // State to manage the poll question, initialized with the current poll's question.
  const [question, setQuestion] = useState(poll.question);
  // State to manage the poll options, initialized with the current poll's options.
  const [options, setOptions] = useState<string[]>(poll.options || []);
  // State to store any error messages from the server action.
  const [error, setError] = useState<string | null>(null);
  // State to indicate if the poll update was successful.
  const [success, setSuccess] = useState(false);

  /**
   * Handles changes to an individual poll option input field.
   * @param idx - The index of the option being changed.
   * @param value - The new value of the option.
   */
  const handleOptionChange = (idx: number, value: string) => {
    setOptions((opts) => opts.map((opt, i) => (i === idx ? value : opt)));
  };

  /**
   * Adds a new empty option field to the poll.
   */
  const addOption = () => setOptions((opts) => [...opts, '']);

  /**
   * Removes an option field from the poll.
   * Ensures that at least two options remain.
   * @param idx - The index of the option to be removed.
   */
  const removeOption = (idx: number) => {
    // Only allow removal if there are more than two options.
    if (options.length > 2) {
      setOptions((opts) => opts.filter((_, i) => i !== idx));
    }
  };

  return (
    <form
      // The `action` prop directly calls the `updatePoll` Server Action.
      action={async (formData) => {
        // Clear previous error and success states.
        setError(null);
        setSuccess(false);
        // Manually set the question and options in the FormData object
        // as they are managed by local state in this Client Component.
        formData.set('question', question);
        formData.delete('options'); // Clear existing options to append updated ones.
        options.forEach((opt) => formData.append('options', opt));
        // Call the server action with the poll ID and updated form data.
        const res = await updatePoll(poll.id, formData);
        if (res?.error) {
          // If the server action returns an error, set the error state.
          setError(res.error);
        } else {
          // On success, set success state and redirect after a short delay.
          setSuccess(true);
          setTimeout(() => {
            window.location.href = '/polls';
          }, 1200);
        }
      }}
      className="space-y-6"
    >
      <div>
        <Label htmlFor="question">Poll Question</Label>
        <Input
          name="question"
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>
      <div>
        <Label>Options</Label>
        {options.map((opt, idx) => (
          <div key={idx} className="flex items-center gap-2 mb-2">
            <Input
              name="options"
              value={opt}
              onChange={(e) => handleOptionChange(idx, e.target.value)}
              required
            />
            {/* Only show remove button if there are more than two options. */}
            {options.length > 2 && (
              <Button type="button" variant="destructive" onClick={() => removeOption(idx)}>
                Remove
              </Button>
            )}
          </div>
        ))}
        <Button type="button" onClick={addOption} variant="secondary">
          Add Option
        </Button>
      </div>
      {/* Display error message if present. */}
      {error && <div className="text-red-500">{error}</div>}
      {/* Display success message if present. */}
      {success && <div className="text-green-600">Poll updated! Redirecting...</div>}
      <Button type="submit">Update Poll</Button>
    </form>
  );
}