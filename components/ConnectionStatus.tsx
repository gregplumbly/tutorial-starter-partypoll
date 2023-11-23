"use client";

import { useEffect, useState } from "react";
import PartySocket from "partysocket";
import usePartySocket from "partysocket/react";
import { PARTYKIT_HOST } from "@/app/env";

const readyStates = {
  [PartySocket.CONNECTING]: {
    text: "Connecting",
    className: "bg-yellow-500",
  },
  [PartySocket.OPEN]: {
    text: "Connected",
    className: "bg-green-500",
  },
  [PartySocket.CLOSING]: {
    text: "Closing",
    className: "bg-orange-500",
  },
  [PartySocket.CLOSED]: {
    text: "Not Connected",
    className: "bg-red-500",
  },
};

interface ConnectionStatusProps {
  pollId: string;
}

export default function ConnectionStatus({ pollId }: ConnectionStatusProps) {
  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: pollId,
  });
  const [readyState, setReadyState] = useState<number>(
    socket?.readyState === 1 ? 1 : 0
  );
  const [connections, setConnections] = useState<number>(0);
  const readyStateInfo = readyStates[readyState as keyof typeof readyStates];

  useEffect(() => {
    if (socket) {
      const onStateChange = () => {
        setReadyState(socket.readyState);
      };

      socket.addEventListener("open", onStateChange);
      socket.addEventListener("close", onStateChange);

      const onMessage = (evt: Event) => {
        // If supported, show a count of the number of users in this room.
        // Works only if the server provides "here" messages
        const msg = JSON.parse((evt as MessageEvent).data as string);
        if (msg.type === "here") {
          setConnections(msg.connections);
        }
      };

      socket.addEventListener("message", onMessage);

      return () => {
        socket.removeEventListener("open", onStateChange);
        socket.removeEventListener("close", onStateChange);
        socket.removeEventListener("message", onMessage);
      };
    }
  }, [socket]);

  const display =
    connections > 0 && readyState === PartySocket.OPEN
      ? `${connections} here`
      : readyStateInfo.text;

  return (
    <div className="z-20 fixed top-0 left-0 flex justify-start">
      <div className="flex gap-1 sm:gap-2 justify-center items-center bg-stone-50 rounded-full shadow-sm border border-stone-300 pl-2 sm:pl-3 pr-1 sm:pr-2 py-1 sm:py-2">
        <p className="text-xs font-base uppercase tracking-wider leading-none text-stone-500">
          {display}
        </p>
        <div
          className={`w-3 h-3 rounded-full ${readyStateInfo.className}`}
        ></div>
      </div>
    </div>
  );
}
