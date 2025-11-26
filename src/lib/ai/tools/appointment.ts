import { z } from "zod";
import { BookingInput } from "../schemas";
import { bookAppointment } from "./services";

type ExecuteArg = {
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
  };
  propertyType: string;
  locationType: string;
  preferredDate: string; // YYYY-MM-DD
  preferredTime: string; // validated by schema
  details?: string;
};

// Name the object first (satisfies no-anonymous-default-export)
export const bookAppointmentTool = {
  name: "bookAppointment",
  description: "Create a pending painting consultation.",
  schema: BookingInput,
  // use a property function to avoid any method-style lint rules
  execute: async (input: ExecuteArg) => {
    const parsed = BookingInput.parse(input);
    const res = await bookAppointment(parsed);
    return {
      ...res,
      message:
        "Appointment request submitted successfully! We'll contact you soon to confirm.",
    };
  },
};

// Default export is now a named const, not an anonymous object
export default bookAppointmentTool;
