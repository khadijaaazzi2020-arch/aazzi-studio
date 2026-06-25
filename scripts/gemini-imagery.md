# Generating hero / supporting imagery with Gemini CLI

The site ships with CSS-based premium visuals (coral glow + the logo). If you
want generated abstract textures that match the brand, use Gemini CLI.

## 1. Get a key
Google AI Studio → API key. Then in this shell:

```powershell
$env:GEMINI_API_KEY = "your-key"
```

## 2. Prompts (stay on-palette: #121414 base + dark coral #e0473a)

**Hero ambient texture (wide):**
> Abstract premium 3D texture, warm near-black charcoal (#121414) background,
> a single sweeping ribbon of glowing dark-coral light (#e0473a to #ff5246),
> soft volumetric haze, cinematic studio lighting, ultra-clean, no text,
> no logo, subtle film grain, 16:9, high detail.

**Section divider / grain field (square):**
> Minimal dark coral particle field on #121414, depth-of-field bokeh, tasteful,
> editorial, no text, 1:1.

## 3. Save & wire
Save outputs to `public/hero-bg.webp` (compress to WebP/AVIF, < 250 KB), then in
`src/components/Hero.tsx` add an `<Image>` inside `.hero-visual` behind the logo,
or set it as a `background-image` on `.hero`. Lazy-load anything below the fold.

> Note: exact image-generation invocation depends on your Gemini CLI version
> (Imagen access varies by account). If your CLI build doesn't expose image
> generation, generate in AI Studio's UI with the prompts above and drop the
> files into `public/`.
