// Precisa ser o primeiro import do arquivo.
// Ele "monkey-patcha" o roteador do Express 4 para que exceções lançadas
// dentro de handlers assíncronos sejam encaminhadas ao tratador de erros.
// Sem isso, um `throw` dentro de um `async (req, res) => {}` viraria uma
// promise rejeitada e a requisição ficaria pendurada até o timeout.
import "express-async-errors";

import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import swaggerUi from "swagger-ui-express";

import chamadoControlador from "./controladores/chamadoControlador";
import { chatbotControlador } from "./controladores/chatbotControlador";
import { documentoOpenApi } from "./docs/openapi";
import { rotaNaoEncontrada, tratadorDeErros } from "./middlewares/tratadorDeErros";

dotenv.config();

/**
 * Monta a aplicação Express sem colocá-la no ar.
 *
 * Separar a montagem (`app.ts`) da inicialização (`server.ts`) permite que os
 * testes importem o app e façam requisições diretamente contra ele, sem abrir
 * uma porta de rede. É o que torna possível rodar a suíte inteira em paralelo
 * e sem conflito de portas.
 */
export const app = express();

const origensPermitidas = (process.env.CORS_ORIGIN ?? "http://localhost:5173")
  .split(",")
  .map((origem) => origem.trim())
  .filter((origem) => origem.length > 0);

app.use(
  cors({
    origin: origensPermitidas,
  })
);

app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    mensagem: "API da Central de Atendimento Inteligente",
    status: "online",
    versao: "1.0.0",
    documentacao: "/docs",
  });
});

app.get("/saude", (_req, res) => {
  res.json({
    status: "API funcionando corretamente",
  });
});

// Documentação interativa: /docs serve a interface do Swagger UI e
// /docs.json expõe a especificação OpenAPI crua, que pode ser importada
// no Insomnia, no Postman ou em um gerador de cliente HTTP.
app.get("/docs.json", (_req, res) => {
  res.json(documentoOpenApi);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(documentoOpenApi, {
  customSiteTitle: "Central de Atendimento Inteligente — API",
}));

app.use("/chamados", chamadoControlador);
app.use("/chatbot", chatbotControlador);

// A ordem dos dois middlewares abaixo importa e é sempre a mesma:
// primeiro o que captura rotas inexistentes, por último o tratador de erros.
app.use(rotaNaoEncontrada);
app.use(tratadorDeErros);
