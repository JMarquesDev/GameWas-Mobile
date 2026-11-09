# WAS — Mobile

Versão mobile do jogo narrativo **WAS**, uma aventura de exploração sobre memória, família e identidade. A história acompanha Oliver por cenários de diferentes fases da vida, com pistas, puzzles e flashbacks.

## Executar no celular

Requer Node.js 22.13 ou superior.

```bash
npm install
npm run mobile
```

Abra no celular o endereço de rede exibido pelo Vite. O computador e o celular precisam estar na mesma rede Wi-Fi.

## Estrutura

- `apps/web`: versão mobile para navegador, com controles por toque e interface responsiva.
- `apps/mobile`: protótipo nativo Expo.
- `packages`: conteúdo, regras do jogo e tokens visuais compartilhados.

Para iniciar o protótipo Expo: `npm run start --workspace @was/mobile`.
