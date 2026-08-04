import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import "server-only";

/**
 * Criptografia das credenciais de gateway (AES-256-GCM).
 *
 * A chave mestra vive em `APP_ENCRYPTION_KEY` (32 bytes em base64), FORA do
 * banco. Quem tiver dump do Postgres não tem as chaves de API dos clientes.
 *
 * O selo de autenticação do GCM é concatenado ao fim do texto cifrado, para
 * caber nas duas colunas que o schema prevê (`api_key_encrypted`, `api_key_iv`)
 * sem uma terceira coluna só para a tag.
 *
 * Descriptografar só acontece dentro de `getAdapterForOrg` (server-only).
 */

const ALGORITMO = "aes-256-gcm";
const TAMANHO_IV = 12; // recomendado para GCM
const TAMANHO_TAG = 16;

function chaveMestra(): Buffer {
  const bruta = process.env.APP_ENCRYPTION_KEY;
  if (!bruta) {
    throw new Error(
      "APP_ENCRYPTION_KEY ausente. Gere com: openssl rand -base64 32",
    );
  }
  const chave = Buffer.from(bruta, "base64");
  if (chave.length !== 32) {
    throw new Error(
      `APP_ENCRYPTION_KEY precisa ter 32 bytes; recebeu ${chave.length}.`,
    );
  }
  return chave;
}

export function encrypt(textoPlano: string): {
  encrypted: string;
  iv: string;
} {
  const iv = randomBytes(TAMANHO_IV);
  const cifra = createCipheriv(ALGORITMO, chaveMestra(), iv);
  const cifrado = Buffer.concat([
    cifra.update(textoPlano, "utf8"),
    cifra.final(),
  ]);
  const tag = cifra.getAuthTag();

  return {
    encrypted: Buffer.concat([cifrado, tag]).toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decrypt(encrypted: string, iv: string): string {
  const bruto = Buffer.from(encrypted, "base64");
  if (bruto.length <= TAMANHO_TAG) {
    throw new Error("Texto cifrado inválido: menor que o selo de autenticação.");
  }

  const cifrado = bruto.subarray(0, bruto.length - TAMANHO_TAG);
  const tag = bruto.subarray(bruto.length - TAMANHO_TAG);

  const decifra = createDecipheriv(
    ALGORITMO,
    chaveMestra(),
    Buffer.from(iv, "base64"),
  );
  decifra.setAuthTag(tag);

  return Buffer.concat([decifra.update(cifrado), decifra.final()]).toString(
    "utf8",
  );
}

/**
 * Para exibir uma credencial na interface sem revelá-la. O operador precisa
 * reconhecer qual chave está conectada, não lê-la.
 */
export function mascarar(credencial: string): string {
  if (credencial.length <= 8) return "••••";
  return `${credencial.slice(0, 4)}${"•".repeat(8)}${credencial.slice(-4)}`;
}
