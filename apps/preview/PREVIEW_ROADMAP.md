# Preview — Social Media Preview Tool

> Herramienta para visualizar en tiempo real como se ve contenido (imagenes, videos, GIFs, texto, ads) en diferentes redes sociales y formatos.

---

## Concepto

El usuario sube o pega contenido (imagen, video, GIF, texto) y ve instantaneamente como se renderiza en los formatos nativos de cada red social. Util para:

- Creadores de contenido que quieren ver como se ve su post antes de publicar
- Equipos de marketing validando creativos/ads en multiples plataformas
- Disenadores revisando aspect ratios, recortes y safe zones
- Cualquiera que quiera previsualizar thumbnails, stories, reels, etc.

---

## Plataformas soportadas

| Plataforma | Formatos |
|---|---|
| **Instagram** | Post cuadrado (1:1), Story/Reel (9:16), Carousel, Profile grid |
| **TikTok** | Video feed (9:16), Profile grid, thumbnail |
| **YouTube** | Thumbnail (16:9), Shorts (9:16), Community post, Channel banner |
| **X (Twitter)** | Tweet con imagen (16:9 / 2:1), Tweet con video, Profile header |
| **LinkedIn** | Post con imagen (1.91:1), Article cover, Company page banner |
| **Facebook** | Post (1.91:1), Story (9:16), Ad (varias ratios), Cover photo, Event cover |

---

## Stack tecnico

| Capa | Tecnologia | Razon |
|---|---|---|
| Framework | **Astro 5 + React islands** | Consistente con el monorepo (www, build) |
| Styling | **Tailwind 3** | Ya configurado en el monorepo |
| State | **Zustand** o React state local | Ligero, sin necesidad de backend |
| Media handling | **Canvas API + FileReader** | Crop, resize, overlay en cliente |
| Video preview | **`<video>` nativo + ffmpeg.wasm** (opcional) | Para thumbnails de video y GIFs |
| Almacenamiento | **localStorage + blob URLs** | 100% cliente, sin backend |
| Package name | `@stealthis/preview` | Siguiendo convencion del monorepo |

---

## Fases

### Fase 1 — Scaffolding y upload basico

**Objetivo:** Proyecto funcional con carga de archivos y preview crudo.

| Tarea | Detalle |
|---|---|
| Scaffold Astro app | `apps/preview/`, `astro.config.mjs`, `tsconfig.json`, `package.json` |
| Layout base | Header con nombre "Preview", area principal con drag & drop |
| Upload component (React island) | Drag & drop + click para subir imagen/video/GIF |
| Raw preview | Mostrar el archivo subido en tamano original |
| Integracion monorepo | Alias `@lib`, `@components`. Script `dev:preview` en root `package.json` |

### Fase 2 — Mockups de plataformas (imagenes estaticas)

**Objetivo:** Mostrar la imagen subida dentro de mockups realistas de cada red social.

| Tarea | Detalle |
|---|---|
| Componente `<PlatformFrame>` | Wrapper generico que recibe plataforma + formato y renderiza el chrome (header, avatar, botones, like/comment) |
| Instagram Post mock | Frame con avatar, username, imagen 1:1, iconos de like/comment/share/save |
| Instagram Story mock | Frame 9:16 con barra superior, avatar, indicador de progreso |
| X Tweet mock | Frame con avatar, nombre, handle, imagen 16:9, iconos de reply/retweet/like |
| Facebook Post mock | Frame con avatar, nombre, fecha, imagen, reacciones |
| LinkedIn Post mock | Frame con avatar, nombre, titulo, imagen 1.91:1, reacciones |
| YouTube Thumbnail mock | Preview card con thumbnail 16:9, titulo, canal, views |
| TikTok Feed mock | Frame 9:16 con overlays laterales (like, comment, share) y texto inferior |
| Selector de plataforma | Tabs o grid para elegir que plataformas ver simultáneamente |

### Fase 3 — Crop inteligente y safe zones

**Objetivo:** El usuario ve exactamente que parte de su imagen se muestra en cada formato.

