const fileInput = document.getElementById("fileInput");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const cropBtn = document.getElementById("cropBtn");
const lineBtn = document.getElementById("lineBtn");
const rectBtn = document.getElementById("rectBtn");
const rotateSlider = document.getElementById("rotateSlider");
const brightnessSlider = document.getElementById("brightnessSlider");
const contrastSlider = document.getElementById("contrastSlider");
const blurSlider = document.getElementById("blurSlider");
const resizeW = document.getElementById("resizeW");
const resizeH = document.getElementById("resizeH");
const applyResizeBtn = document.getElementById("applyResizeBtn");
const applyCropBtn = document.getElementById("applyCropBtn");
const applyRotateBtn = document.getElementById("applyRotateBtn");
const applyBCBtn = document.getElementById("applyBCBtn");
const applyBlurBtn = document.getElementById("applyBlurBtn");
const edgeBtn = document.getElementById("edgeBtn");
const cornerBtn = document.getElementById("cornerBtn");
const exportBtn = document.getElementById("exportBtn");
const backBtn = document.getElementById("backBtn");

const state = {
  imageBitmap: null,
  shapes: [],
  history: [],
  activeTool: "crop",

  transform: {
    rotation: 0,
    brightness: 0,
    contrast: 1,
    blur: 0,
  },

  drawing: {
    active: false,
    type: null,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  },
  crop: {
    active: false,
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
  },
};

fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;

    state.imageBitmap = img;
    draw();
  };

  img.src = URL.createObjectURL(file);
});

cropBtn.addEventListener("click", () => {
  state.activeTool = "crop";

  document.querySelectorAll(".tool-btn").forEach((b) => b.classList.remove("active"));
  cropBtn.classList.add("active");
});

lineBtn.onclick = () => setTool("line");
rectBtn.onclick = () => setTool("rect");

function setTool(tool) {
  state.activeTool = tool;
  document.querySelectorAll(".tool-btn").forEach((b) => b.classList.remove("active"));
  if (tool === "line") lineBtn.classList.add("active");
  if (tool === "rect") rectBtn.classList.add("active");
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.imageBitmap) {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(state.transform.rotation);

    ctx.filter = `
    brightness(${100 + state.transform.brightness}%)
    contrast(${state.transform.contrast * 100}%)
    blur(${state.transform.blur}px)
    `;

    ctx.drawImage(state.imageBitmap, -state.imageBitmap.width / 2, -state.imageBitmap.height / 2);

    ctx.filter = "none";
    ctx.restore();
  }

  const c = state.crop;
  if (c.startX !== c.endX && c.startY !== c.endY) {
    const x = Math.min(c.startX, c.endX);
    const y = Math.min(c.startY, c.endY);
    const w = Math.abs(c.endX - c.startX);
    const h = Math.abs(c.endY - c.startY);

    ctx.strokeStyle = "red";
    ctx.setLineDash([6]);
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }

  for (const s of state.shapes) {
    ctx.strokeStyle = "lime";
    ctx.lineWidth = 2;

    if (s.type === "line") {
      ctx.beginPath();
      ctx.moveTo(s.startX, s.startY);
      ctx.lineTo(s.endX, s.endY);
      ctx.stroke();
    }

    if (s.type === "rect") {
      const x = Math.min(s.startX, s.endX);
      const y = Math.min(s.startY, s.endY);
      const w = Math.abs(s.endX - s.startX);
      const h = Math.abs(s.endY - s.startY);
      ctx.strokeRect(x, y, w, h);
    }
  }
}

rotateSlider.addEventListener("input", () => {
  state.transform.rotation = (Number(rotateSlider.value) * Math.PI) / 180;
  draw();
});

brightnessSlider.addEventListener("input", () => {
  state.transform.brightness = Number(brightnessSlider.value);
  draw();
});

contrastSlider.addEventListener("input", () => {
  state.transform.contrast = Number(contrastSlider.value) / 100;
  draw();
});

