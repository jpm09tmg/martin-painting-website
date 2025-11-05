// src/ai/tools/bookAppointment.ts
import { z } from "zod";
import { createClientServer } from "@/src/lib/db/supabase";

const BookingInput = z.object({
  client: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(7),
    address: z.string().min(3),
  }),
  propertyType: z.string().min(1),
  locationType: z.string().min(1),
  preferredDate: z.string().min(8), // "YYYY-MM-DD" from the bot
  preferredTime: z.string().min(1), // can be "9:00 AM" or "14:00"
  details: z.string().optional(),
});

function to24h(time: string) {
  // Accept "9:00 AM" or "14:00" and return "HH:mm:ss"
  const ampm = time.trim().toUpperCase();
  if (/AM|PM/.test(ampm)) {
    const [t, mer] = ampm.split(/\s+/);
    let [h, m] = t.split(":").map(Number);
    if (mer === "PM" && h < 12) h += 12;
    if (mer === "AM" && h === 12) h = 0;
    return `${String(h).padStart(2,"0")}:${String(m||0).padStart(2,"0")}:00`;
  }
  // assume 24h like "14:30" or "14:30:00"
  const [h, m = "00", s = "00"] = time.split(":");
  return `${h.padStart(2,"0")}:${m.padStart(2,"0")}:${s.padStart(2,"0")}`;
}

export const bookAppointment = {
  name: "book_appointment",
  description: "Upsert client by email, then create a pending appointment.",
  parameters: BookingInput,
  execute: async (input: z.infer<typeof BookingInput>) => {
    const sb = createClientServer();

    // 1) Find existing client by email (same as page) 
    const { data: found } = await sb
      .from("clients").select("id").eq("email", input.client.email).maybeSingle();

    let clientId = found?.id ?? null;

    // 2) Update or insert client (same intent as page: update if exists, else insert)
    if (clientId) {
      await sb.from("clients").update({
        first_name: input.client.firstName,
        last_name: input.client.lastName,
        phone: input.client.phone,
        address: input.client.address,
      }).eq("id", clientId);
    } else {
      const { data: created } = await sb.from("clients").insert([{
        first_name: input.client.firstName,
        last_name: input.client.lastName,
        email: input.client.email,
        phone: input.client.phone,
        address: input.client.address,
      }]).select("id").single();
      clientId = created?.id ?? null;
    }

    // 3) Insert appointment (pending) exactly like the page
    const { error: apptErr, data: appt } = await sb.from("appointments").insert([{
      property_type: input.propertyType,
      location_type: input.locationType,
      preferred_date: input.preferredDate,      // "YYYY-MM-DD"
      preferred_time: to24h(input.preferredTime), // normalized "HH:mm:ss"
      details: input.details ?? null,
      client_id: clientId,
      status: "pending",
    }]).select("id, preferred_date, preferred_time, status").single();

    if (apptErr) throw apptErr;

    return {
      appointmentId: appt.id,
      status: appt.status,
      preferredDate: appt.preferred_date,
      preferredTime: appt.preferred_time,
    };
  },
};
