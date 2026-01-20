import Fastify from 'fastify'
import cors from '@fastify/cors'
import helmet from '@fastify/helmet'
import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import prismaPlugin from './plugins/prisma.js'
import { 
  ValidationProblem, 
  CreateDeviceSchema, 
  CreateAuditoriumSchema, 
  CreateBookingSchema,
  UpdateDeviceSchema,
  UpdateAuditoriumSchema,
  UpdateBookingSchema 
} from './types.js'

export async function buildApp() {
  const app = Fastify({
    logger: true,
    schemaErrorFormatter: (errors, dataVar) => new ValidationProblem('Ошибка валидации', errors, dataVar)
  }).withTypeProvider<TypeBoxTypeProvider>()

  await app.register(helmet)
  await app.register(cors, { origin: true, methods: '*', allowedHeaders: ['*'] })
  await app.register(prismaPlugin)

  app.get('/api/health', (req, res) => res.status(200).send('ok'))

  // --- DEVICES ----
  app.get('/api/devices', async () => app.prisma.device.findMany())
  app.post('/api/devices', { schema: { body: CreateDeviceSchema } }, async (req, reply) => {
    const device = await app.prisma.device.create({ data: req.body })
    return reply.code(201).send(device)
  })
  app.put('/api/devices/:id', { schema: { body: UpdateDeviceSchema } }, async (req) => {
    const { id } = req.params as { id: string }
    return app.prisma.device.update({ where: { id }, data: req.body })
  })
  app.delete('/api/devices/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await app.prisma.device.delete({ where: { id } })
    return reply.code(204).send()
  })

  // --- AUDITORIUMS ---
  app.get('/api/auditoriums', async () => app.prisma.auditorium.findMany())
  app.post('/api/auditoriums', { schema: { body: CreateAuditoriumSchema } }, async (req, reply) => {
    const auditorium = await app.prisma.auditorium.create({ data: req.body })
    return reply.code(201).send(auditorium)
  })
  app.put('/api/auditoriums/:id', { schema: { body: UpdateAuditoriumSchema } }, async (req) => {
    const { id } = req.params as { id: string }
    return app.prisma.auditorium.update({ where: { id }, data: req.body })
  })
  app.delete('/api/auditoriums/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await app.prisma.auditorium.delete({ where: { id } })
    return reply.code(204).send()
  })

  // --- BOOKINGS ---
  app.get('/api/bookings', async () => {
    return app.prisma.booking.findMany({ 
      include: { device: true, auditorium: true },
      orderBy: { startTime: 'desc' }
    })
  })

  app.post('/api/bookings', { schema: { body: CreateBookingSchema } }, async (req, reply) => {
    const { deviceId, auditoriumId, endTime } = req.body
    
    // Оставляем только базовую проверку здравого смысла (конец позже начала)
    if (new Date(endTime) <= new Date()) {
      return reply.code(400).send({ detail: 'Время окончания должно быть в будущем' })
    }

    const booking = await app.prisma.booking.create({
      data: { deviceId, auditoriumId, endTime: new Date(endTime) },
      include: { device: true, auditorium: true }
    })
    return reply.code(201).send(booking)
  })

  app.put('/api/bookings/:id', { schema: { body: UpdateBookingSchema } }, async (req, reply) => {
    const { id } = req.params as { id: string }
    const { deviceId, auditoriumId, endTime } = req.body

    const data: any = {}
    if (deviceId) data.deviceId = deviceId
    if (auditoriumId) data.auditoriumId = auditoriumId
    if (endTime) data.endTime = new Date(endTime)

    return app.prisma.booking.update({
      where: { id },
      data,
      include: { device: true, auditorium: true }
    })
  })

  app.delete('/api/bookings/:id', async (req, reply) => {
    const { id } = req.params as { id: string }
    await app.prisma.booking.delete({ where: { id } })
    return reply.code(204).send()
  })

  return app
}