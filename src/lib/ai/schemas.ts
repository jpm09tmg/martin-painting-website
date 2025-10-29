import { z } from "zod";

export const bookingInput = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  requestedDate: z.string(), // ISO date
  notes: z.string().optional(),
});
