import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";
import { NextApiResponseServerIO } from "../../utils/types/next";
import { IUserData, IUserMessage } from "../../utils/types";
import wordList from "../../utils/wordList";

let userData: IUserData = {};

let completedThisRound = new Set();

const getRandomWord = () => {
  return wordList[Math.floor(Math.random() * wordList.length)];
};

let word = getRandomWord();
const DEFAULT_TIME = 45;
let timeLeft = DEFAULT_TIME;

let messages: IUserMessage[] = [];

export default async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;

    const io = new ServerIO(httpServer, {
      path: "/api/socketio",
      cors: {
        origin: "*",
      },
    });

    io.on("connection", (socket) => {
      console.log("New connection", socket.id);

      socket.on("playerJoin", (userName) => {
        console.log("New played joined", userName);
        userData[socket.id] = {
          guesses: 0,
          points: 0,
          username: userName,
        };
        io.sockets.emit("userDataUpdate", userData);
        io.sockets.emit("newWord", word);
      });

      socket.on("message", (data: IUserMessage) => {
        userData[data.id].guesses += 1;
        if (data.message.toLowerCase() === word.toLocaleLowerCase()) {
          if (completedThisRound.has(data.id)) {
            return;
          }

          messages.push({
            id: data.id,
            username: data.username,
            message: "I got the correct answer! 🥳🎉",
          });

          io.sockets.emit("message", messages);
          completedThisRound.add(data.id);
          // User points are proportional to time left
          userData[data.id].points += timeLeft * 5;
        } else {
          messages.push(data);
          io.sockets.emit("message", messages);
        }
        io.sockets.emit("userDataUpdate", userData);
      });

      socket.on("disconnecting", () => {
        console.log("Disconnecting player ID: ", userData[socket.id].username);
        delete userData[socket.id];
        io.sockets.emit("userDataUpdate", userData);
      });
    });

    setInterval(() => {
      word = getRandomWord();
      console.log("New random word", word);
      timeLeft = DEFAULT_TIME;
      completedThisRound.clear();
      messages = [];
      io.sockets.emit("newWord", word);
    }, 1000 * (DEFAULT_TIME + 0.2));

    setInterval(() => {
      timeLeft -= 1;
      io.sockets.emit("tick", timeLeft);
    }, 1000);

    res.socket.server.io = io;
  }
  res.end();
};

export const config = {
  api: {
    bodyParser: false,
  },
};
