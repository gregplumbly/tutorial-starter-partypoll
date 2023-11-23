"use client";

import { useState, useEffect } from "react";
import Select, { OptionTypeBase } from "react-select";
import { PARTYKIT_HOST } from "@/app/env";
import usePartySocket from "partysocket/react";

interface OptionTypeBase {
  value: string;
  label: string;
}

interface Footballer {
  name: string;
  goals: number;
}

interface SelectFootballersProps {
  pollId: string;
}

export const SelectFootballers = ({ pollId }: SelectFootballersProps) => {
  const [footballers, setFootballers] = useState<Footballer[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<Footballer[]>([]);
  const [hasGuessed, setHasGuessed] = useState(false);
  const [selectedPlayersDetails, setSelectedPlayersDetails] = useState([]);

  useEffect(() => {
    fetch("/data.json")
      .then((response) => response.json())
      .then((data) => {
        const sortedData = data.sort((a, b) => a.name.localeCompare(b.name));
        setFootballers(sortedData);
      });
  }, []);

  const options: OptionTypeBase[] = footballers.map((footballer) => ({
    value: footballer.name,
    label: footballer.name,
  }));

  const socket = usePartySocket({
    host: PARTYKIT_HOST,
    room: pollId,
    onMessage(event) {
      // Handle incoming WebSocket messages here
    },
  });

  const sendGuess = (guessedNumber: number) => {
    console.log("sendGuess");
    if (!hasGuessed) {
      socket.send(JSON.stringify({ type: "guess", guessedNumber }));
      setHasGuessed(true);
    }
  };

  const handleGuess = () => {
    const total = selectedPlayersDetails.reduce(
      (acc, player) => acc + player.goals,
      0
    );
    const guessedNumber = total;
    sendGuess(guessedNumber);
  };

  const handlePlayerSelect = (selectedOptions) => {
    const playersDetails = selectedOptions
      .map((option) => {
        const player = footballers.find(
          (footballer) => footballer.name === option.value
        );
        return player ? { name: player.name, goals: player.goals } : null;
      })
      .filter((player) => player !== null); // Filter out any null values

    setSelectedPlayersDetails(playersDetails);
  };

  return (
    <div className="w-full flex items-center flex-col">
      <Select
        className="w-5/6"
        key="player-select"
        isMulti
        options={options}
        onChange={handlePlayerSelect}
        // onChange logic for player selection can be added here
      />
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleGuess}
      >
        Submit guess
      </button>
    </div>
  );
};
