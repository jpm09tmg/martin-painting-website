
import { z } from "zod";
import { BookingInput, ALLOWED_TIME_SLOTS } from "../schemas";
// Adjust this import to match your existing client export:
import { supabase } from "@/src/lib/db/supabase-client"; // <-- ensure this path matches your project

export const BookingResult = z.object({
  appointmentId: z.string(),
  status: z.literal("pending"),
  preferredDate: z.string(),
  preferredTime: z.string(),
});
export type BookingResult = z.infer<typeof BookingResult>;

export async function bookAppointment(input: BookingInput): Promise<BookingResult> {
  const {
    client: { firstName, lastName, email, phone, address },
    propertyType,
    locationType,
    preferredDate,
    preferredTime,
    details,
  } = input;

  if (!ALLOWED_TIME_SLOTS.includes(preferredTime as any)) {
    throw new Error("Invalid time slot.");
  }

  // 1) Lookup client by email
  let clientId: string | null = null;
  const { data: existingClient, error: existingErr } = await supabase
    .from("clients")
    .select("id")
    .eq("email", email)
    .single();

  if (existingErr && existingErr.code !== "PGRST116") {
    console.error("Error selecting client:", existingErr);
  }

  if (existingClient?.id) {
    clientId = existingClient.id;
    // 2a) Update existing client with newest profile fields
    const { error: updateErr } = await supabase
      .from("clients")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        address,
      })
      .eq("id", clientId);
    if (updateErr) console.error("Error updating client:", updateErr);
  } else {
    // 2b) Insert new client
    const { data: created, error: insertClientErr } = await supabase
      .from("clients")
      .insert([
        {
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          address,
        },
      ])
      .select("id")
      .single();
    if (insertClientErr) {
      console.error("Error creating client:", insertClientErr);
      throw new Error("Failed to create client.");
    }
    clientId = created!.id;
  }

  // 3) Insert appointment (pending)
  const { data: appt, error: apptErr } = await supabase
    .from("appointments")
    .insert([
      {
        property_type: propertyType,
        location_type: locationType,
        preferred_date: preferredDate,
        preferred_time: preferredTime,
        details: details ?? "",
        client_id: clientId,
        status: "pending",
      },
    ])
    .select("id")
    .single();

  if (apptErr) {
    console.error("Error creating appointment:", apptErr);
    throw new Error("Failed to create appointment.");
  }

  return {
    appointmentId: appt!.id,
    status: "pending",
    preferredDate,
    preferredTime,
  };
}
