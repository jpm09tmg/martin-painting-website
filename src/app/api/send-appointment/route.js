import { Resend } from 'resend';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function POST(request) {
  try {
    const { appointmentId } = await request.json();

    // Fetch appointment from Supabase with client data
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        clients(
          first_name,
          last_name,
          email,
          phone,
          address
        )
      `)
      .eq('id', appointmentId)
      .single();

    if (error) {
      console.error('Error fetching appointment:', error);
      throw error;
    }

    if (!appointment.clients?.email) {
      throw new Error('Client email not found');
    }

    // Prepare email content
    const clientName = `${appointment.clients.first_name} ${appointment.clients.last_name}` || 'Valued Customer';

    // Format date
    const appointmentDate = new Date(appointment.preferred_date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    const formattedTime = appointment.preferred_time || 'TBD';

    // Send email
    const { data, error: emailError } = await resend.emails.send({
      from: 'Martin Painting <onboarding@resend.dev>',
      to: 'joshua.martin1@edu.sait.ca',
      subject: `Appointment Confirmation – ${formattedDate}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </head>
        <body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">

          <table width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 0; background-color: #f3f4f6;">
            <tr>
              <td align="center">

                <table width="600" cellpadding="0" cellspacing="0" style="background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">

                  <!-- Header -->
                  <tr>
                    <td style="padding: 40px; background: linear-gradient(135deg, #74A744 0%, #5F9136 100%); text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">MARTIN PAINTING</h1>
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Professional Painting Services</p>
                    </td>
                  </tr>

                  <!-- Greeting -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px;">
                      <h2 style="margin: 0; color: #1f2937; font-size: 24px;">Your Appointment is Confirmed</h2>
                      <p style="margin: 15px 0 0; color: #6b7280; font-size: 16px;">
                        Hi ${clientName},<br><br>
                        This email is to confirm your upcoming consultation appointment with Martin Painting.
                      </p>
                    </td>
                  </tr>

                  <!-- Appointment Details Box -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <tr>
                          <td style="padding: 25px;">

                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Date:</span>
                                  <span style="float: right; font-weight: 600; color: #1f2937; font-size: 14px;">
                                    ${formattedDate}
                                  </span>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Time:</span>
                                  <span style="float: right; font-weight: 600; color: #1f2937; font-size: 14px;">
                                    ${formattedTime}
                                  </span>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Property Type:</span>
                                  <span style="float: right; font-weight: 600; color: #1f2937; font-size: 14px;">
                                    ${appointment.property_type || 'N/A'}
                                  </span>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Location Type:</span>
                                  <span style="float: right; font-weight: 600; color: #1f2937; font-size: 14px;">
                                    ${appointment.location_type || 'N/A'}
                                  </span>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Address:</span>
                                  <span style="float: right; font-weight: 600; color: #1f2937; font-size: 14px; text-align: right;">
                                    ${appointment.clients?.address || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                            </table>

                            ${appointment.details ? `
                              <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb;">
                                <p style="margin: 0; color: #6b7280; font-size: 14px;">Project Details:</p>
                                <p style="margin-top: 5px; color: #1f2937; font-size: 14px; line-height: 1.6;">
                                  ${appointment.details}
                                </p>
                              </div>
                            ` : ''}

                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- What to Expect -->
                  <tr>
                    <td style="padding: 30px 40px;">
                      <h3 style="margin: 0 0 10px; color: #1f2937; font-size: 18px;">What to Expect</h3>
                      <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                        - A team member will arrive at the scheduled time.<br>
                        - We will assess your project needs in detail.<br>
                        - You will receive a written quote within 24–48 hours.<br>
                        - The consultation is free and without obligation.
                      </p>
                    </td>
                  </tr>

                  <!-- Contact Info -->
                  <tr>
                    <td style="padding: 0 40px 40px 40px;">
                      <p style="margin: 0; color: #6b7280; font-size: 14px;">
                        If you need to reschedule or have questions, feel free to contact us.
                      </p>
                      <p style="margin: 15px 0 0; color: #6b7280; font-size: 14px;">
                        <strong>Phone:</strong> (403) 555-PAINT<br />
                        <strong>Email:</strong> info@martinpainting.com
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        Thank you for choosing Martin Painting.
                      </p>
                      <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                        This is an automated email.
                      </p>
                    </td>
                  </tr>

                </table>

              </td>
            </tr>
          </table>

        </body>
        </html>
      `
    });

    if (emailError) throw emailError;

    // Update appointment record
    await supabase
      .from('appointments')
      .update({
        confirmation_email_sent: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', appointmentId);

    // Return success response  
    return Response.json({
      success: true,
      message: 'Appointment confirmation sent successfully',
      data
    });

    // End of try block
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
