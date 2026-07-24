import { Router } from "express";
import { gerarRespostaChatbot } from "../servicos/chatbotServico";

export const chatbotControlador = Router();

chatbotControlador.post("/mensagem", (req, res) => {
  try {
    const { mensagem } = req.body;

    const resposta = gerarRespostaChatbot(mensagem);

    res.json(resposta);
  } catch (erro) {
    res.status(400).json({
      mensagem:
        erro instanceof Error
          ? erro.message
          : "Erro ao processar mensagem do chatbot.",
    });
  }
});