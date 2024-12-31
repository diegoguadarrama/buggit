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

    const signUpLink = '<p>Sign up at <a href="https://www.buggit.com/">Buggit.com</a></p>';

    if (emailRequest.type === 'project_invitation') {
      subject = `You've been invited to join ${emailRequest.projectName}`;
      html = `
        <h2>Your Invitation to {emailRequest.projectName}</h2>
        <p>You've been invited to join the project "${emailRequest.projectName}".</p>
        <p>To join the project, please sign up or log in to your account.</p>
        ${signUpLink}
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
        ${signUpLink}
      `;
    } else {
      throw new Error('Invalid email type');
    }

    console.log('Sending email with subject:', subject);

    // Use the verified domain email address
    const fromAddress = 'team@buggit.com';
    console.log('Using from address:', fromAddress);

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Buggit.com <${fromAddress}>`,
        to: [emailRequest.to],
        subject,
        html,
      }),
    });

    const responseData = await res.json();
    console.log('Resend API response:', responseData);

    if (res.ok) {
      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      console.error('Error from Resend:', responseData);
      return new Response(JSON.stringify({ error: responseData }), {
        status: res.status,
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
