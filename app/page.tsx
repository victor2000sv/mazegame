"use client";
import Image from "next/image";
import { useState } from "react";

type direction = "North" | "West" | "East" | "South";

export default function Home() {
  const API_URL = "https://mazegame.plingot.com";

  const [possibleDirections, setPossibleDirections] = useState<direction[]>([]);
  const [loading, setLoading] = useState(false);
  const [gameToken, setGameToken] = useState("");
  const [victorious, setVictorious] = useState(false);

  const getPossibleDirections: any = async (token = gameToken) => {
    const response = await fetch(`${API_URL}/Room/current`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: token,
      },
    });

    if (response.ok) {
      const { paths, effect } = await response.json();

      const possibleDir = paths.map((item: any) => item.direction);
      return {
        newDirections: possibleDir,
        victory: effect == "Victory",
      };
    }

    return {
      newDirections: null,
      victory: false,
    };
  };

  const move = async (direction: direction) => {
    setLoading(true);
    const response = await fetch(
      `${API_URL}/Player/move?direction=${direction}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: gameToken,
        },
      }
    );

    if (response.ok) {
      const { newDirections, victory } = await getPossibleDirections();
      if (victory) {
        setVictorious(true);
        stopGame();
      }

      setPossibleDirections(newDirections);
    }
    setLoading(false);
  };

  const stopGame = async () => {
    const response = await fetch(`${API_URL}/Game`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: gameToken,
      },
    });
  };

  const startGame = async () => {
    //RANOMSIZE SEED
    setLoading(true);

    const response = await fetch(`${API_URL}/Game/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "Graph",
        size: 5,
        seed: 0,
      }),
    });

    if (response.ok) {
      const { token } = await response.json();
      setGameToken(token);

      const { newDirections } = await getPossibleDirections(token);
      setPossibleDirections(newDirections);
    }

    setLoading(false);
  };

  return (
    <>
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2">
        {gameToken.trim().length > 0 && (
          <div className="grid grid-cols-3 gap-0 w-64 h-64">
            <button
              className="col-start-2 col-span-1 bg-[#2c2c2c] shadow-lg text-white p-4 group"
              disabled={!possibleDirections.includes("North") || loading}
              onClick={() => move("North")}
            >
              <Image
                src={"/icons/up.svg"}
                alt=""
                width={100}
                height={100}
                className="active group-disabled:inactive group-disabled:opacity-20"
              />
            </button>
            <button
              className="col-start-1 col-span-1 bg-[#2c2c2c] shadow-lg text-white p-4 group"
              disabled={!possibleDirections.includes("West") || loading}
              onClick={() => move("West")}
            >
              <Image
                src={"/icons/back.svg"}
                alt=""
                width={100}
                height={100}
                className="active group-disabled:inactive group-disabled:opacity-20"
              />
            </button>
            <button
              className="col-start-3 col-span-1 bg-[#2c2c2c] shadow-lg text-white p-4 group"
              disabled={!possibleDirections.includes("East") || loading}
              onClick={() => move("East")}
            >
              <Image
                src={"/icons/forward.svg"}
                alt=""
                width={100}
                height={100}
                className="active group-disabled:inactive group-disabled:opacity-20"
              />
            </button>
            <button
              className="col-start-2 col-span-1 bg-[#2c2c2c] shadow-lg text-white p-4 group"
              disabled={!possibleDirections.includes("South") || loading}
              onClick={() => move("South")}
            >
              <Image
                src={"/icons/down.svg"}
                alt=""
                width={100}
                height={100}
                className="active group-disabled:inactive group-disabled:opacity-20"
              />
            </button>
          </div>
        )}
        {gameToken.trim().length == 0 && (
          <button
            onClick={startGame}
            className="p-4 uppercase text-white font-bold text-xl text-center bg-[#2c2c2c] disabled:opacity-20"
            disabled={loading}
          >
            Start
          </button>
        )}
      </div>
      {victorious && (
        <h1 className=" text-6xl text-green-300 uppercase font-bold fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          Victory!!
        </h1>
      )}
    </>
  );
}
