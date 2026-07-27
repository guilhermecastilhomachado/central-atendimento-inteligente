/// <reference types="node" />
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.chamado.deleteMany();

  await prisma.chamado.createMany({
    data: [
      {
        titulo: "Erro ao acessar o sistema",
        descricao: "Usuário informou que não consegue acessar o painel com sua senha.",
        categoria: "Acesso",
        prioridade: "ALTA",
        status: "ABERTO",
        nomeSolicitante: "Mariana Souza",
      },
      {
        titulo: "Dúvida sobre integração com API",
        descricao: "Cliente precisa entender como consultar os dados de atendimento por integração.",
        categoria: "Integração",
        prioridade: "MEDIA",
        status: "EM_ATENDIMENTO",
        nomeSolicitante: "Carlos Oliveira",
      },
      {
        titulo: "Solicitação de melhoria no fluxo de atendimento",
        descricao: "Equipe solicitou melhoria para reduzir etapas no cadastro de chamados.",
        categoria: "Melhoria",
        prioridade: "BAIXA",
        status: "RESOLVIDO",
        nomeSolicitante: "Ana Pereira",
      },
    ],
  });

  console.log("Banco populado com dados iniciais.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (erro) => {
    console.error("Erro ao popular banco:", erro);
    await prisma.$disconnect();
    process.exit(1);
  });