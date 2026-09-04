import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function pair(a: string, b: string) {
  return a < b ? { userAId: a, userBId: b } : { userAId: b, userBId: a };
}

async function talk(from: { id: string }, to: { id: string }, texts: { senderId: string; body: string }[]) {
  const ids = pair(from.id, to.id);
  const conversation = await prisma.conversation.upsert({
    where: { userAId_userBId: ids },
    update: { updatedAt: new Date() },
    create: ids,
  });
  const existing = await prisma.message.count({ where: { conversationId: conversation.id } });
  if (existing === 0) {
    await prisma.message.createMany({
      data: texts.map((item) => ({ ...item, conversationId: conversation.id })),
    });
  }
  return conversation.id;
}

async function main() {
  const users = await prisma.user.findMany();
  const byHandle = Object.fromEntries(users.map((u) => [u.handle, u]));
  const marina = byHandle.marina;
  const leo = byHandle.leo;
  const ana = byHandle.ana;
  if (!marina || !leo || !ana) {
    console.log("Contas de demo não encontradas.");
    return;
  }

  await talk(marina, leo, [
    { senderId: leo.id, body: "Marina, vi seu pedido de ajuda. Posso te mostrar como guardar a lista fora da tela." },
    { senderId: marina.id, body: "Aceito! Quero terminar o app de manutenção essa semana." },
    { senderId: leo.id, body: "Combinado. Depois te mando o exemplo e um arquivo com o fluxo." },
  ]);
  await talk(marina, ana, [
    { senderId: ana.id, body: "Seu app e o ateliê têm a mesma pergunta: o que a pessoa precisa resolver hoje?" },
    { senderId: marina.id, body: "Verdade. Quero desenhar isso no papel com você." },
  ]);

  const others = users.filter((u) => !["marina", "leo", "ana"].includes(u.handle));
  for (const person of others) {
    await talk(person, marina, [
      { senderId: marina.id, body: `Oi, ${person.name.split(" ")[0]}! Se quiser, me conta no que você está trabalhando.` },
      { senderId: person.id, body: "Oi, Marina. Quero conhecer o Nexo e conversar sobre ideias." },
    ]);
    await talk(person, leo, [
      { senderId: leo.id, body: "Se travar em algum erro, me chama. A gente resolve junto." },
    ]);
  }

  console.log("Conversas de exemplo prontas.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
