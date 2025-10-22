import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

// Create a socket instance
export const socket = io(URL, {
  autoConnect: false // We will manually connect when a user enters a project page
});