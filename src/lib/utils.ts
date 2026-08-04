import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formatação de dinheiro. O produto trabalha em centavos no banco (inteiro,
 * sem ponto flutuante) e só converte na borda de exibição.
 *
 * Todo lugar que renderiza o retorno desta função aplica a classe `.pl-numero`
 * (§5.3): tabular e alinhado à direita.
 */
export function formatarReais(centavos: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(centavos / 100);
}

export function formatarPercentual(fracao: number, casas = 0): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "percent",
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  }).format(fracao);
}
