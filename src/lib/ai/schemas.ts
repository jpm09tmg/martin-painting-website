
import { z } from "zod";

// -----------------------------
// Booking schema (chat + REST)
// -----------------------------
export const ALLOWED_TIME_SLOTS = [
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
] as const;

const timeSlotEnum = z.enum(ALLOWED_TIME_SLOTS);

const normalizeEmail = (v: string) => v.trim().toLowerCase();
const normalizePhone = (v: string) => (v ?? "").replace(/[^\d+]/g, "");

function todayInEdmonton(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Edmonton",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date()); // YYYY-MM-DD in en-CA
}

function isDateGte(a: string, b: string) {
  return a >= b; // both YYYY-MM-DD
}

export const BookingInput = z
  .object({
    client: z.object({
      firstName: z.string().min(1),
      lastName: z.string().min(1),
      email: z.string().email().transform(normalizeEmail),
      phone: z.string().min(3).transform(normalizePhone),
      address: z.string().min(1),
    }),
    propertyType: z.string().min(1),
    locationType: z.string().min(1),
    preferredDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    preferredTime: timeSlotEnum,
    details: z.string().optional().default(""),
  })
  .superRefine((val, ctx) => {
    const today = todayInEdmonton();
    if (!isDateGte(val.preferredDate, today)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Preferred date cannot be in the past (today in Edmonton is ${today}).`,
        path: ["preferredDate"],
      });
    }
  });

export type BookingInput = z.infer<typeof BookingInput>;