| Tarea | Detalle |
|---|---|
| Auto-crop por aspect ratio | Recortar automaticamente al ratio de cada plataforma (center crop) |
| Crop manual | Drag para ajustar la zona visible dentro de cada frame |
| Safe zones overlay | Lineas guia mostrando donde NO poner texto/logos (esquinas de stories, zona de botones de TikTok) |
| Zoom/pan | Pellizcar o scroll para ajustar el encuadre dentro de cada mockup |
| Indicador de resolucion | Mostrar si la imagen cumple resolucion minima recomendada por plataforma |

### Fase 4 — Video y GIF preview

**Objetivo:** Soporte completo para contenido multimedia.

| Tarea | Detalle |
|---|---|
| Video upload | Aceptar MP4, MOV, WebM |
| Video en frame | Reproducir video dentro del mockup de cada plataforma |
| GIF upload | Aceptar GIF animados |
| Thumbnail extractor | Seleccionar frame del video como thumbnail (YouTube, TikTok) |
| Aspect ratio warning | Alertar si el video no cumple el ratio recomendado |
| Duracion check | Indicar si el video excede limites (60s Stories, 90s Reels, 60s TikTok, etc.) |

### Fase 5 — Texto y metadata preview

**Objetivo:** Preview completo incluyendo copy, hashtags, titulo.

| Tarea | Detalle |
|---|---|
| Campos de texto | Titulo, descripcion/caption, hashtags |
| Truncamiento realista | Mostrar "...ver mas" como lo haria cada plataforma |
| Preview de hashtags | Resaltar hashtags en azul como en la plataforma real |
| Conteo de caracteres | Limites por plataforma (X: 280, LinkedIn: 3000, etc.) con indicador visual |
| Username/avatar mock | Editar nombre y avatar que aparece en el mockup |
| Timestamp mock | Mostrar "hace 2 min", "3h", etc. como cada plataforma |

### Fase 6 — Comparador side-by-side y export

**Objetivo:** Vista comparativa y exportacion util.

| Tarea | Detalle |
|---|---|
| Grid comparativo | Ver 2, 4 o 6 plataformas lado a lado |
| Toggle dark/light | Preview en modo oscuro y claro de cada plataforma |
| Export como PNG | Capturar el mockup completo (frame + contenido) como imagen |
| Export como PDF | Generar un documento con todos los previews para aprobacion de cliente |
| Compartir via link | Generar URL temporal con el preview (usando hash/base64 de la config) |

### Fase 7 — Ads y formatos avanzados

**Objetivo:** Soporte para formatos publicitarios y especiales.

| Tarea | Detalle |
|---|---|
| Facebook/Instagram Ad | Formatos: single image, carousel, collection |
| Google Display Ads | Banners en ratios estandar (300x250, 728x90, 160x600) |
| YouTube Pre-roll | Preview de ad antes de video (skippable/non-skippable) |
| LinkedIn Sponsored | Post patrocinado con CTA button |
| Carousel preview | Multiples imagenes con swipe/scroll horizontal |
| A/B comparison | Subir 2 versiones del mismo contenido y comparar lado a lado en cada plataforma |

### Fase 8 — UX polish y features avanzados

**Objetivo:** Pulir la experiencia y agregar features pro.

| Tarea | Detalle |
|---|---|
| Responsive (la app misma) | Mobile-friendly para revisar previews desde el telefono |
| Presets de contenido | Templates pre-cargados para probar rapidamente |
| History/undo | Historial de uploads recientes en localStorage |
| Keyboard shortcuts | `1-6` para cambiar plataforma, `D` para dark mode, `E` para export |
| Accessibility | Contraste, focus management, screen reader labels |
| i18n (EN/ES) | Siguiendo el patron del monorepo con `useTranslations` |
| Onboarding | Tour rapido la primera vez que se usa la herramienta |

---

## Estructura de archivos (proyectada)

