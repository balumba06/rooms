import axios from "axios";

export const http = axios.create({
<<<<<<< HEAD
  baseURL: "https://rooms-2-ncqy.onrender.com/api/rooms?page=1",
=======
   baseURL: 'https://rooms-2-ncqy.onrender.com/api/rooms?page=1',
>>>>>>> c5eee91a75139250144d9e77c052a285d10c0d42
  timeout: 10_000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.response.use(
  (r) => r,
  (err) => { console.error("HTTP error:", err); throw err; }
);
