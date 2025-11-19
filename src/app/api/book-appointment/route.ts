import { NextRequest, NextResponse } from "next/server";
import { BookingInput } from "@/src/lib/ai/schemas";
import { bookAppointment } from "@/src/lib/ai/services";

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = BookingInput.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "ValidationError", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const result = await bookAppointment(parsed.data);

    return NextResponse.json(
      {
        message:
          "Appointment request submitted successfully! We'll contact you soon to confirm.",
        ...result,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("book-appointment POST error:", err);
    return NextResponse.json(
      { error: "ServerError", message: err?.message ?? "Unexpected server error." },
      { status: 500 }
    );
  }
}
