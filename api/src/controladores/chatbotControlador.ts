import { Router } from "express";
import { gerarRespostaChatbot } from "../servicos/chatbotServico";
import { mensagemChatbotSchema } from "../validacao/chamadoSchemas";

export const chatbotControlador = Router();

/**
 * POST /chatbot/mensagem — executa a triagem de uma mensagem.
 *
 * A validação de tipo e de tamanho ficou por conta do schema: o serviço
 * recebe apenas texto já limpo e não vazio, e por isso pode se concentrar
 * exclusivamente na regra de classificação.
 */
chatbotControlador.post("/mensagem", (req, res) => {
  const { mensagem } = mensagemChatbotSchema.parse(req.body);

  const resposta = gerarRespostaChatbot(mensagem);

  res.json(resposta);
});
