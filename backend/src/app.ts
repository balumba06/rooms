import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import type { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import prismaPlugin from "./plugins/prisma.js";
import {
  ValidationProblem,
  CreateAuditoriumSchema,
  CreateBookingSchema,
  UpdateAuditoriumSchema,
  UpdateBookingSchema,
} from "./types.js";

export async function buildApp() {
  const app = Fastify({
    logger: true,
    schemaErrorFormatter: (errors, dataVar) =>
      new ValidationProblem("Ошибка валидации", errors, dataVar),
  }).withTypeProvider<TypeBoxTypeProvider>();

  await app.register(helmet);
  await app.register(cors, { origin: true, methods: "*", allowedHeaders: ["*"] });
  await app.register(prismaPlugin);

  app.get("/api/health", (req, res) => res.status(200).send("ok"));

  // --- AUDITORIUMS ---
  app.get("/api/auditoriums", async () => app.prisma.auditorium.findMany());

  app.post(
    "/api/auditoriums",
    { schema: { body: CreateAuditoriumSchema } },
    async (req, reply) => {
      const auditorium = await app.prisma.auditorium.create({ data: req.body });
      return reply.code(201).send(auditorium);
    }
  );

  app.put(
    "/api/auditoriums/:id",
    { schema: { body: UpdateAuditoriumSchema } },
    async (req) => {
      const { id } = req.params as { id: string };
      return app.prisma.auditorium.update({ where: { id }, data: req.body });
    }
  );

  app.delete("/api/auditoriums/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.auditorium.delete({ where: { id } });
    return reply.code(204).send();
  });

  // --- BOOKINGS ---
  app.get("/api/bookings", async () => {
    return app.prisma.booking.findMany({
      include: { auditorium: true },
      orderBy: { startTime: "desc" },
    });
  });


app.post(
  "/api/bookings",
  { schema: { body: CreateBookingSchema } },
  async (req, reply) => {
    const { auditoriumId, endTime } = req.body;

    const startTime = new Date();      // СЕЙЧАС
    const end = new Date(endTime);     // то, что выбрал пользователь

    if (end <= startTime) {
      return reply
        .code(400)
        .send({ detail: "Время окончания должно быть в будущем" });
    }

    const conflict = await app.prisma.booking.findFirst({
      where: {
        auditoriumId,
        startTime: { lt: end },      // existing.start < new.end
        endTime: { gt: startTime },  // existing.end > new.start
      },
    });

    if (conflict) {
      return reply.code(409).send({ detail: "Аудитория занята в это время" });
    }

    const booking = await app.prisma.booking.create({
      data: { auditoriumId, startTime, endTime: end },
      include: { auditorium: true },
    });

    return reply.code(201).send(booking);
  }
);

  app.put(
    "/api/bookings/:id",
    { schema: { body: UpdateBookingSchema } },
    async (req) => {
      const { id } = req.params as { id: string };
      const { auditoriumId, endTime } = req.body;

      const data: any = {};
      if (auditoriumId) data.auditoriumId = auditoriumId;
      if (endTime) data.endTime = new Date(endTime);

      return app.prisma.booking.update({
        where: { id },
        data,
        include: { auditorium: true },
      });
    }
  );

  app.delete("/api/bookings/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    await app.prisma.booking.delete({ where: { id } });
    return reply.code(204).send();
  });

  return app;
}
