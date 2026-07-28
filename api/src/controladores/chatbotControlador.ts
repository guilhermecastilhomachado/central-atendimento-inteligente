import { Router } from "express";
import { gerarRespostaChatbot } from "../servicos/chatbotServico";

export const chatbotControlador = Router();

chatbotControlador.post("/mensagem", (req, res) => {
  try {
    const { mensagem } = req.body;

    if (typeof mensagem !== "string") {
      return res.status(400).json({
        mensagem: "O campo 'mensagem' é obrigatório e deve ser um texto.",
      });
    }

    const resposta = gerarRespostaChatbot(mensagem);

    return res.json(resposta);
  } catch (erro) {
    return res.status(400).json({
      mensagem:
        erro instanceof Error
          ? erro.message
          : "Erro ao processar mensagem do chatbot.",
    });
  }
});