blurSlider.addEventListener("input", () => {
  state.transform.blur = Number(blurSlider.value);
  draw();
});

function pushHistory() {
  state.history.push({
    imageBitmap: state.imageBitmap,
    shapes: state.shapes.map((s) => ({ ...s })),
  });
}

//mouse events

canvas.addEventListener("mousedown", (e) => {
  if (!state.imageBitmap) return;

  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;

  // ✅ CROP
  if (state.activeTool === "crop") {
    state.crop.active = true;
    state.crop.startX = x;
    state.crop.startY = y;
    state.crop.endX = x;
    state.crop.endY = y;
    return;
  }

  // ✅ DRAW
  if (state.activeTool === "line" || state.activeTool === "rect") {
    state.drawing.active = true;
    state.drawing.type = state.activeTool;
    state.drawing.startX = x;
    state.drawing.startY = y;
    state.drawing.endX = x;
    state.drawing.endY = y;
  }
});

canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;

  if (state.crop.active) {
    state.crop.endX = x;
    state.crop.endY = y;
    draw();
    return;
  }

  if (state.drawing.active) {
    state.drawing.endX = x;
    state.drawing.endY = y;
    draw();
  }
});

canvas.addEventListener("mouseup", () => {
  if (state.crop.active) {
    state.crop.active = false;
    draw();
    return;
  }

  if (state.drawing.active) {
    pushHistory();
    state.shapes.push({ ...state.drawing });
    state.drawing.active = false;
    draw();
  }
});

applyResizeBtn.addEventListener("click", async () => {
  const w = Number(resizeW.value);
  const h = Number(resizeH.value);

  if (!w || !h) return;

  // ✅ Undo
  pushHistory();

  const blob = await new Promise((r) => canvas.toBlob(r));

  const fd = new FormData();
  fd.append("image", blob);
  fd.append("width", w);
  fd.append("height", h);

  const res = await fetch("/api/resize", {
    method: "POST",
    body: fd,
  });

  const outBlob = await res.blob();
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    state.imageBitmap = img;

    resizeW.value = "";
    resizeH.value = "";

    draw();
  };
  img.src = URL.createObjectURL(outBlob);
});

applyCropBtn.addEventListener("click", async () => {
  const c = state.crop;

  const x = Math.min(c.startX, c.endX);
  const y = Math.min(c.startY, c.endY);
  const w = Math.abs(c.endX - c.startX);
  const h = Math.abs(c.endY - c.startY);

  if (w === 0 || h === 0) return;

  state.history.push({
    imageBitmap: state.imageBitmap,
    shapes: state.shapes.map((s) => ({ ...s })),
  });

  // canvas → blob
  const blob = await new Promise((r) => canvas.toBlob(r));

  const fd = new FormData();
  fd.append("image", blob);
  fd.append("x", Math.round(x));
  fd.append("y", Math.round(y));
  fd.append("w", Math.round(w));
  fd.append("h", Math.round(h));

  const res = await fetch("/api/crop", {
    method: "POST",
    body: fd,
  });

  const outBlob = await res.blob();
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    state.imageBitmap = img;
    state.crop = { active: false, startX: 0, startY: 0, endX: 0, endY: 0 };
    draw();
  };
  img.src = URL.createObjectURL(outBlob);
});

applyRotateBtn.addEventListener("click", async () => {
  const angle = rotateSlider.value;

  state.history.push({
    imageBitmap: state.imageBitmap,
    shapes: state.shapes.map((s) => ({ ...s })),
  });

  const blob = await new Promise((r) => canvas.toBlob(r));

  const fd = new FormData();
  fd.append("image", blob);
  fd.append("angle", angle);

  const res = await fetch("/api/rotate", {
    method: "POST",
    body: fd,
  });

  const outBlob = await res.blob();
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    state.imageBitmap = img;
    state.transform.rotation = 0;
    rotateSlider.value = 0;
    draw();
  };
  img.src = URL.createObjectURL(outBlob);
});

