import { bookingInput } from "../schemas";
import { createClientServer } from "@/src/lib/db/supabase"; // your helper

export const bookingsTools = {
  createBooking: {
    description: "Create a booking request in our system.",
    parameters: bookingInput,
    execute: async (args: unknown) => {
      const input = bookingInput.parse(args); // validate
      const supabase = createClientServer();

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          name: input.name,
          email: input.email,
          phone: input.phone ?? null,
          requested_date: input.requestedDate,
          notes: input.notes ?? null,
          source: "chatbot",
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return { status: "ok", id: data.id, requestedDate: data.requested_date };
    },
  },
};
