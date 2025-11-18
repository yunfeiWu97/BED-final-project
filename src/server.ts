import app from "./app";
import { Server } from "http";

/** Port number (prefer number to avoid type friction) */
const PORT: number = Number(process.env.PORT) || 3000;

/** Start HTTP server */
const server: Server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server is running on port ${PORT}`);
});

export default server;
