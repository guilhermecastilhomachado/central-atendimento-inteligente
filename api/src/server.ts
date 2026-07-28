import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import chamadoControlador from "./controladores/chamadoControlador";
import { chatbotControlador } from "./controladores/chatbotControlador";

dotenv.config();

const app = express();


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

const porta = process.env.PORT || 3001;

app.get("/", (req, res) => {
  res.json({
    mensagem: "API da Central de Atendimento Inteligente",
    status: "online",
    versao: "1.0.0",
  });
});

app.get("/saude", (req, res) => {
  res.json({
    status: "API funcionando corretamente",
  });
});

app.use("/chamados", chamadoControlador);
app.use("/chatbot", chatbotControlador);

app.listen(porta, () => {
  console.log(`API rodando em http://localhost:${porta}`);
});