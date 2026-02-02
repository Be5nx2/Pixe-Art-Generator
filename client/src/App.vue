<template>
  <div class="app-root">
    <header class="header">
      <h1>Pixe Art Generator</h1>
      <p class="subtitle">
        Minimal TypeScript + Vue playground with PNG export.
      </p>
    </header>

    <main class="main">
      <section class="panel">
        <h2>Prompt</h2>
        <textarea
          v-model="prompt"
          class="prompt-input"
          placeholder="Describe the image you want to generate..."
          rows="4"
        />
        <p class="hint">
          The server API receives this prompt, but image generation is not
          implemented yet.
        </p>

        <div class="buttons-row">
          <button type="button" class="button primary" @click="redrawCanvas">
            Render Preview
          </button>
          <button type="button" class="button" @click="downloadPng">
            Download as PNG
          </button>
        </div>
      </section>

      <section class="panel">
        <h2>Preview (Canvas → PNG)</h2>
        <canvas ref="canvasRef" :width="canvasWidth" :height="canvasHeight" class="preview-canvas" />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const prompt = ref<string>("");

const canvasWidth = 512;
const canvasHeight = 512;

function drawPlaceholder() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
  gradient.addColorStop(0, "#111827");
  gradient.addColorStop(1, "#1f2937");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Simple "pixel art" blocks
  const colors = ["#f97316", "#22c55e", "#3b82f6", "#e11d48", "#a855f7"];
  const blockSize = 32;

  for (let y = 0; y < canvasHeight; y += blockSize) {
    for (let x = 0; x < canvasWidth; x += blockSize) {
      if ((x / blockSize + y / blockSize) % 3 === 0) {
        ctx.fillStyle = colors[(x / blockSize + y / blockSize) % colors.length];
        ctx.fillRect(x, y, blockSize, blockSize);
      }
    }
  }

  // Overlay text with the prompt (if any)
  ctx.fillStyle = "rgba(15, 23, 42, 0.75)";
  ctx.fillRect(0, canvasHeight - 120, canvasWidth, 120);

  ctx.fillStyle = "#e5e7eb";
  ctx.font = "20px system-ui, -apple-system, BlinkMacSystemFont, sans-serif";
  ctx.textBaseline = "top";

  const baseText = prompt.value.trim() || "Your prompt will appear here.";
  const maxWidth = canvasWidth - 40;
  const lines = wrapText(ctx, baseText, maxWidth);

  let y = canvasHeight - 100;
  for (const line of lines) {
    ctx.fillText(line, 20, y);
    y += 24;
  }
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.slice(0, 3); // limit to a few lines to keep it tidy
}

function redrawCanvas() {
  drawPlaceholder();
}

function downloadPng() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const dataUrl = canvas.toDataURL("image/png");
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = "pixe-art.png";
  link.click();
}

onMounted(() => {
  drawPlaceholder();
});

// Optionally keep the preview roughly in sync as the prompt changes
watch(prompt, () => {
  drawPlaceholder();
});
</script>