```
apps/preview/
├── astro.config.mjs
├── package.json
├── tsconfig.json
├── tailwind.config.mjs
├── public/
│   └── favicon.svg
├── src/
│   ├── layouts/
│   │   └── Base.astro
│   ├── pages/
│   │   └── index.astro
│   ├── components/
│   │   ├── UploadZone.tsx          # React island — drag & drop
│   │   ├── PlatformSelector.tsx    # Tabs/grid de plataformas
│   │   ├── PlatformFrame.tsx       # Wrapper generico de mockup
│   │   ├── PreviewGrid.tsx         # Grid comparativo
│   │   ├── CropEditor.tsx          # Crop manual + safe zones
│   │   ├── TextFields.tsx          # Caption, titulo, hashtags
│   │   ├── ExportPanel.tsx         # PNG/PDF export
│   │   └── frames/
│   │       ├── InstagramPost.tsx
│   │       ├── InstagramStory.tsx
│   │       ├── TikTokFeed.tsx
│   │       ├── YouTubeThumbnail.tsx
│   │       ├── YouTubeShorts.tsx
│   │       ├── XTweet.tsx
│   │       ├── LinkedInPost.tsx
│   │       ├── FacebookPost.tsx
│   │       └── FacebookStory.tsx
│   ├── lib/
│   │   ├── platforms.ts            # Configs: ratios, resoluciones, limites
│   │   ├── crop.ts                 # Logica de auto-crop por ratio
│   │   ├── export.ts               # html-to-image / canvas export
│   │   └── constants.ts
│   ├── i18n/
│   │   └── index.ts
│   └── styles/
│       └── global.css
└── PREVIEW_ROADMAP.md
```

---

## Fuentes oficiales y especificaciones por plataforma

> **Nota:** Las especificaciones cambian periodicamente. Siempre verificar contra las fuentes oficiales listadas. Ultima verificacion: marzo 2026.

---

### Instagram / Meta

**Fuentes oficiales:**
- Meta Ads Guide (fuente canonica, interactiva): https://www.facebook.com/business/ads-guide
- Instagram Help Center — formatos soportados: https://help.instagram.com/1631821640426723
- Meta Business Help Center: https://www.facebook.com/business/help

| Formato | Ratio | Resolucion recomendada | Max archivo | Duracion |
|---|---|---|---|---|
| Post (cuadrado) | 1:1 | 1080 x 1080 px | 30 MB | — |
| Post (retrato) | 4:5 | 1080 x 1350 px | 30 MB | — |
| Post (landscape) | 1.91:1 | 1080 x 566 px | 30 MB | — |
| Story | 9:16 | 1080 x 1920 px | 30 MB img / 4 GB video | 60s por segmento |
| Reel | 9:16 | 1080 x 1920 px | 4 GB | Hasta 90s |
| Carousel | Mismo que post | Mismo que post | 30 MB por slide | Hasta 20 slides |
| Video (feed) | 1:1, 4:5, 16:9 | 1080 x 1080+ px | 4 GB | 3s a 60 min |
| Profile picture | 1:1 (circular) | 320 x 320 px min | — | — |
| Ad (feed imagen) | 1:1 recomendado | 1080 x 1080 px min | 30 MB | — |
| Ad (stories/reels) | 9:16 | 1080 x 1920 px | 4 GB | 1-120s stories, 1-90s reels |

**Formatos de archivo:** JPG, PNG (imagenes), MP4, MOV (video)

---

### TikTok

**Fuentes oficiales:**
- TikTok Help Center: https://support.tiktok.com
- TikTok Ads Help — especificaciones de anuncios: https://ads.tiktok.com/help/article/tiktok-ad-specifications
- TikTok Creator Portal: https://www.tiktok.com/creators/creator-portal/

| Formato | Ratio | Resolucion recomendada | Max archivo | Duracion |
|---|---|---|---|---|
| Feed video | 9:16 (recomendado), 1:1, 16:9 | 1080 x 1920 px | 287 MB (iOS), 72 MB (Android), 500 MB (web) | 3s a 10 min |
| Profile picture | 1:1 (circular) | 200 x 200 px min | ~5 MB | — |
| Thumbnail / Cover | 9:16 | 1080 x 1920 px | — | Frame de video o custom |
| In-Feed Ad | 9:16, 1:1, 16:9 | 720 x 1280 px+ | 500 MB | 5-60s (9-15s recomendado) |
| Spark Ad (imagen) | 16:9 o 9:16 | 1200 x 628 o 720 x 1280 px | 500 KB por imagen | — |

**Formatos de archivo:** MP4, MOV, WebM (video organico), MP4, MOV, MPEG, 3GP, AVI (ads)
**Frame rate recomendado:** 30 fps o superior
**Bit rate minimo (ads):** 516 kbps

