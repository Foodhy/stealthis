/**
 * Guardia SSRF.
 *
 * Este worker hace fetch a una URL que pega cualquiera en internet. Sin este
 * archivo eso es un SSRF abierto: alguien pide http://169.254.169.254/ y el
 * worker le devuelve credenciales de la nube, o pide una IP interna y usa
 * nuestro worker como escáner de puertos ajeno.
 *
 * La defensa tiene dos capas, y las dos hacen falta:
 *
 *   1. Filtro por hostname — barato, sincrónico, corta el 99% de los intentos.
 *   2. Resolución DNS por DoH — cierra el hueco que deja la capa 1: un dominio
 *      público que apunta a 127.0.0.1 pasa el filtro de texto pero no el de IP.
 *
 * Se comprueba en CADA salto de redirección, no solo en la URL original: un
 * 302 hacia la IP de metadatos es exactamente el mismo ataque con un rodeo.
 */

export type GuardResult = { ok: true; url: URL } | { ok: false; reason: string };

/** Hostnames que nunca se resuelven, se rechazan por texto. */
const HOST_DENY = [
  /^localhost$/i,
  /\.localhost$/i,
  /^.*\.local$/i,
  /^.*\.internal$/i,
  /^.*\.home\.arpa$/i,
  /^metadata\.google\.internal$/i,
];

/** Rangos IPv4 que no son internet pública. */
function isPrivateIPv4(ip: string): boolean {
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => !Number.isInteger(n) || n < 0 || n > 255)) return false;
  const [a, b] = p as [number, number, number, number];

  if (a === 0) return true; // 0.0.0.0/8 — "este host"
  if (a === 10) return true; // privada
  if (a === 127) return true; // loopback
  if (a === 169 && b === 254) return true; // link-local: incluye 169.254.169.254 (metadatos)
  if (a === 172 && b >= 16 && b <= 31) return true; // privada
  if (a === 192 && b === 168) return true; // privada
  if (a === 192 && b === 0) return true; // IETF protocol assignments
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a === 198 && (b === 18 || b === 19)) return true; // benchmarking
  if (a >= 224) return true; // multicast y reservada
  return false;
}

/** Rangos IPv6 que no son internet pública, incluidas las IPv4 embebidas. */
function isPrivateIPv6(ip: string): boolean {
  const s = ip.toLowerCase().replace(/^\[|\]$/g, "");
  if (s === "::" || s === "::1") return true; // sin especificar y loopback
  if (s.startsWith("fe80")) return true; // link-local
  if (/^f[cd]/.test(s)) return true; // unique local fc00::/7
  if (s.startsWith("ff")) return true; // multicast

  // ::ffff:127.0.0.1 y ::ffff:7f00:1 — la misma IPv4 privada con disfraz IPv6.
  const v4 = s.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})$/);
  if (v4 && (s.includes("::ffff:") || s.startsWith("::"))) return isPrivateIPv4(v4[1]);
  if (s.startsWith("::ffff:")) {
    const hex = s.slice(7).split(":");
    if (hex.length === 2) {
      const n = (Number.parseInt(hex[0], 16) << 16) | Number.parseInt(hex[1], 16);
      const dotted = [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join(".");
      return isPrivateIPv4(dotted);
    }
  }
  if (s.startsWith("64:ff9b::")) return true; // NAT64: puede traducir a privada
  return false;
}

export function isPrivateAddress(ip: string): boolean {
  return ip.includes(":") ? isPrivateIPv6(ip) : isPrivateIPv4(ip);
}

const IPV4 = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/;

/**
 * Capa 1 — validación sin red. Rechaza el esquema, el puerto y el host por
 * texto. No puede detectar un dominio que resuelve a una IP privada; de eso se
 * encarga `resolvesToPublicAddress`.
 */
export function checkUrlShape(raw: string): GuardResult {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return { ok: false, reason: "La URL no se puede interpretar." };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:")
    return { ok: false, reason: `Esquema no permitido: ${url.protocol.replace(":", "")}` };

  if (url.username || url.password)
    return { ok: false, reason: "La URL no puede llevar credenciales." };

  const host = url.hostname.replace(/^\[|\]$/g, "");

  if (!host) return { ok: false, reason: "La URL no tiene host." };
  if (HOST_DENY.some((re) => re.test(host)))
    return { ok: false, reason: `Host interno no permitido: ${host}` };

  // Host escrito como IP: se decide aquí mismo, sin consultar DNS.
  if (IPV4.test(host) || host.includes(":")) {
    if (isPrivateAddress(host)) return { ok: false, reason: `Dirección no pública: ${host}` };
    return { ok: true, url };
  }

  // Formas alternativas de escribir una IP (decimal, octal, hex) que el parser
  // de URL acepta pero que no parecen una IP a simple vista: 2130706433 = 127.0.0.1
  if (/^\d+$/.test(host) || /^0[xX][0-9a-fA-F]+$/.test(host))
    return { ok: false, reason: `Host numérico ambiguo: ${host}` };

  if (!host.includes(".")) return { ok: false, reason: `Host sin dominio: ${host}` };

  return { ok: true, url };
}

type DohAnswer = { data?: string; type?: number };

/**
 * Capa 2 — resuelve el host por DNS-over-HTTPS y comprueba que TODAS sus
 * direcciones sean públicas. Un dominio que apunta a 127.0.0.1 pasa la capa 1
 * y muere aquí.
 *
 * Queda un residuo conocido: entre esta comprobación y el fetch real hay una
 * ventana en la que el DNS podría cambiar (rebinding). Cerrarla del todo exige
 * fetchear por IP con la cabecera Host, que Workers no permite. Se acepta y se
 * documenta en vez de fingir que no existe.
 */
export async function resolvesToPublicAddress(
  hostname: string,
  timeoutMs: number
): Promise<GuardResult | null> {
  const ask = async (type: "A" | "AAAA"): Promise<string[]> => {
    const res = await fetch(
      `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(hostname)}&type=${type}`,
      {
        headers: { accept: "application/dns-json" },
        signal: AbortSignal.timeout(timeoutMs),
      }
    );
    if (!res.ok) return [];
    const body = (await res.json()) as { Answer?: DohAnswer[] };
    return (body.Answer ?? [])
      .filter((a) => a.type === 1 || a.type === 28) // A / AAAA, ignora los CNAME intermedios
      .map((a) => a.data ?? "")
      .filter(Boolean);
  };

  let addresses: string[];
  try {
    const [v4, v6] = await Promise.all([ask("A"), ask("AAAA")]);
    addresses = [...v4, ...v6];
  } catch {
    return { ok: false, reason: "No se pudo resolver el dominio." };
  }

  if (addresses.length === 0) return { ok: false, reason: "El dominio no resuelve." };

  const bad = addresses.find((ip) => isPrivateAddress(ip));
  if (bad) return { ok: false, reason: `El dominio resuelve a una dirección no pública: ${bad}` };

  return null; // null = sin objeción
}
