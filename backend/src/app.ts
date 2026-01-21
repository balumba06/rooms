import { Type as T, type Static } from "typebox";
import type { FastifyError, FastifySchemaValidationError } from "fastify";
import type { SchemaErrorDataVar } from "fastify/types/schema.js";

export class ValidationProblem extends Error implements FastifyError {
  public readonly name = "ValidationError";
  public readonly code = "FST_ERR_VALIDATION";
  public readonly statusCode = 400;
  public readonly validation: FastifySchemaValidationError[];
  public readonly validationContext: SchemaErrorDataVar;

  constructor(message: string, errs: any, ctx: any) {
    super(message);
    this.validation = errs;
    this.validationContext = ctx;
  }
}

// --- AUDITORIUMS ---
export const AuditoriumSchema = T.Object({
  id: T.String(),
  name: T.String(),
  capacity: T.Integer(),
});

export const CreateAuditoriumSchema = T.Object({
  name: T.String({ minLength: 1 }),
  capacity: T.Integer({ minimum: 1 }),
});

export const UpdateAuditoriumSchema = T.Object({
  name: T.Optional(T.String({ minLength: 1 })),
  capacity: T.Optional(T.Integer({ minimum: 1 })),
});

// --- BOOKINGS (только аудитория) ---
export const BookingSchema = T.Object({
  id: T.String(),
  auditoriumId: T.String(),
  startTime: T.String(),
  endTime: T.String(),
  auditorium: T.Optional(AuditoriumSchema),
});

export const CreateBookingSchema = T.Object({
  auditoriumId: T.String({ minLength: 1 }),
  endTime: T.String({ minLength: 1 }),
});

export const UpdateBookingSchema = T.Object({
  auditoriumId: T.Optional(T.String({ minLength: 1 })),
  endTime: T.Optional(T.String({ minLength: 1 })),
});

export type Auditorium = Static<typeof AuditoriumSchema>;
export type Booking = Static<typeof BookingSchema>;