---

### YouTube

**Fuentes oficiales:**
- Thumbnail specs: https://support.google.com/youtube/answer/72431
- Upload specs: https://support.google.com/youtube/answer/57407
- Channel art/banner: https://support.google.com/youtube/answer/2972003
- Shorts specs: https://support.google.com/youtube/answer/10059070
- Google Ads video specs: https://support.google.com/google-ads/answer/1722096

| Formato | Ratio | Resolucion recomendada | Max archivo | Duracion |
|---|---|---|---|---|
| Thumbnail | 16:9 | 1280 x 720 px (min width 640) | 2 MB | — |
| Video estandar | 16:9 | 1920 x 1080 (1080p) o 3840 x 2160 (4K) | 256 GB | Hasta 12 horas |
| Shorts | 9:16 | 1080 x 1920 px | — | Hasta 60s (3 min para algunos) |
| Channel banner | ~6.2:1 | 2560 x 1440 px (safe area: 1546 x 423 px centrado) | 6 MB | — |
| In-stream ad | 16:9 o 9:16 | Mismo que video estandar | — | Variable (bumper: max 6s) |
| Companion banner (ad) | 5:1 | 300 x 60 px | — | — |

**Formatos de archivo:** MOV, MP4, AVI, WMV, FLV, 3GPP, WebM, MPEG-PS
**Formatos thumbnail:** JPG, GIF, PNG

---

### X (Twitter)

**Fuentes oficiales:**
- Media en posts: https://help.x.com/en/using-x/post-with-photos-or-gifs
- Creative specs para ads: https://business.x.com/en/help/ad-formats/creative-specifications
- API media best practices: https://developer.x.com/en/docs/twitter-api/v1/media/upload-media/uploading-media/media-best-practices

| Formato | Ratio | Resolucion recomendada | Max archivo | Duracion |
|---|---|---|---|---|
| Tweet con imagen | 16:9 | 1200 x 675 px | 5 MB | — |
| Tweet con video | 1:2.39 a 2.39:1 | 1920 x 1200 px | 512 MB | Hasta 2 min 20s |
| Profile picture | 1:1 (circular) | 400 x 400 px | 2 MB | — |
| Header / Banner | 3:1 | 1500 x 500 px | 5 MB | — |
| Promoted image (ad) | 1.91:1 o 1:1 | 1200 x 675 o 1200 x 1200 px | 5 MB | — |
| Promoted video (ad) | 1:1 o 16:9 | 1200 x 1200 o 1920 x 1080 px | 1 GB | Hasta 2 min 20s |
| Carousel (ad) | 1.91:1 o 1:1 | 800 x 418 o 800 x 800 px | — | 2-6 cards |

**Formatos de archivo:** JPG, PNG, GIF, WEBP (imagenes), MP4 H.264 + AAC (video)
**Frame rate max:** 40 fps

---

### LinkedIn

**Fuentes oficiales:**
- LinkedIn Ad Specifications: https://www.linkedin.com/help/lms/answer/a427660
- LinkedIn Marketing Solutions: https://business.linkedin.com/marketing-solutions/ads
- LinkedIn Ads Guide: https://business.linkedin.com/marketing-solutions/success/ads-guide

| Formato | Ratio | Resolucion recomendada | Max archivo | Duracion |
|---|---|---|---|---|
| Post (landscape) | 1.91:1 | 1200 x 627 px | 5 MB | — |
| Post (cuadrado) | 1:1 | 1080 x 1080 px | 5 MB | — |
| Post (retrato) | 4:5 | 1080 x 1350 px | 5 MB | — |
| Article cover | ~1.86:1 | 1200 x 644 px | — | — |
| Video (organico) | 1:2.4 a 2.4:1 | 1920 x 1080 px | 5 GB | 3s a 10 min |
| Profile picture | 1:1 | 400 x 400 px (min 200) | 8 MB | — |
| Profile banner | 4:1 | 1584 x 396 px | 8 MB | — |
| Company page banner | ~5.9:1 | 1128 x 191 px | — | — |
| Sponsored image (ad) | 1.91:1 o 1:1 | 1200 x 627 o 1080 x 1080 px | 5 MB | — |
| Sponsored video (ad) | 16:9, 1:1, 9:16 | 1920 x 1080 px | 200 MB | 3s a 30 min |
| Carousel (ad) | 1:1 | 1080 x 1080 px | 10 MB por card | 2-10 cards |
| Message ad banner | ~1.2:1 | 300 x 250 px | 2 MB | — |

