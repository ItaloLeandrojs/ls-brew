import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf8");
const cor = (nome) => {
  const m = css.match(new RegExp(`--${nome}:\\s*(#[0-9a-fA-F]{6})`));
  if (!m) throw new Error(`token --${nome} não encontrado`);
  return m[1];
};
const lum = (hex) => {
  const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const contraste = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

// Todo par texto/fundo usado no site. Se criar um par novo, acrescente aqui.
const PARES = [
  ["cafe", "creme"], ["cafe", "bege"], ["texto-2", "creme"], ["texto-2", "bege"],
  ["caramelo-texto", "creme"], ["cafe", "caramelo"], ["cafe", "caramelo-hover"],
  ["creme", "escuro"], ["caramelo", "escuro"], ["creme", "cafe"],
  ["mapa-rotulo", "creme"], ["mapa-rotulo", "mapa-mar"], ["mapa-rotulo", "mapa-praca"], ["mapa-rotulo", "bege"],
  ["erro", "creme"], ["erro-escuro", "cafe"],
];

describe("contraste AA (4,5:1)", () => {
  for (const [t, f] of PARES) it(`${t} sobre ${f}`, () => expect(contraste(cor(t), cor(f))).toBeGreaterThanOrEqual(4.5));
  it("caramelo nunca serve de texto no creme (por isso não está nos pares)", () => expect(contraste(cor("caramelo"), cor("creme"))).toBeLessThan(4.5));
});
