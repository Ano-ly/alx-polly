import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getUserPolls } from '@/app/lib/actions/poll-actions';
import PollActions from './PollActions'; 

/**
 * Renders the user's dashboard page, displaying a list of polls created by the authenticated user.
 * This is a Next.js Server Component, meaning it fetches data directly on the server
 * before rendering, reducing client-side JavaScript and improving performance.
 *
 * @returns A React component that displays the user's polls or a message if no polls are found.
 * @why This component is a Server Component to efficiently fetch user-specific poll data
 *      from Supabase using `getUserPolls` server action. This approach ensures that
 *      data is ready before the page is sent to the client, providing a faster initial load
 *      and better SEO. It also centralizes data fetching logic on the server for security.
 */
export default async function PollsPage() {
  // Fetch polls created by the current user using a server action.
  const { polls, error } = await getUserPolls();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Polls</h1>
        <Button asChild>
          <Link href="/create">Create New Poll</Link>
        </Button>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Conditionally render polls if they exist, otherwise display a message to create one. */}
        {polls && polls.length > 0 ? (
          polls.map((poll) => <PollActions key={poll.id} poll={poll} />)
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center col-span-full">
            <h2 className="text-xl font-semibold mb-2">No polls yet</h2>
            <p className="text-slate-500 mb-6">Create your first poll to get started</p>
            <Button asChild>
              <Link href="/create">Create New Poll</Link>
            </Button>
          </div>
        )}
      </div>
      {/* Display any error messages that occurred during poll fetching. */}
      {error && <div className="text-red-500">{error}</div>}
    </div>
  );
}