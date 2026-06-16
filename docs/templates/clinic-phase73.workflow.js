// ===========================================================================
// Phase 73 — Remotion: Clinic / Healthcare videos 🏥
// 12 recursos · remotion category · react.tsx snippet only
// ===========================================================================

export const meta = {
  name: 'clinic-phase73-remotion',
  description: 'Phase 73 — 12 Remotion clinic/healthcare video compositions',
  phases: [{ title: 'Generate', detail: 'un agente por recurso remotion' }],
}

const BASE = '/Volumes/ExternalDisk/experimentalLabs/stealthis/packages/content/resources'

// ── Remotion design system ────────────────────────────────────────────────────
// Dark-video palette + clinic teal accent. All clips 1080×1920 (vertical) unless
// the spec says 16:9. FPS 30. Inline React styles only (no CSS files).
const STYLE = `REMOTION DESIGN SYSTEM (follow exactly):
- All code is pure TypeScript/React/Remotion. No external CSS or HTML files.
- Import ONLY from "remotion": AbsoluteFill, Composition, interpolate, spring,
  useCurrentFrame, useVideoConfig (and Sequence / Audio / Img if needed).
- No external image/audio URLs — use SVG shapes or CSS gradients for visuals.
- Color palette (CSS-in-JS values):
    BG        = "#0a1a18"   (deep clinic dark)
    TEAL      = "#12b5a8"   (primary accent)
    TEAL_SOFT = "#e7f5f3"
    WHITE     = "#ffffff"
    CORAL     = "#ff7a66"
    MUTED     = "#6b9e99"
    OK        = "#2f9e6f"
    DANGER    = "#d4503e"
    WARN      = "#d98a2b"
- Font: system-ui, -apple-system, "Segoe UI", sans-serif (no Google Fonts in Remotion).
- Default resolution: 1080 × 1920 (vertical short / story format) unless spec says 16:9.
- Default FPS: 30.
- Spring animations: config { damping: 14, stiffness: 120 } unless otherwise specified.
- interpolate clamp both ends (extrapolateLeft:"clamp", extrapolateRight:"clamp").
- Every composition MUST export a named component AND a RemotionRoot with <Composition>.
- Realistic but clearly fictional clinic names/data (e.g. "Greenfield Medical Center",
  "Dr. Elena Reyes", "Sarah M., Patient since 2023").
- DISCLAIMER: every index.mdx body must end with:
  > Illustrative UI only — **not** intended for real medical use.`

function buildPrompt(s) {
  const dir = `${BASE}/${s.slug}`
  const fps = s.fps || 30
  const frames = s.durationFrames || 150  // 5 s default
  const w = s.width || 1080
  const h = s.height || 1920

  return `You are generating ONE production-quality Remotion animation resource for a healthcare/clinic video library. It must be visually polished, fully animated, and self-contained.

${STYLE}

RESOURCE: ${s.slug}
TITLE: ${s.title}
DURATION: ${frames} frames at ${fps} fps (${(frames/fps).toFixed(1)} s)
RESOLUTION: ${w} × ${h}
DIFFICULTY: ${s.difficulty}
WHAT TO BUILD: ${s.build}

FILES TO WRITE (use the Write tool, absolute paths):

1. ${dir}/index.mdx
   Frontmatter EXACTLY as shown (fill description yourself):
---
slug: ${s.slug}
title: "${s.title}"
description: "<ONE-LINE rich description, 55-90 words, no internal double-quotes>"
category: remotion
type: animation
tags: [remotion, clinic, healthcare${s.tags ? ', ' + s.tags : ''}]
tech: [remotion, react, typescript]
difficulty: ${s.difficulty}
targets: [react]
collections: [remotion]
license: MIT
author:
  name: "Stealthis"
  src: "https://github.com/Foodhy/stealthis"
createdAt: 2026-06-13
updatedAt: 2026-06-13
---

## ${s.title.replace(/^.*— /, '').replace(/ \(Remotion\)$/, '')}

<2-3 short paragraphs describing the animation, its timeline, and how to customize it.>

### Composition specs

| Property | Value |
|---|---|
| Resolution | ${w} × ${h} |
| FPS | ${fps} |
| Duration | ${(frames/fps).toFixed(1)} s (${frames} frames) |

### Timeline

<markdown table with Time | Action rows>

### Customization

<short bullet list of constants the user can change>

> Illustrative UI only — **not** intended for real medical use.

2. ${dir}/snippets/react.tsx
   Full working Remotion composition. Must:
   - Have all config constants at the top (clinic name, colors, text, etc.)
   - Break into small named sub-components (no single 300-line render)
   - Export named main component + RemotionRoot with <Composition id="${s.compId}" ...>
   - Use spring() and interpolate() for all motion — no CSS transitions
   - Look polished: gradients, layered text, subtle glow/shadow, clean layout

QUALITY BAR: real-feeling healthcare data, smooth layered animations, distinct visual
identity. No placeholder text or TODO comments.

After writing the files, return your result.`
}

