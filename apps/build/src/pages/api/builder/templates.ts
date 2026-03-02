import type { APIRoute } from "astro";

const templates = [
  {
    id: "astro-tailwind",
    label: "Astro + Tailwind",
    supportsBaas: ["none", "supabase", "firebase"],
  },
  {
    id: "next-tailwind",
    label: "Next.js + Tailwind",
    supportsBaas: ["none", "supabase", "firebase"],
  },
];

export const GET: APIRoute = () => {
  return new Response(JSON.stringify({ templates }), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "public, max-age=120",
    },
  });
};
