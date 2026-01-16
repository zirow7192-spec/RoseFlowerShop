import express from "express";
import { createServer } from "http";
import path from "path";

const app = express();
const httpServer = createServer(app);

// Serve static files from the 'flower-shop-static' directory
const staticDir = path.join(process.cwd(), "flower-shop-static");
app.use(express.static(staticDir));

const port = parseInt(process.env.PORT || "5000", 10);
httpServer.listen(
  {
    port,
    host: "0.0.0.0",
    reusePort: true,
  },
  () => {
    console.log(`Static server running on port ${port}`);
    console.log(`Serving files from ${staticDir}`);
  },
);
