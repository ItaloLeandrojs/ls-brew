import { describe, it, expect } from "vitest";
import { INDEXAR, SITE, WHATSAPP } from "../src/config.js";

describe("config", () => {
  it("fica fora do Google até o Italo liberar", () => expect(INDEXAR).toBe(false));
  it("aponta para o GitHub Pages do ls-brew", () => expect(SITE).toBe("https://italoleandrojs.github.io/ls-brew/"));
  it("usa número de WhatsApp inválido (o número local começa com 0)", () => expect(WHATSAPP).toMatch(/^5585 ?0/));
});
