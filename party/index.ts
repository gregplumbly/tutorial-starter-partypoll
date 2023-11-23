import type * as Party from "partykit/server";
import type { Poll } from "@/app/types";
import type { HereMessage } from "./shared";

export default class Server implements Party.Server {
  constructor(readonly party: Party.Party) {}

  poll: Poll | undefined;

  async onRequest(req: Party.Request) {
    if (req.method === "POST") {
      const poll = (await req.json()) as Poll;
      console.log("Poll received", poll);
      this.poll = { ...poll, score: poll.options.map(() => 0), guesses: [] };

      this.savePoll();
      console.log("New poll created", this.poll);
    }

    if (this.poll) {
      return new Response(JSON.stringify(this.poll), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response("Not found", { status: 404 });
  }

  async onMessage(message: string) {
    if (!this.poll) return;

    console.log("Message received", message);

    const event = JSON.parse(message);
    if (event.type === "vote") {
      this.poll.votes![event.option] += 1;
      this.party.broadcast(JSON.stringify(this.poll));
      this.savePoll();
    } else if (event.type === "guess") {
      // Handle guess here
      const guessedNumber = event.guessedNumber;
      console.log("Guess received:", guessedNumber);
      this.poll.guesses.push(guessedNumber);
      console.log("Broadcasting guess to all clients", this.poll);
      this.party.broadcast(JSON.stringify(this.poll));
      this.savePoll();
    }
  }

  async savePoll() {
    if (this.poll) {
      await this.party.storage.put<Poll>("poll", this.poll);
    }
  }

  async onStart() {
    this.poll = await this.party.storage.get<Poll>("poll");
  }

  async onConnect(connection: Party.Connection, ctx: Party.ConnectionContext) {
    // Also broadcast the number of connections currently here
    // Used by the ConnectionStatus badge
    const hereMsg = <HereMessage>{
      type: "here",
      connections: Array.from(this.party.getConnections()).length,
    };
    this.party.broadcast(JSON.stringify(hereMsg), []);
  }
}

Server satisfies Party.Worker;
