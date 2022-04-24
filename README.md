# ✏ QuickGuess

Using [WebSockets](https://en.wikipedia.org/wiki/WebSocket) via [Socket.IO](https://socket.io/) to enable a multi-player word-guessing game.

![QuickGuess Screenshot](/quickguess.png)

## ⚙ Setup & Installation

1. `yarn install` to install packages

2. a. `yarn dev` to run in development mode

   b. `yarn build` and `yarn start` to build and start production server

3. Enjoy at `http://localhost:3000/`

## Other

This was my second time trying out WebSockets to see how they work. Overall they're quite simple to add to use but I haven't looked into the best practices and so have just used it in a way that I thought made sense.

[Vercel doesn't support WebSocket connections](https://vercel.com/support/articles/do-vercel-serverless-functions-support-websocket-connections) - so something else like Heroku should be used for hosting. Alternatively, the WebSocket functionality could be reimplemented with [Pusher](https://pusher.com/channels), but I haven't looked into a good open source option and I'd rather self-host.

Inspired by [Semantle](https://semantle.novalis.org/).

Seeing as this was an attempt to just try WebSockets, no attempts were made to style this project so it looks 🤮
