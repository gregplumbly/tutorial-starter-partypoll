import { notFound } from "next/navigation";
import { PARTYKIT_URL } from "@/app/env";
import type { Poll } from "@/app/types";
import Balloon from "@/components/Balloon";
import { SelectFootballers } from "@/components/SelectFootballers";
import GameUpdates from "@/components/GameUpdates";
import ConnectionStatus from "@/components/ConnectionStatus";

export default async function PollPage({
  params,
}: {
  params: { poll_id: string };
}) {
  const pollId = params.poll_id;

  const req = await fetch(`${PARTYKIT_URL}/party/${pollId}`, {
    method: "GET",
    next: {
      revalidate: 0,
    },
  });

  if (!req.ok) {
    if (req.status === 404) {
      notFound();
    } else {
      throw new Error("Something went wrong.");
    }
  }

  const poll = (await req.json()) as Poll;

  console.log(poll);

  const handleGuess = () => {
    // TODO: Implement the logic to handle the guess
    const guessedNumber = 42; // This is a hardcoded guess, replace with actual user input
    console.log(`User guessed: ${guessedNumber}`);
    // Compare guessedNumber with poll.targetNumber and handle the result
  };

  return (
    <>
      <div className="flex flex-col space-y-4 items-center">
        <ConnectionStatus />
        <GameUpdates pollId={pollId} />

        <h1 className="text-2xl font-bold">{poll?.title}</h1>
        <p className="text-lg">All time premiership goals</p>
        <h2 className="text-xl">{poll?.targetNumber}</h2>
        <SelectFootballers pollId={pollId} />
      </div>
      <Balloon float />
    </>
  );
}
