import { TypewriterAnimation } from "./animations/01-Typewriter";
import { SpringBounceAnimation } from "./animations/02-SpringBounce";
import { BarChartAnimation } from "./animations/03-BarChart";
import { SlideshowAnimation } from "./animations/04-Slideshow";
import { CounterAnimation } from "./animations/05-Counter";
import { FadeSlideAnimation } from "./animations/06-FadeSlide";
import { PieChartAnimation } from "./animations/07-PieChart";
import { SkillsPresentationAnimation } from "./animations/08-SkillsPresentation";

import { YoutubeIntro } from "./animations/remotion-intro";
import { YoutubeOutro } from "./animations/remotion-outro";
import { LowerThird } from "./animations/remotion-lower-third";
import { LogoReveal } from "./animations/remotion-logo-reveal";
import { InstagramStory } from "./animations/remotion-instagram";
import { TiktokVideo } from "./animations/remotion-tiktok";
import { LinkedInPost } from "./animations/remotion-linkedin";
import { CTAAnimation } from "./animations/remotion-cta";
import { TestimonialVideo } from "./animations/remotion-testimonial";
import { Sumbnail } from "./animations/remotion-sumbnail";
import { ChartBar } from "./animations/remotion-chart";
import { AnimatedCounter } from "./animations/remotion-counter";
import { AnimatedTimeline } from "./animations/remotion-timeline";

import { KineticText } from "./animations/remotion-kinetic-text";
import { PodcastAudiogram } from "./animations/remotion-podcast-audiogram";
import { ProductShowcase } from "./animations/remotion-product-showcase";
import { CodeWalkthrough } from "./animations/remotion-code-walkthrough";
import { CountdownVideo } from "./animations/remotion-countdown";
import { SplitScreen } from "./animations/remotion-split-screen";
import { NewsTicker } from "./animations/remotion-news-ticker";
import { ProgressRingVideo } from "./animations/remotion-progress-ring";

import { TextReveal } from "./animations/remotion-text-reveal";
import { SocialProof } from "./animations/remotion-social-proof";
import { LogoGrid } from "./animations/remotion-logo-grid";
import { PricingTable } from "./animations/remotion-pricing-table";
import { NotificationStack } from "./animations/remotion-notification";
import { MapPins } from "./animations/remotion-map-pins";
import { PhotoCollage } from "./animations/remotion-photo-collage";
import { QuoteCard } from "./animations/remotion-quote-card";
import { StepProcess } from "./animations/remotion-step-process";
import { GradientWave } from "./animations/remotion-gradient-wave";

export interface RemotionComposition {
  id: string;
  title: string;
  component: React.ComponentType;
  durationInFrames: number;
  fps: number;
  width: number;
  height: number;
  resourceSlug: string;
}

const FPS = 30;
const W = 1280;
const H = 720;

