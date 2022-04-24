export interface IUserMessage {
  id: string;
  username: string;
  message: string;
}

export interface IUserData {
  [key: string]: {
    guesses: number;
    points: number;
    username: string;
  };
}
