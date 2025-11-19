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

    const clientName = appointment.clients 
      ? `${appointment.clients.first_name} ${appointment.clients.last_name}`
      : 'Valued Customer';

    // Format date nicely
    const appointmentDate = new Date(appointment.preferred_date);
    const formattedDate = appointmentDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });