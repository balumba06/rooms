import { Type as T, type Static } from 'typebox'
import type { FastifyError, FastifySchemaValidationError } from 'fastify'
import type { SchemaErrorDataVar } from 'fastify/types/schema.js'

export class ValidationProblem extends Error implements FastifyError {
  public readonly name = 'ValidationError'
  public readonly code = 'FST_ERR_VALIDATION'
  public readonly statusCode = 400
  public readonly validation: FastifySchemaValidationError[]
  public readonly validationContext: SchemaErrorDataVar

  constructor(message: string, errs: any, ctx: any) {
    super(message)
    this.validation = errs
    this.validationContext = ctx
  }
}

// Схемы для устройств
export const DeviceSchema = T.Object({
  id: T.String(),
  name: T.String()
})
export const CreateDeviceSchema = T.Object({
  name: T.String({ minLength: 1 })
})
export const UpdateDeviceSchema = T.Object({
  name: T.Optional(T.String({ minLength: 1 }))
})

// Схемы для аудиторий (Auditorium)
export const AuditoriumSchema = T.Object({
  id: T.String(),
  name: T.String(),
  capacity: T.Integer()
})
export const CreateAuditoriumSchema = T.Object({
  name: T.String({ minLength: 1 }),
  capacity: T.Integer({ minimum: 1 })
})
export const UpdateAuditoriumSchema = T.Object({
  name: T.Optional(T.String({ minLength: 1 })),
  capacity: T.Optional(T.Integer({ minimum: 1 }))
})

// Схемы для бронирования
export const BookingSchema = T.Object({
  id: T.String(),
  deviceId: T.String(),
  auditoriumId: T.String(),
  startTime: T.String(),
  endTime: T.String(),
  device: T.Optional(DeviceSchema),
  auditorium: T.Optional(AuditoriumSchema)
})
export const CreateBookingSchema = T.Object({
  deviceId: T.String(),
  auditoriumId: T.String(),
  endTime: T.String()
})
export const UpdateBookingSchema = T.Object({
  deviceId: T.Optional(T.String()),
  auditoriumId: T.Optional(T.String()),
  endTime: T.Optional(T.String())
})

export type Device = Static<typeof DeviceSchema>
export type Auditorium = Static<typeof AuditoriumSchema>
export type Booking = Static<typeof BookingSchema>