<template>
  <div class="app-root">
    <header class="hero">
      <div>
        <p class="eyebrow">Pixel Tool — Local</p>
        <h1>Pixe Art Generator</h1>
        <p class="subtitle">
          Collez votre tableau de caractères, validez-le côté serveur, puis exportez en PNG.
        </p>
      </div>
      <div class="hero-card">
        <div>
          <p class="meta-label">Contraintes</p>
          <p class="meta-value">8 → 64 lignes • 8 → 64 caractères</p>
        </div>
        <div>
          <p class="meta-label">API</p>
          <p class="meta-value">{{ apiBase }}</p>
        </div>
      </div>
    </header>

    <main class="main">
      <section class="panel">
        <div class="panel-header">
          <h2>Entrée</h2>
          <span class="badge">Tableau + palette</span>
        </div>

        <label class="field">
          <span>Tableau (copier / coller)</span>
          <textarea
            v-model="gridText"
            class="text-area"
            placeholder="Ex:\n..##..##\n..##..##\n##..##..\n##..##.."
            rows="10"
          />
        </label>

        <label class="field">
          <span>Palette (caractères uniques, optionnel)</span>
          <input
            v-model="paletteInput"
            class="text-input"
            placeholder="Ex: .#@*"
          />
          <small>Sans séparateurs. Espaces et virgules sont ignorés.</small>
        </label>

        <div class="buttons-row">
          <button
            type="button"
            class="button primary"
            :disabled="loading"
            @click="validateAndRender"
          >
            {{ loading ? "Validation..." : "Valider & Rendre" }}
          </button>
          <button type="button" class="button" @click="downloadPng" :disabled="!hasRender">
            Télécharger PNG
          </button>
          <button type="button" class="button ghost" @click="clearAll">
            Effacer
          </button>
        </div>

        <div v-if="status" class="status-card" :class="status.ok ? 'ok' : 'error'">
          <p class="status-title">
            {{ status.ok ? "Validation OK" : "Validation échouée" }}
          </p>
          <p class="status-meta" v-if="status.ok">
            {{ status.width }} × {{ status.height }} • {{ status.uniqueChars.length }} caractères uniques
          </p>
          <ul v-if="status.errors.length" class="status-list">
            <li v-for="item in status.errors" :key="item">{{ item }}</li>
          </ul>
          <ul v-if="status.warnings.length" class="status-list warning">
            <li v-for="item in status.warnings" :key="item">{{ item }}</li>
          </ul>
        </div>

        <div v-if="status?.ok" class="palette-preview">
          <p class="palette-title">Palette utilisée</p>
          <div class="palette-swatches">
            <div
              v-for="(item, index) in palettePreview"
              :key="`${item.char}-${index}`"
              class="swatch"
              :style="{ backgroundColor: item.color }"
            >
              <span>{{ item.char === ' ' ? '␠' : item.char }}</span>
            </div>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="panel-header">
          <h2>Preview</h2>
          <span class="badge">Canvas</span>
        </div>
        <div class="canvas-wrap">
          <canvas
            ref="canvasRef"
            class="preview-canvas"
            :width="canvasWidth"
            :height="canvasHeight"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";

type ValidationResponse = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  width: number;
  height: number;
  uniqueChars: string[];
  paletteChars: string[];
  lines: string[];
};

const apiBase = (import.meta.env.VITE_API_BASE as string) || "http://localhost:3001";

const canvasRef = ref<HTMLCanvasElement | null>(null);
const gridText = ref<string>("");
const paletteInput = ref<string>("");

const status = ref<ValidationResponse | null>(null);
const loading = ref(false);
const hasRender = ref(false);

const canvasWidth = ref(512);
const canvasHeight = ref(512);

const palettePreview = computed(() => {
  if (!status.value?.ok) return [];
  const colors = buildPalette(status.value.paletteChars.length);
  return status.value.paletteChars.map((char, index) => ({
    char,
    color: colors[index]
  }));
});

function buildPalette(count: number) {
  const colors: string[] = [];
  const baseHue = 200;
  const spread = 280;
  for (let i = 0; i < count; i += 1) {
    const hue = (baseHue + (i / Math.max(1, count)) * spread) % 360;
    const saturation = 70;
    const lightness = 55 - (i % 2) * 8;
    colors.push(`hsl(${hue} ${saturation}% ${lightness}%)`);
  }
  return colors;
}

async function validateAndRender() {
  loading.value = true;
  hasRender.value = false;

  try {
    const response = await fetch(`${apiBase}/api/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gridText: gridText.value,
        palette: paletteInput.value
      })
    });

    const data = (await response.json()) as ValidationResponse;
    status.value = data;

    if (data.ok) {
      drawGrid(data.lines, data.paletteChars);
      hasRender.value = true;
    }
  } catch (error) {
    status.value = {
      ok: false,
      errors: ["Impossible de joindre le serveur."],
      warnings: [],
      width: 0,
      height: 0,
      uniqueChars: [],
      paletteChars: [],
      lines: []
    };
  } finally {
    loading.value = false;
  }
}

function drawGrid(lines: string[], paletteChars: string[]) {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const width = lines[0]?.length ?? 0;
  const height = lines.length;
  if (!width || !height) return;

  const maxSize = 512;
  const pixelSize = Math.max(4, Math.floor(maxSize / Math.max(width, height)));

  canvasWidth.value = width * pixelSize;
  canvasHeight.value = height * pixelSize;

  canvas.width = canvasWidth.value;
  canvas.height = canvasHeight.value;

  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const colors = buildPalette(paletteChars.length);
  const colorMap = new Map<string, string>();
  paletteChars.forEach((char, index) => {
    colorMap.set(char, colors[index]);
  });

  for (let y = 0; y < height; y += 1) {
    const row = lines[y];
    for (let x = 0; x < width; x += 1) {
      const char = row[x];
      const color = colorMap.get(char) ?? "#111827";
      ctx.fillStyle = color;
      ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
    }
  }
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

function clearAll() {
  gridText.value = "";
  paletteInput.value = "";
  status.value = null;
  hasRender.value = false;
  const canvas = canvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}
</script>
