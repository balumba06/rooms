import axios from "axios";

export const http = axios.create({

  baseURL: "https://rooms-2-ncqy.onrender.com/api/rooms?page=1",
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (r) => r,
  (err) => { console.error("HTTP error:", err); throw err; }
);
