/**
 * Erro de aplicação: representa uma falha que o usuário da API precisa conhecer
 * (dado inválido, recurso inexistente, regra de negócio violada).
 *
 * A diferença para um Error comum é que o AppError carrega o status HTTP que
 * deve ser devolvido. Isso permite que os controladores apenas lancem o erro,
 * sem se preocuparem com a resposta — quem monta a resposta é o tratador global
 * de erros, em um único lugar.
 */
export class AppError extends Error {
  /** Status HTTP que a resposta deve usar. */
  public readonly status: number;

  /** Informação adicional opcional, como a lista de campos inválidos. */
  public readonly detalhes?: unknown;

  constructor(mensagem: string, status = 400, detalhes?: unknown) {
    super(mensagem);

    this.name = "AppError";
    this.status = status;
    this.detalhes = detalhes;

    // Mantém o stack trace apontando para onde o erro foi lançado,
    // e não para dentro deste construtor.
    Error.captureStackTrace(this, this.constructor);
  }

  /** Atalho para 400 Bad Request. */
  static requisicaoInvalida(mensagem: string, detalhes?: unknown): AppError {
    return new AppError(mensagem, 400, detalhes);
  }

  /** Atalho para 404 Not Found. */
  static naoEncontrado(mensagem: string): AppError {
    return new AppError(mensagem, 404);
  }

  /** Atalho para 409 Conflict. */
  static conflito(mensagem: string): AppError {
    return new AppError(mensagem, 409);
  }
}
