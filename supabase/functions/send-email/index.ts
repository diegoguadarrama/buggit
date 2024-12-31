import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EmailRequest {
  type: 'project_invitation' | 'task_assignment';
  to: string;
  projectName?: string;
  taskTitle?: string;
  taskDescription?: string;
  taskPriority?: string;
  taskDueDate?: string;
}

const supabase = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!
);

const handler = async (req: Request): Promise<Response> => {
  console.log('Email function called');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const emailRequest: EmailRequest = await req.json();
    console.log('Email request:', emailRequest);

    let subject: string;
    let html: string;

    if (emailRequest.type === 'project_invitation') {
      subject = `You've been invited to join ${emailRequest.projectName}`;
      html = `
        <h2>Project Invitation</h2>
        <p>You've been invited to join the project "${emailRequest.projectName}".</p>
        <p>To join the project, please sign up or log in to your account.</p>
      `;
    } else if (emailRequest.type === 'task_assignment') {
      subject = `Task Assignment: ${emailRequest.taskTitle}`;
      const dueDate = emailRequest.taskDueDate 
        ? new Date(emailRequest.taskDueDate).toLocaleDateString()
        : 'No due date';
      
      html = `
        <h2>Task Assignment</h2>
        <p>You have been assigned to a task:</p>
        <ul>
          <li><strong>Title:</strong> ${emailRequest.taskTitle}</li>
          <li><strong>Description:</strong> ${emailRequest.taskDescription || 'No description'}</li>
          <li><strong>Priority:</strong> ${emailRequest.taskPriority}</li>
          <li><strong>Due Date:</strong> ${dueDate}</li>
        </ul>
      `;
    } else {
      throw new Error('Invalid email type');
    }

    console.log('Sending email with subject:', subject);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Task Manager <onboarding@resend.dev>',
        to: [emailRequest.to],
        subject,
        html,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      console.log('Email sent successfully:', data);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      const error = await res.text();
      console.error('Error from Resend:', error);
      return new Response(JSON.stringify({ error }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error: any) {
    console.error('Error in send-email function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
};

serve(handler);