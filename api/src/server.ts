import { app } from "./app";

/**
 * Ponto de entrada do processo.
 *
 * Este arquivo tem uma responsabilidade só: escolher a porta e subir o
 * servidor. Toda a configuração da aplicação vive em `app.ts`.
 */
const porta = Number(process.env.PORT) || 3001;

app.listen(porta, () => {
  console.log(`API rodando em http://localhost:${porta}`);
  console.log(`Documentação em http://localhost:${porta}/docs`);
});
