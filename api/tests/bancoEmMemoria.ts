import type { Chamado } from "../src/modelos/Chamado";

/**
 * Implementação em memória das operações do Prisma usadas pela aplicação.
 *
 * Serve como dublê nos testes de integração: as rotas, a validação com Zod e o
 * tratador de erros são exercitados de verdade, mas a persistência é
 * substituída por um array. Isso mantém a suíte determinística e sem
 * dependência de arquivo de banco, servidor ou binário do Prisma — a mesma
 * suíte roda igual na máquina de desenvolvimento e em um pipeline de CI.
 *
 * O limite deste recorte é explícito: ele valida o contrato HTTP e as regras de
 * validação, não o SQL gerado. Testes contra um banco real são o passo
 * seguinte, registrado no roadmap do projeto.
 */
export function criarBancoEmMemoria() {
  let registros: Chamado[] = [];
  let proximoId = 1;

  const chamado = {
    async findMany({ where }: { where?: { status?: string } } = {}) {
      const filtrados = where?.status
        ? registros.filter((item) => item.status === where.status)
        : [...registros];

      return filtrados.sort((a, b) => a.id - b.id);
    },

    async findUnique({ where }: { where: { id: number } }) {
      return registros.find((item) => item.id === where.id) ?? null;
    },

    async create({ data }: { data: Omit<Chamado, "id" | "criadoEm" | "atualizadoEm"> }) {
      const agora = new Date();

      const novo: Chamado = {
        ...data,
        id: proximoId++,
        criadoEm: agora,
        atualizadoEm: agora,
      };

      registros.push(novo);
      return novo;
    },

    async update({ where, data }: { where: { id: number }; data: Partial<Chamado> }) {
      const indice = registros.findIndex((item) => item.id === where.id);

      if (indice === -1) {
        throw new Error("Registro não encontrado.");
      }

      registros[indice] = {
        ...registros[indice],
        ...data,
        atualizadoEm: new Date(),
      };

      return registros[indice];
    },

    async count({ where }: { where?: { status?: string } } = {}) {
      if (!where?.status) {
        return registros.length;
      }

      return registros.filter((item) => item.status === where.status).length;
    },
  };

  return {
    chamado,

    /** Devolve o banco ao estado inicial. Chamado no beforeEach da suíte. */
    limpar() {
      registros = [];
      proximoId = 1;
    },

    /** Insere registros diretamente, sem passar pela API. */
    semear(dados: Array<Omit<Chamado, "id" | "criadoEm" | "atualizadoEm">>) {
      for (const item of dados) {
        const agora = new Date();
        registros.push({ ...item, id: proximoId++, criadoEm: agora, atualizadoEm: agora });
      }
    },
  };
}
