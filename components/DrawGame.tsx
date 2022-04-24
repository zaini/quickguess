import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { IUserData, IUserMessage } from "../utils/types";

/**
 * Ideas:
 * If user has not joined the game, make them enter a username to join the game
 * Once user has joined, add them to the chat with all the other users
 * Every 30 seconds a drawing is made. Users guess the drawing. Correct guesses don't show up in the chat. Incorrect guesses show up in chat.
 * The sooner someone guesses the more points they get. First person to guess gets extra points.
 * Have a leaderboard at the bottom which updates with players scores (and as players join).
 * (optional) Toast when a player joins
 * (optional) Some kind of reward/animaion when a player wins a round or 10 rounds or something
 * (optional) Rooms w/ passwords
 * (optional) Users can draw
 * (optional) Users can choose the words
 */

let socket: Socket;

const DrawGame = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [chat, setChat] = useState<IUserMessage[]>([]);
  const [user, setUser] = useState<string>("Bobby");
  const [message, setMessage] = useState<string>("");
  const [userData, setUserData] = useState<IUserData>({});

  const [counter, setCounter] = useState<number>(30);
  const [definitions, setDefinitions] = useState<string[]>([]);

  useEffect((): any => {
    fetch("/api/socketio").finally(() => {
      socket = io({ path: "/api/socketio" });

      socket.on("connect", () => {
        const enteredUsername = window.prompt("Enter your name") || "Bobby";
        setUser(enteredUsername);

        socket.emit("playerJoin", enteredUsername);

        setConnected(true);
      });

      socket.on("message", (data: IUserMessage[]) => {
        setChat(data);
      });

      socket.on("userDataUpdate", (data: IUserData) => {
        setUserData(data);
      });

      socket.on("newWord", async (word: string) => {
        console.log(word);
        const response = await fetch(
          `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
        );
        const data = await response.json();
        const meanings = data[0].meanings;
        let parsedDefinitions = meanings.flatMap(
          (meaning: any) => meaning.definitions
        );
        parsedDefinitions = parsedDefinitions.flatMap((definition: any) =>
          definition.definition.replace(new RegExp(word, "g"), "[WORD]")
        );
        setDefinitions(parsedDefinitions);

        // Clear chat after new word comes in
        setChat([]);
      });

      socket.on("tick", (timeLeft: number) => {
        setCounter(timeLeft);
      });
    });
    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  const sendMessage = async () => {
    socket.emit("message", { username: user, message, id: socket.id });
    setMessage("");
  };

  return (
    <>
      {connected ? (
        <div style={{ margin: "0px 20%" }}>
          <h2 style={{ textAlign: "center" }}>⏰ {counter}s</h2>
          <br />
          {definitions.length > 0 ? (
            <>
              <h4>Definitions</h4>
              <br />
              {definitions.slice(0, 5).map((definition, i) => {
                return <li key={i}>{definition}</li>;
              })}
              <br />
              <br />
              <br />
              {chat.length > 0 ? (
                chat.map((chatter, i) => (
                  <div key={i}>
                    <span
                      style={{
                        fontWeight:
                          chatter.id === socket.id ? "bold" : "normal",
                      }}
                    >
                      {chatter.username}
                    </span>
                    : {chatter.message}
                  </div>
                ))
              ) : (
                <div>
                  <b>Be the first to guess 🤑</b>
                </div>
              )}
            </>
          ) : (
            <h3>Wait for the next word to join...</h3>
          )}

          <br />

          <input
            style={{ width: "75%" }}
            type="text"
            value={message}
            placeholder={"Enter a guess..."}
            onChange={(e) => {
              setMessage(e.target.value);
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />
          <button onClick={sendMessage} disabled={!connected}>
            Send
          </button>

          <br />
          <br />
          <br />

          <h2>Leaderboard</h2>
          <ol>
            {Object.entries(userData)
              .sort(([usernameA, statisticsA], [usernameB, statisticsB]) => {
                return statisticsB.points - statisticsA.points;
              })
              .map(([id, statistics], i) => {
                return (
                  <li
                    key={i}
                    style={{
                      fontWeight: id === socket.id ? "bold" : "normal",
                    }}
                  >
                    {statistics.username} | {statistics.points} points |{" "}
                    {statistics.guesses} guesses
                  </li>
                );
              })}
          </ol>
        </div>
      ) : (
        <h1>Connecting...</h1>
      )}
    </>
  );
};

export default DrawGame;
