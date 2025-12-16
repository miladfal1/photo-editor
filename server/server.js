import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fetch from "node-fetch";
import FormData from "form-data";
import fs from "fs";

const app = express();
const PORT = 3000;

const upload = multer({ dest: "uploads/" });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index");
});

app.post("/api/resize", upload.single("image"), async (req, res) => {
  const { width, height } = req.body;

  const form = new FormData();
  form.append("width", width);
  form.append("height", height);
  form.append("image", fs.createReadStream(req.file.path));

  console.log(form);

  const response = await fetch("http://localhost:8000/resize", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  const buffer = await response.arrayBuffer();
  fs.unlinkSync(req.file.path);

  res.set("Content-Type", "image/png");
  res.send(Buffer.from(buffer));
});

app.post("/api/crop", upload.single("image"), async (req, res) => {
  const { x, y, w, h } = req.body;

  const form = new FormData();
  form.append("x", x);
  form.append("y", y);
  form.append("w", w);
  form.append("h", h);
  form.append("image", fs.createReadStream(req.file.path));

  const response = await fetch("http://localhost:8000/crop", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  const buffer = await response.arrayBuffer();
  fs.unlinkSync(req.file.path);

  res.set("Content-Type", "image/png");
  res.send(Buffer.from(buffer));
});

app.post("/api/rotate", upload.single("image"), async (req, res) => {
  const { angle } = req.body;

  const form = new FormData();
  form.append("angle", angle);
  form.append("image", fs.createReadStream(req.file.path));

  const response = await fetch("http://localhost:8000/rotate", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  const buffer = await response.arrayBuffer();
  fs.unlinkSync(req.file.path);

  res.set("Content-Type", "image/png");
  res.send(Buffer.from(buffer));
});

app.post("/api/brightness-contrast", upload.single("image"), async (req, res) => {
  const { brightness, contrast } = req.body;

  const form = new FormData();
  form.append("brightness", brightness);
  form.append("contrast", contrast);
  form.append("image", fs.createReadStream(req.file.path));

  const response = await fetch("http://localhost:8000/brightness-contrast", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  const buffer = await response.arrayBuffer();
  fs.unlinkSync(req.file.path);

  res.set("Content-Type", "image/png");
  res.send(Buffer.from(buffer));
});

app.post("/api/blur", upload.single("image"), async (req, res) => {
  const { k } = req.body;

  const form = new FormData();
  form.append("k", k);
  form.append("image", fs.createReadStream(req.file.path));

  const response = await fetch("http://localhost:8000/blur", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  const buffer = await response.arrayBuffer();
  fs.unlinkSync(req.file.path);

  res.set("Content-Type", "image/png");
  res.send(Buffer.from(buffer));
});

app.post("/api/edge", upload.single("image"), async (req, res) => {
  const form = new FormData();
  form.append("image", fs.createReadStream(req.file.path));

  const response = await fetch("http://localhost:8000/edge", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  const buffer = await response.arrayBuffer();
  fs.unlinkSync(req.file.path);

  res.set("Content-Type", "image/png");
  res.send(Buffer.from(buffer));
});

app.post("/api/corner", upload.single("image"), async (req, res) => {
  const form = new FormData();
  form.append("image", fs.createReadStream(req.file.path));

  const response = await fetch("http://localhost:8000/corner", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  const buffer = await response.arrayBuffer();
  fs.unlinkSync(req.file.path);

  res.set("Content-Type", "image/png");
  res.send(Buffer.from(buffer));
});

app.post("/api/channel", upload.single("image"), async (req, res) => {
  const { channel } = req.body;

  const form = new FormData();
  form.append("channel", channel);
  form.append("image", fs.createReadStream(req.file.path));

  const response = await fetch("http://localhost:8000/channel", {
    method: "POST",
    body: form,
    headers: form.getHeaders(),
  });

  const buffer = await response.arrayBuffer();
  fs.unlinkSync(req.file.path);

  res.set("Content-Type", "image/png");
  res.send(Buffer.from(buffer));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