export const remotionCompositions: RemotionComposition[] = [
  // ── animation-via-remotion (original 8) ──────────────────────────────
  {
    id: "01-Typewriter",
    title: "Typewriter",
    component: TypewriterAnimation,
    durationInFrames: 5 * FPS,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "animation-via-remotion",
  },
  {
    id: "02-SpringBounce",
    title: "Spring Bounce",
    component: SpringBounceAnimation,
    durationInFrames: 4 * FPS,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "animation-via-remotion",
  },
  {
    id: "03-BarChart",
    title: "Bar Chart",
    component: BarChartAnimation,
    durationInFrames: 4 * FPS,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "animation-via-remotion",
  },
  {
    id: "04-Slideshow",
    title: "Slideshow",
    component: SlideshowAnimation,
    durationInFrames: Math.round((2.5 + 3 + 3.5) * FPS),
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "animation-via-remotion",
  },
  {
    id: "05-Counter",
    title: "Counter",
    component: CounterAnimation,
    durationInFrames: 5 * FPS,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "animation-via-remotion",
  },
  {
    id: "06-EasingCurves",
    title: "Easing Curves",
    component: FadeSlideAnimation,
    durationInFrames: 6 * FPS,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "animation-via-remotion",
  },
  {
    id: "07-PieChart",
    title: "Pie Chart",
    component: PieChartAnimation,
    durationInFrames: 4 * FPS,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "animation-via-remotion",
  },
  {
    id: "08-SkillsPresentation",
    title: "Skills Presentation",
    component: SkillsPresentationAnimation,
    durationInFrames: Math.round((3 + 3.5 + 4 + 4 + 3.5 + 4) * FPS),
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "animation-via-remotion",
  },

  // ── Phase 21 — Video Generators ──────────────────────────────────────
  {
    id: "remotion-intro",
    title: "YouTube Intro",
    component: YoutubeIntro,
    durationInFrames: 150,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-intro",
  },
  {
    id: "remotion-outro",
    title: "YouTube Outro",
    component: YoutubeOutro,
    durationInFrames: 600,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-outro",
  },
  {
    id: "remotion-lower-third",
    title: "Lower Third",
    component: LowerThird,
    durationInFrames: 120,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-lower-third",
  },
  {
    id: "remotion-logo-reveal",
    title: "Logo Reveal",
    component: LogoReveal,
    durationInFrames: 90,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-logo-reveal",
  },

  // ── Phase 21 — Social Media ───────────────────────────────────────────
  {
    id: "remotion-instagram",
    title: "Instagram Story",
    component: InstagramStory,
    durationInFrames: 450,
    fps: FPS,
    width: 1080,
    height: 1920,
    resourceSlug: "remotion-instagram",
  },
  {
    id: "remotion-tiktok",
    title: "TikTok Video",
    component: TiktokVideo,
    durationInFrames: 450,
    fps: FPS,
    width: 1080,
    height: 1920,
    resourceSlug: "remotion-tiktok",
  },
  {
    id: "remotion-linkedin",
    title: "LinkedIn Post",
    component: LinkedInPost,
    durationInFrames: 180,
    fps: FPS,
    width: 1200,
    height: 628,
    resourceSlug: "remotion-linkedin",
  },

  // ── Phase 21 — Content & Marketing ───────────────────────────────────
  {
    id: "remotion-cta",
    title: "Call to Action",
    component: CTAAnimation,
    durationInFrames: 120,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-cta",
  },
  {
    id: "remotion-testimonial",
    title: "Testimonial",
    component: TestimonialVideo,
    durationInFrames: 180,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-testimonial",
  },
  {
    id: "remotion-sumbnail",
    title: "Thumbnail Generator",
    component: Sumbnail,
    durationInFrames: 150,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-sumbnail",
  },

  // ── Phase 21 — Data Visualization ────────────────────────────────────
  {
    id: "remotion-chart",
    title: "Bar Chart",
    component: ChartBar,
    durationInFrames: 150,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-chart",
  },
  {
    id: "remotion-counter",
    title: "Number Counter",
    component: AnimatedCounter,
    durationInFrames: 120,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-counter",
  },
  {
    id: "remotion-timeline",
    title: "Timeline",
    component: AnimatedTimeline,
    durationInFrames: 240,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-timeline",
  },

  // ── Phase 25 — New Video Examples ──────────────────────────────────────
  {
    id: "remotion-kinetic-text",
    title: "Kinetic Typography",
    component: KineticText,
    durationInFrames: 150,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-kinetic-text",
  },
  {
    id: "remotion-podcast-audiogram",
    title: "Podcast Audiogram",
    component: PodcastAudiogram,
    durationInFrames: 300,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-podcast-audiogram",
  },
  {
    id: "remotion-product-showcase",
    title: "Product Showcase",
    component: ProductShowcase,
    durationInFrames: 210,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-product-showcase",
  },
  {
    id: "remotion-code-walkthrough",
    title: "Code Walkthrough",
    component: CodeWalkthrough,
    durationInFrames: 240,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-code-walkthrough",
  },
  {
    id: "remotion-countdown",
    title: "Event Countdown",
    component: CountdownVideo,
    durationInFrames: 210,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-countdown",
  },
  {
    id: "remotion-split-screen",
    title: "Split Screen",
    component: SplitScreen,
    durationInFrames: 180,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-split-screen",
  },
  {
    id: "remotion-news-ticker",
    title: "News Ticker",
    component: NewsTicker,
    durationInFrames: 450,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-news-ticker",
  },
  {
    id: "remotion-progress-ring",
    title: "Progress Ring",
    component: ProgressRingVideo,
    durationInFrames: 150,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-progress-ring",
  },

  // ── Phase 25b — More Video Examples ────────────────────────────────────
  {
    id: "remotion-text-reveal",
    title: "Text Reveal",
    component: TextReveal,
    durationInFrames: 210,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-text-reveal",
  },
  {
    id: "remotion-social-proof",
    title: "Social Proof",
    component: SocialProof,
    durationInFrames: 210,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-social-proof",
  },
  {
    id: "remotion-logo-grid",
    title: "Logo Grid",
    component: LogoGrid,
    durationInFrames: 180,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-logo-grid",
  },
  {
    id: "remotion-pricing-table",
    title: "Pricing Table",
    component: PricingTable,
    durationInFrames: 210,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-pricing-table",
  },
  {
    id: "remotion-notification",
    title: "Notification Stack",
    component: NotificationStack,
    durationInFrames: 210,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-notification",
  },
  {
    id: "remotion-map-pins",
    title: "Map Pins",
    component: MapPins,
    durationInFrames: 210,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-map-pins",
  },
  {
    id: "remotion-photo-collage",
    title: "Photo Collage",
    component: PhotoCollage,
    durationInFrames: 180,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-photo-collage",
  },
  {
    id: "remotion-quote-card",
    title: "Quote Card",
    component: QuoteCard,
    durationInFrames: 180,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-quote-card",
  },
  {
    id: "remotion-step-process",
    title: "Step Process",
    component: StepProcess,
    durationInFrames: 210,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-step-process",
  },
  {
    id: "remotion-gradient-wave",
    title: "Gradient Wave",
    component: GradientWave,
    durationInFrames: 300,
    fps: FPS,
    width: W,
    height: H,
    resourceSlug: "remotion-gradient-wave",
  },
];

// Legacy constants kept for backwards compatibility
export const COMPOSITION_WIDTH = W;
export const COMPOSITION_HEIGHT = H;
export const COMPOSITION_FPS = FPS;
