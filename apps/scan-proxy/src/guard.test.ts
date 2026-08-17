import { describe, expect, test } from "bun:test";
import { checkUrlShape, isPrivateAddress } from "./guard";

const rechaza = (url: string) => {
  const r = checkUrlShape(url);
  expect(r.ok, `deberia rechazar ${url}`).toBe(false);
  return r.ok ? "" : r.reason;
};

const acepta = (url: string) => {
  const r = checkUrlShape(url);
  expect(r.ok, `deberia aceptar ${url}`).toBe(true);
};

describe("direcciones no públicas", () => {
  test("la IP de metadatos de la nube", () => {
    // El caso que da nombre al riesgo: 169.254.169.254 sirve credenciales
    // en AWS, GCP y Azure.
    expect(isPrivateAddress("169.254.169.254")).toBe(true);
  });

  test("loopback, privadas y reservadas", () => {
    for (const ip of [
      "127.0.0.1",
      "127.255.255.254",
      "10.0.0.1",
      "172.16.0.1",
      "172.31.255.255",
      "192.168.1.1",
      "0.0.0.0",
      "100.64.0.1", // CGNAT
      "224.0.0.1", // multicast
      "255.255.255.255",
    ])
      expect(isPrivateAddress(ip), ip).toBe(true);
  });

  test("172.32 y 172.15 SON públicas — el rango privado es 172.16-31", () => {
    expect(isPrivateAddress("172.15.0.1")).toBe(false);
    expect(isPrivateAddress("172.32.0.1")).toBe(false);
  });

  test("IPv6 loopback, link-local y unique-local", () => {
    for (const ip of ["::1", "::", "fe80::1", "fc00::1", "fd12:3456::1", "ff02::1"])
      expect(isPrivateAddress(ip), ip).toBe(true);
  });

  test("IPv4 privada disfrazada de IPv6", () => {
    expect(isPrivateAddress("::ffff:127.0.0.1")).toBe(true);
    expect(isPrivateAddress("::ffff:7f00:1")).toBe(true);
  });

  test("las públicas pasan", () => {
    for (const ip of ["1.1.1.1", "8.8.8.8", "93.184.216.34", "2606:4700::1111"])
      expect(isPrivateAddress(ip), ip).toBe(false);
  });
});

describe("forma de la URL", () => {
  test("el criterio de cierre de la tarea: la IP de metadatos se rechaza", () => {
    expect(rechaza("http://169.254.169.254/")).toContain("Not a public address");
  });

  test("solo http y https", () => {
    expect(rechaza("file:///etc/passwd")).toContain("Scheme");
    expect(rechaza("ftp://example.com")).toContain("Scheme");
    expect(rechaza("gopher://example.com")).toContain("Scheme");
    expect(rechaza("data:text/html,hola")).toContain("Scheme");
  });

  test("hosts internos por nombre", () => {
    for (const u of [
      "http://localhost/",
      "http://localhost:8080/",
      "http://algo.local/",
      "http://svc.internal/",
      "http://metadata.google.internal/",
    ])
      expect(rechaza(u)).toBeTruthy();
  });

  test("IP escrita en decimal o hexadecimal — 2130706433 es 127.0.0.1", () => {
    // El parser de URL las normaliza a notación con puntos, así que caen en la
    // comprobación de IP privada. La rama de "host numérico ambiguo" queda como
    // red de seguridad por si algún runtime no normaliza igual.
    expect(rechaza("http://2130706433/")).toBeTruthy();
    expect(rechaza("http://0x7f000001/")).toBeTruthy();
  });

  test("credenciales en la URL", () => {
    expect(rechaza("http://user:pass@example.com/")).toContain("credentials");
  });

  test("un host sin punto no es un dominio", () => {
    expect(rechaza("http://intranet/")).toContain("not a domain");
  });

  test("una URL rota no revienta, se rechaza", () => {
    expect(rechaza("no-es-una-url")).toBeTruthy();
    expect(rechaza("")).toBeTruthy();
  });

  test("las URL públicas normales pasan", () => {
    acepta("https://example.com/");
    acepta("https://example.com/a/b?c=d#e");
    acepta("http://example.com:8080/");
    acepta("https://1.1.1.1/");
  });
});