// ── Phase 73 specs ────────────────────────────────────────────────────────────
const SPECS = [
  {
    slug: 'remotion-clinic-promo',
    title: 'Clinic Promo Video (Remotion)',
    compId: 'ClinicPromo',
    difficulty: 'med',
    durationFrames: 270, // 9 s
    width: 1080,
    height: 1920,
    tags: 'promo, branding, services',
    build: `A 9-second vertical promo for a fictional medical clinic "Greenfield Medical Center".
Scene 1 (0–2 s): Clinic logo (text + cross icon) scales in with spring, tagline fades up.
Scene 2 (2–5 s): Three service pills (💊 Primary Care · 🩺 Specialist · 🧪 Lab Tests)
  slide in from the left with stagger, each with a teal background pill.
Scene 3 (5–7.5 s): Bold CTA headline "Book Your Appointment Today" with a coral underline
  animating in. A phone number types in character by character.
Scene 4 (7.5–9 s): Soft outro — teal gradient sweep, clinic name fades back in.
Background: deep dark BG with a subtle radial teal glow in the center.`,
  },
  {
    slug: 'remotion-health-tip',
    title: 'Health Tip Animation (Remotion)',
    compId: 'HealthTip',
    difficulty: 'easy',
    durationFrames: 150, // 5 s
    tags: 'tip, education, wellness',
    build: `A 5-second vertical "Health Tip of the Day" animation card.
A large pill/capsule icon (drawn with SVG rects/circles inline) drops in with spring.
The tip text reveals word-by-word: "Drink 8 glasses of water daily to stay hydrated and
boost energy levels." Below it, a progress bar fills to show "Hydration goal: 8 glasses"
with an animated fill (interpolate from 0 to 100% over 60 frames starting at frame 60).
Bottom: "Greenfield Medical Center · Wellness Tips" fades in.
Palette: use TEAL on dark BG, clean white text.`,
  },
  {
    slug: 'remotion-appointment-reminder',
    title: 'Appointment Reminder Clip (Remotion)',
    compId: 'AppointmentReminder',
    difficulty: 'easy',
    durationFrames: 180, // 6 s
    tags: 'appointment, reminder, calendar',
    build: `A 6-second vertical reminder clip for a doctor appointment.
A calendar icon (drawn inline SVG or CSS shapes) bounces in with spring.
Patient name "Sarah M." fades in above the card.
A reminder card slides up: Doctor "Dr. Elena Reyes", specialty "Cardiology",
date "Friday, June 20 · 10:30 AM", clinic "Greenfield Medical Center".
Each field of the card reveals sequentially with stagger (every 12 frames).
A pulsing notification dot (scale spring loop) sits on the calendar corner.
CTA: "Confirm Appointment" button fades in at the bottom, teal background.`,
  },
  {
    slug: 'remotion-service-highlight',
    title: 'Service Highlight Video (Remotion)',
    compId: 'ServiceHighlight',
    difficulty: 'med',
    durationFrames: 240, // 8 s
    tags: 'services, features, carousel',
    build: `An 8-second vertical video cycling through 3 clinic services using Sequence.
Each service occupies 80 frames.
Service 1 — "🩺 General Checkups": icon + title + one-line description slides in from right,
  a soft teal card fills the background.
Service 2 — "🧪 Lab & Diagnostics": same pattern, coral accent.
Service 3 — "💉 Vaccinations & Preventive Care": same pattern, green accent.
Between services: a 10-frame cross-fade (interpolate opacity).
Bottom bar: clinic name always visible, a dot indicator shows which service is active.
Background: dark BG with per-service radial gradient behind the card.`,
  },
  {
    slug: 'remotion-medication-guide',
    title: 'Medication Guide Video (Remotion)',
    compId: 'MedicationGuide',
    difficulty: 'med',
    durationFrames: 270, // 9 s
    width: 1280,
    height: 720, // 16:9 explainer
    tags: 'medication, guide, education',
    build: `A 9-second 16:9 explainer for taking a fictional medication "Cardomax 10mg".
Left panel (slides in from left): large pill icon + drug name + "10 mg · Once daily".
Right panel (fades in with stagger):
  Step 1 icon (clock) + "Take with food in the morning"
  Step 2 icon (water drop) + "Drink a full glass of water"
  Step 3 icon (calendar check) + "Do not skip doses"
Each step has a teal check circle that scales in with spring.
Bottom: "Consult your doctor before making any changes." in small MUTED text.
Background: white-ish (#f1f7f6) with dark text (ink color) — light mode 16:9 format.`,
  },
  {
    slug: 'remotion-symptom-clip',
    title: 'Symptom Info Clip (Remotion)',
    compId: 'SymptomClip',
    difficulty: 'med',
    durationFrames: 210, // 7 s
    tags: 'symptoms, health, information',
    build: `A 7-second vertical clip about common cold symptoms, styled as an info card.
Title "🤧 Common Cold — Know the Signs" drops in from top with spring.
4 symptom chips appear in a 2×2 grid with stagger (every 15 frames):
  "Runny Nose" · "Sore Throat" · "Mild Fever" · "Body Aches"
  Each chip has a soft icon (emoji) + label + colored dot (warn/coral).
After the grid: "When to See a Doctor" section slides up with a DANGER-colored border:
  "Fever above 39°C · Difficulty breathing · Symptoms lasting 10+ days"
Footer: "Greenfield Medical Center · Ask your doctor."
Background: dark BG, coral/warn accents for urgency signals.`,
  },
  {
    slug: 'remotion-clinic-hours',
    title: 'Clinic Hours Card (Remotion)',
    compId: 'ClinicHours',
    difficulty: 'easy',
    durationFrames: 150, // 5 s
    tags: 'hours, schedule, info',
    build: `A 5-second vertical card showing clinic operating hours.
Header: clock icon (SVG circle + hands) with a rotation animation (interpolate 0→360 over 120 frames),
  "Greenfield Medical Center" name + "Operating Hours" subtitle.
Hours list reveals with stagger (every 8 frames):
  Mon–Fri: 8:00 AM – 6:00 PM   (teal dot)
  Saturday: 9:00 AM – 2:00 PM  (teal dot)
  Sunday:   Closed              (coral dot + "Emergency only" label)
A "Today is Open" banner with a pulsing green dot slides in from the bottom at frame 90.
Background: dark BG, clean minimal layout, white text, strong hierarchy.`,
  },
  {
    slug: 'remotion-doctor-intro',
    title: 'Doctor Intro Video (Remotion)',
    compId: 'DoctorIntro',
    difficulty: 'easy',
    durationFrames: 180, // 6 s
    tags: 'doctor, profile, introduction',
    build: `A 6-second vertical "Meet Your Doctor" intro card.
A large circular avatar placeholder (CSS circle with initials "ER" on a teal bg) scales in with spring.
Name "Dr. Elena Reyes" fades up below, then specialty "Cardiologist · MD, PhD" on the next line.
Three credential pills appear with stagger: "15+ Years Exp." · "Board Certified" · "500+ Reviews ⭐".
A subtle shimmer animation (interpolate translateX from -100% to 100%) sweeps across the card at frame 90.
Bottom CTA: "Book a Consultation" button in teal, fades in with spring scale.
Background: dark BG with soft teal radial glow behind the avatar.`,
  },
  {
    slug: 'remotion-patient-testimonial',
    title: 'Patient Testimonial Video (Remotion)',
    compId: 'PatientTestimonial',
    difficulty: 'med',
    durationFrames: 210, // 7 s
    tags: 'testimonial, review, patient',
    build: `A 7-second vertical patient testimonial for a clinic.
Card fades in over 15 frames.
5 star icons fill one by one with spring scale stagger (starting frame 20, 8 frames apart).
Quote text reveals word-by-word (interpolate opacity per word, starting frame 50):
  "Dr. Reyes was incredibly patient and thorough. I finally got answers
   after years of uncertainty. Highly recommend Greenfield Medical."
At frame 140: Avatar circle (initials "SM", teal bg) + name "Sarah M." +
  "Patient since 2021" slide in from left with spring.
Background: dark BG, teal brand color for stars and name highlight.`,
  },
  {
    slug: 'remotion-wellness-stat',
    title: 'Wellness Stat Animation (Remotion)',
    compId: 'WellnessStat',
    difficulty: 'easy',
    durationFrames: 150, // 5 s
    tags: 'stats, wellness, data, numbers',
    build: `A 5-second vertical animated stat card showing a single wellness metric.
Stat: "94% of patients reported improved health after 3 months of care."
Large number "94%" in TEAL, font-size 120px, counts up from 0 to 94 over 90 frames
  using Math.round(interpolate(frame, [0,90], [0,94])).
Below it, "of patients reported improved health" fades in at frame 60.
A teal arc/progress ring (SVG circle with strokeDashoffset animated) fills to 94% simultaneously.
Bottom: "Greenfield Medical Center · 2025 Patient Satisfaction Survey" in MUTED text.
Background: dark BG with very subtle teal glow.`,
  },
  {
    slug: 'remotion-vaccine-info',
    title: 'Vaccine Info Clip (Remotion)',
    compId: 'VaccineInfo',
    difficulty: 'med',
    durationFrames: 240, // 8 s
    tags: 'vaccine, prevention, health',
    build: `An 8-second vertical vaccine awareness clip.
Title "💉 Stay Protected — Vaccination Guide" fades in from top.
Three vaccine info panels appear sequentially (each in a Sequence of 70 frames):
  Panel 1: "Flu Vaccine · Annual · Recommended for all ages 6 months+"
           Icon: syringe shape (inline SVG), teal accent
  Panel 2: "COVID-19 Booster · Every 6–12 months · Check with your doctor"
           Icon: shield shape, coral accent
  Panel 3: "Hepatitis B · 3-dose series · Lifetime protection"
           Icon: circular check, green accent
Each panel slides up from bottom and fades out at the end of its sequence.
Final frame (from 210): "Book your vaccination at Greenfield Medical Center" CTA.
Background: dark BG with per-panel color accent radial glow.`,
  },
  {
    slug: 'remotion-emergency-info',
    title: 'Emergency Info Card (Remotion)',
    compId: 'EmergencyInfo',
    difficulty: 'easy',
    durationFrames: 180, // 6 s
    tags: 'emergency, urgent, contact',
    build: `A 6-second vertical emergency information card.
A pulsing red circle (scale: spring between 0.95 and 1.05, looped via Math.sin)
  with a "🚨" or bold "!" at center scales in at frame 0.
"Emergency?" headline in DANGER color fades in, font-size 64px, bold.
Three emergency lines reveal with stagger (every 15 frames):
  "🏥 Emergency Room: Open 24/7"
  "📞 Emergency Line: (800) 555-9911"
  "🚑 Ambulance: Call 911"
Each line has a coral/danger left border and slides in from left with spring.
Footer: "Greenfield Medical Center · For life-threatening emergencies call 911 immediately."
  in small MUTED text.
Background: dark BG, DANGER/coral accents, high urgency feel.`,
  },
]

phase('Generate')
log(`Phase 73 — generando ${SPECS.length} recursos Remotion para Clinic/Healthcare…`)

const RESULT = {
  type: 'object',
  properties: {
    slug: { type: 'string' },
    files: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
  },
  required: ['slug', 'files'],
}

const results = await parallel(
  SPECS.map((s) => () =>
    agent(buildPrompt(s), {
      label: s.slug,
      phase: 'Generate',
      agentType: 'general-purpose',
      schema: RESULT,
    })
  )
)

const ok = results.filter(Boolean)
return {
  requested: SPECS.length,
  completed: ok.length,
  resources: ok.map((r) => ({ slug: r.slug, fileCount: (r.files || []).length })),
}
