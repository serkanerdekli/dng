
import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Supabase Client Initialization
  const supabaseUrl = process.env.SUPABASE_URL || "";
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // API Routes
  
  // Books
  app.get("/api/books", async (req, res) => {
    const { data, error } = await supabase.from("books").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/books", async (req, res) => {
    const { data, error } = await supabase.from("books").upsert(req.body).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete("/api/books/:id", async (req, res) => {
    const { error } = await supabase.from("books").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Branches
  app.get("/api/branches", async (req, res) => {
    const { data, error } = await supabase.from("branches").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/branches", async (req, res) => {
    const { data, error } = await supabase.from("branches").upsert(req.body).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete("/api/branches/:id", async (req, res) => {
    const { error } = await supabase.from("branches").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Users
  app.get("/api/users", async (req, res) => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/users", async (req, res) => {
    const { data, error } = await supabase.from("users").upsert(req.body).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete("/api/users/:id", async (req, res) => {
    const { error } = await supabase.from("users").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Logs
  app.get("/api/logs", async (req, res) => {
    const { data, error } = await supabase.from("logs").select("*").order("timestamp", { ascending: false }).limit(500);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/logs", async (req, res) => {
    const { data, error } = await supabase.from("logs").insert(req.body).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  // Campaigns
  app.get("/api/campaigns", async (req, res) => {
    const { data, error } = await supabase.from("campaigns").select("*");
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.post("/api/campaigns", async (req, res) => {
    const { data, error } = await supabase.from("campaigns").upsert(req.body).select();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    const { error } = await supabase.from("campaigns").delete().eq("id", req.params.id);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
