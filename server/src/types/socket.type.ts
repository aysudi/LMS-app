import { Socket } from "socket.io";

export interface UserPayload {
  id: string;
  email: string;
  username: string;
}

export interface CustomSocket extends Socket {
  user?: UserPayload;
}

export interface AuthenticatedSocket extends Socket {
  user: UserPayload;
}