**Formatos de archivo:** JPG, PNG, GIF (imagenes), MP4 recomendado, ASF, AVI, FLV, MOV, MPEG, MKV (video)

---

### Facebook / Meta

**Fuentes oficiales:**
- Meta Ads Guide (fuente canonica interactiva): https://www.facebook.com/business/ads-guide
- Image specs: https://www.facebook.com/business/help/469767027114079
- Ad specs generales: https://www.facebook.com/business/help/103816146375741
- Sharing best practices (developers): https://developers.facebook.com/docs/sharing/best-practices

| Formato | Ratio | Resolucion recomendada | Max archivo | Duracion |
|---|---|---|---|---|
| Post (landscape) | 1.91:1 | 1200 x 630 px | 30 MB | — |
| Post (cuadrado) | 1:1 | 1080 x 1080 px | 30 MB | — |
| Post (retrato) | 4:5 | 1080 x 1350 px | 30 MB | — |
| Story | 9:16 | 1080 x 1920 px | 30 MB img / 4 GB video | 60s por card |
| Reel | 9:16 | 1080 x 1920 px | 4 GB | Hasta 90s (algunos 15 min) |
| Video (feed) | 16:9, 1:1, 4:5, 9:16 | 1280 x 720 px min | 4-10 GB | Hasta 240 min |
| Cover photo | ~2.63:1 | 820 x 312 px (desktop), 640 x 360 px (mobile) | < 100 KB recomendado | — |
| Event cover | ~1.91:1 | 1200 x 628 px (o 1920 x 1005) | — | — |
| Profile picture | 1:1 (circular) | 170 x 170 px (176 desktop, 128 mobile) | — | — |
| Ad feed imagen | 1:1 | 1080 x 1080 px | 30 MB | — |
| Ad stories | 9:16 | 1080 x 1920 px | 30 MB img / 4 GB video | — |
| Ad carousel | 1:1 | 1080 x 1080 px por card | 30 MB por card | — |
| Ad right column | 1.91:1 | 1200 x 628 px | 30 MB | — |

**Formatos de archivo:** JPG, PNG (imagenes), MP4, MOV H.264 + AAC (video)
**Safe zones (Stories/Reels):** Mantener contenido clave fuera del 15% superior y 20% inferior (overlays de UI)

---

## Resumen rapido de ratios por formato

| Formato | Instagram | TikTok | YouTube | X | LinkedIn | Facebook |
|---|---|---|---|---|---|---|
| Post/Feed | 1:1, 4:5 | 9:16 | — | 16:9 | 1.91:1, 1:1 | 1.91:1, 1:1 |
| Story/Reel | 9:16 | 9:16 | 9:16 (Shorts) | — | — | 9:16 |
| Video | 1:1, 4:5, 16:9 | 9:16 | 16:9 | libre | libre | libre |
| Thumbnail | — | 9:16 | 16:9 | — | — | — |
| Profile | 1:1 | 1:1 | — | 1:1 | 1:1 | 1:1 |
| Banner/Header | — | — | 16:9~ | 3:1 | 4:1 | 2.63:1 |

---

## Notas de implementacion

- **Zero backend:** Todo corre en el navegador. Imagenes/videos nunca salen del cliente.
- **Privacy first:** Ningun archivo se sube a ningun servidor. Solo blob URLs y localStorage.
- **Mockups CSS-only:** Los frames de cada plataforma se construyen con HTML/CSS puro (no screenshots). Esto permite actualizarlos facilmente cuando las plataformas cambien su UI.
- **Modular frames:** Cada frame es un componente independiente. Agregar una nueva plataforma o formato = agregar un nuevo componente en `frames/`.
- **Responsive mockups:** Los mockups se escalan proporcionalmente para caber en la pantalla, manteniendo el aspect ratio correcto.
