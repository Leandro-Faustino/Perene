// Substituto de `server-only` durante os testes.
//
// O pacote real lança ao ser importado fora de um Server Component, o que é
// exatamente o comportamento desejado em produção. O Vitest roda em Node — o
// ambiente que o pacote quer proteger —, então aqui ele vira um módulo vazio.
//
// Configurado como alias em `vitest.config.mts`.
export {};
