import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../erros/AppError";

/**
 * Formato único de erro devolvido pela API.
 *
 * Ter um contrato fixo é o que permite ao front-end tratar qualquer falha da
 * mesma maneira, sem precisar adivinhar o formato de cada endpoint.
 */
interface RespostaDeErro {
  mensagem: string;
  detalhes?: unknown;
}

/**
 * Converte os problemas relatados pelo Zod em um objeto simples,
 * no formato { campo: "motivo" }, que é fácil de consumir no front-end.
 */
function formatarErrosDeValidacao(erro: ZodError): Record<string, string> {
  const campos: Record<string, string> = {};

  for (const problema of erro.issues) {
    const caminho = problema.path.join(".") || "(corpo da requisição)";

    // Mantém apenas a primeira mensagem de cada campo: repetir todas
    // deixa a resposta ruidosa sem acrescentar informação útil.
    if (!campos[caminho]) {
      campos[caminho] = problema.message;
    }
  }

  return campos;
}

/**
 * Middleware final da cadeia do Express: qualquer erro lançado em qualquer
 * rota chega aqui.
 *
 * A assinatura precisa ter exatamente quatro parâmetros — é assim que o
 * Express distingue um tratador de erros de um middleware comum. Por isso
 * `next` permanece na lista mesmo quando não é chamado.
 */
export function tratadorDeErros(
  erro: unknown,
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Se a resposta já começou a ser enviada, não há como trocar o status.
  // Nesse caso o próprio Express encerra a conexão.
  if (res.headersSent) {
    next(erro);
    return;
  }

  // 1. Erros de validação do Zod viram 400 com a lista de campos inválidos.
  if (erro instanceof ZodError) {
    const resposta: RespostaDeErro = {
      mensagem: "Os dados enviados são inválidos.",
      detalhes: formatarErrosDeValidacao(erro),
    };

    res.status(400).json(resposta);
    return;
  }

  // 2. Erros previstos pela aplicação já sabem o próprio status.
  if (erro instanceof AppError) {
    const resposta: RespostaDeErro = {
      mensagem: erro.message,
    };

    if (erro.detalhes !== undefined) {
      resposta.detalhes = erro.detalhes;
    }

    res.status(erro.status).json(resposta);
    return;
  }

  // 3. Qualquer outra coisa é um erro não previsto: registra no servidor
  //    e devolve uma mensagem genérica.
  //
  //    Detalhe de segurança: nunca envie `erro.message` de um erro
  //    desconhecido ao cliente. Ele pode conter caminho de arquivo, nome de
  //    tabela ou trecho de SQL, que ajudam quem estiver sondando a API.
  console.error("[erro nao tratado]", erro);

  res.status(500).json({
    mensagem: "Erro interno no servidor.",
  } satisfies RespostaDeErro);
}

/**
 * Middleware para rotas inexistentes.
 *
 * Deve ser registrado depois de todas as rotas e antes do tratador de erros:
 * se a requisição chegou até aqui, nenhuma rota respondeu por ela.
 */
export function rotaNaoEncontrada(req: Request, _res: Response, next: NextFunction): void {
  next(AppError.naoEncontrado(`Rota nao encontrada: ${req.method} ${req.originalUrl}`));
}
