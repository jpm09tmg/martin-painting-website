import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return Response.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Send email to admin
    const { data, error: emailError } = await resend.emails.send({
      from: 'Martin Painting <onboarding@resend.dev>',
      to: 'joshua.martin1@edu.sait.ca',
      replyTo: email, // Customer's email for easy replies
      subject: `Contact Form: ${subject}`,
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
                      <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px; opacity: 0.9;">Contact Form Submission</p>
                    </td>
                  </tr>

                  <!-- Subject -->
                  <tr>
                    <td style="padding: 40px 40px 20px 40px;">
                      <h2 style="margin: 0; color: #1f2937; font-size: 24px;">${subject}</h2>
                      <p style="margin: 15px 0 0; color: #6b7280; font-size: 14px;">
                        You have received a new message from your website contact form.
                      </p>
                    </td>
                  </tr>

                  <!-- Contact Details Box -->
                  <tr>
                    <td style="padding: 0 40px;">
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="background-color: #f9fafb; border-radius: 8px; border: 1px solid #e5e7eb;">
                        <tr>
                          <td style="padding: 25px;">

                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">From:</span>
                                  <span style="float: right; font-weight: 600; color: #1f2937; font-size: 14px;">
                                    ${name}
                                  </span>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Email:</span>
                                  <span style="float: right; font-weight: 600; color: #1f2937; font-size: 14px;">
                                    ${email}
                                  </span>
                                </td>
                              </tr>

                              <tr>
                                <td style="padding: 10px 0;">
                                  <span style="color: #6b7280; font-size: 14px;">Received:</span>
                                  <span style="float: right; font-weight: 600; color: #1f2937; font-size: 14px;">
                                    ${new Date().toLocaleDateString('en-US', {
                                      weekday: 'long',
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </td>
                              </tr>
                            </table>

                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Message Content -->
                  <tr>
                    <td style="padding: 30px 40px;">
                      <h3 style="margin: 0 0 15px; color: #1f2937; font-size: 18px;">Message:</h3>
                      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; border-left: 4px solid #5F9136;">
                        <p style="margin: 0; color: #1f2937; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">
                          ${message}
                        </p>
                      </div>
                    </td>
                  </tr>

                  <!-- Reply Button -->
                  <tr>
                    <td style="padding: 0 40px 40px 40px; text-align: center;">
                      <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
                         style="display: inline-block; padding: 12px 30px; background-color: #5F9136; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
                        Reply to ${name}
                      </a>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; color: #6b7280; font-size: 12px;">
                        This message was sent from the contact form on martinpainting.com
                      </p>
                      <p style="margin: 10px 0 0; color: #9ca3af; font-size: 12px;">
                        This is an automated notification.
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

    return Response.json({
      success: true,
      message: 'Message sent successfully',
      data
    });

  } catch (error) {
    console.error('Error sending contact form email:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}