applyBCBtn.addEventListener("click", async () => {
  state.history.push({
    imageBitmap: state.imageBitmap,
    shapes: state.shapes.map((s) => ({ ...s })),
  });

  const blob = await new Promise((r) => canvas.toBlob(r));

  const fd = new FormData();
  fd.append("image", blob);
  fd.append("brightness", state.transform.brightness);
  fd.append("contrast", state.transform.contrast);

  const res = await fetch("/api/brightness-contrast", {
    method: "POST",
    body: fd,
  });

  const outBlob = await res.blob();
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    state.imageBitmap = img;

    state.transform.brightness = 0;
    state.transform.contrast = 1;
    brightnessSlider.value = 0;
    contrastSlider.value = 100;

    draw();
  };
  img.src = URL.createObjectURL(outBlob);
});

applyBlurBtn.addEventListener("click", async () => {
  let k = state.transform.blur;
  if (k < 1) return;

  if (k % 2 === 0) k += 1;

  state.history.push({
    imageBitmap: state.imageBitmap,
    shapes: state.shapes.map((s) => ({ ...s })),
  });

  const blob = await new Promise((r) => canvas.toBlob(r));
  const fd = new FormData();
  fd.append("image", blob);
  fd.append("k", k);

  const res = await fetch("/api/blur", {
    method: "POST",
    body: fd,
  });

  const outBlob = await res.blob();
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    state.imageBitmap = img;
    state.transform.blur = 0;
    blurSlider.value = 0;
    draw();
  };
  img.src = URL.createObjectURL(outBlob);
});

edgeBtn.addEventListener("click", async () => {
  state.history.push({
    imageBitmap: state.imageBitmap,
    shapes: state.shapes.map((s) => ({ ...s })),
  });

  const blob = await new Promise((r) => canvas.toBlob(r));
  const fd = new FormData();
  fd.append("image", blob);

  const res = await fetch("/api/edge", {
    method: "POST",
    body: fd,
  });

  const outBlob = await res.blob();
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    state.imageBitmap = img;
    draw();
  };
  img.src = URL.createObjectURL(outBlob);
});

cornerBtn.addEventListener("click", async () => {
  state.history.push({
    imageBitmap: state.imageBitmap,
    shapes: state.shapes.map((s) => ({ ...s })),
  });

  const blob = await new Promise((r) => canvas.toBlob(r));
  const fd = new FormData();
  fd.append("image", blob);

  const res = await fetch("/api/corner", {
    method: "POST",
    body: fd,
  });

  const outBlob = await res.blob();
  const img = new Image();
  img.onload = () => {
    canvas.width = img.width;
    canvas.height = img.height;
    state.imageBitmap = img;
    draw();
  };
  img.src = URL.createObjectURL(outBlob);
});

function channelRemove(channel) {
  pushHistory();

  canvas.toBlob(async (blob) => {
    const fd = new FormData();
    fd.append("image", blob);
    fd.append("channel", channel);

    const res = await fetch("/api/channel", {
      method: "POST",
      body: fd,
    });

    const outBlob = await res.blob();
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      state.imageBitmap = img;
      draw();
    };
    img.src = URL.createObjectURL(outBlob);
  });
}

removeRBtn.onclick = () => channelRemove("r");
removeGBtn.onclick = () => channelRemove("g");
removeBBtn.onclick = () => channelRemove("b");

exportBtn.onclick = () => {
  const link = document.createElement("a");
  link.download = "edited-image.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

backBtn.onclick = () => {
  if (state.history.length === 0) return;

  const snap = state.history.pop();
  state.imageBitmap = snap.imageBitmap;
  state.shapes = snap.shapes;

  canvas.width = state.imageBitmap.width;
  canvas.height = state.imageBitmap.height;
  draw();
};
