import { z } from "zod";

/**
 * Schemas de validação da API.
 *
 * Cada schema é a fonte única da verdade sobre o formato de uma entrada:
 * ele valida em tempo de execução e, através de `z.infer`, também gera o
 * tipo TypeScript. Isso elimina a duplicação entre "o tipo declarado" e
 * "a validação escrita à mão", que costumam sair de sincronia.
 */

export const statusChamadoSchema = z.enum(["ABERTO", "EM_ATENDIMENTO", "RESOLVIDO"], {
  message: "Status deve ser ABERTO, EM_ATENDIMENTO ou RESOLVIDO.",
});

export const prioridadeChamadoSchema = z.enum(["BAIXA", "MEDIA", "ALTA"], {
  message: "Prioridade deve ser BAIXA, MEDIA ou ALTA.",
});

/** Corpo aceito por POST /chamados */
export const criarChamadoSchema = z.object({
  titulo: z
    .string({ message: "Título é obrigatório." })
    .trim()
    .min(3, "Título deve ter ao menos 3 caracteres.")
    .max(120, "Título deve ter no máximo 120 caracteres."),

  descricao: z
    .string({ message: "Descrição é obrigatória." })
    .trim()
    .min(5, "Descrição deve ter ao menos 5 caracteres.")
    .max(2000, "Descrição deve ter no máximo 2000 caracteres."),

  categoria: z
    .string({ message: "Categoria é obrigatória." })
    .trim()
    .min(2, "Categoria deve ter ao menos 2 caracteres.")
    .max(60, "Categoria deve ter no máximo 60 caracteres."),

  prioridade: prioridadeChamadoSchema,

  nomeSolicitante: z
    .string({ message: "Nome do solicitante é obrigatório." })
    .trim()
    .min(2, "Nome do solicitante deve ter ao menos 2 caracteres.")
    .max(120, "Nome do solicitante deve ter no máximo 120 caracteres."),
});

/** Query string aceita por GET /chamados */
export const listarChamadosQuerySchema = z.object({
  status: statusChamadoSchema.optional(),
});

/**
 * Parâmetro :id da rota.
 *
 * `coerce` converte a string vinda da URL em número antes de validar —
 * sem isso, todo id chegaria como texto e falharia na checagem de número.
 */
export const idParamSchema = z.object({
  id: z.coerce
    .number({ message: "ID deve ser um número." })
    .int("ID deve ser um número inteiro.")
    .positive("ID deve ser maior que zero."),
});

/** Corpo aceito por PATCH /chamados/:id/status */
export const atualizarStatusSchema = z.object({
  status: statusChamadoSchema,
});

/** Corpo aceito por POST /chatbot/mensagem */
export const mensagemChatbotSchema = z.object({
  mensagem: z
    .string({ message: "A mensagem é obrigatória e deve ser um texto." })
    .trim()
    .min(1, "A mensagem não pode estar vazia.")
    .max(1000, "A mensagem deve ter no máximo 1000 caracteres."),
});

// Tipos derivados dos schemas: se um schema mudar, o tipo muda junto
// e o compilador aponta todos os lugares que precisam ser ajustados.
export type CriarChamadoEntrada = z.infer<typeof criarChamadoSchema>;
export type AtualizarStatusEntrada = z.infer<typeof atualizarStatusSchema>;
export type MensagemChatbotEntrada = z.infer<typeof mensagemChatbotSchema>;
