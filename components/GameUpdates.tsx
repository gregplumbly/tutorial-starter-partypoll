"use client";

import { useState, useEffect } from "react";
import { notFound } from "next/navigation";
import { PARTYKIT_URL, PARTYKIT_HOST } from "@/app/env";
import type { Poll } from "@/app/types";
import usePartySocket from "partysocket/react"; // Import the hook

interface GameUpdatesProps {
  pollId: string;
}

export default function GameUpdates({ pollId }: GameUpdatesProps) {
  console.log("GameUpdates", pollId);
  const [poll, setPoll] = useState<Poll | null>(null);

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: pollId,
    onMessage(event) {
      const message = JSON.parse(event.data);
      console.log("GameUpdates!!!", message);
      setPoll((currentPoll) => ({ ...currentPoll, ...message }));
    },
  });

  // ... rest of the component ...
  console.log("poll", poll);

  return (
    <div>
      {poll && poll.guesses && poll.guesses.length >= 1 && (
        <div className="animate-fadeIn duration-500">
          <h1>{poll.guesses.length} players have submitted a guess</h1>
          <h3>Latest Guess: {poll.guesses[poll.guesses.length - 1]}</h3>

          {/* Display other information from the poll as needed */}
        </div>
      )}
    </div>
  );
}
