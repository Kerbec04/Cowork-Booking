import { z } from "zod";

// Fixed 1-hour blocks: client picks a space, a date, a start hour and a
// whole-hour duration. `inicio`/`fim` are derived from these on the server,
// not trusted as raw datetimes from the client.
export const createBookingSchema = z.object({
  spaceId: z.string().min(1),
  data: z.iso.date(), // "YYYY-MM-DD"
  horaInicio: z.coerce.number().int().min(0).max(23),
  duracaoHoras: z.coerce.number().int().min(1).max(8),
  podcastIncluido: z.coerce.boolean().default(false),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const cancelBookingSchema = z.object({
  bookingId: z.string().min(1),
  motivo: z.string().trim().max(500).optional(),
});
