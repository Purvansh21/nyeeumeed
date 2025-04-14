
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

// Handle CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    })
  }
}

// Create demo users
const createDemoUsers = async () => {
  const demoUsers = [
    {
      email: 'admin@ngo.org',
      password: 'admin123',
      fullName: 'Admin User',
      role: 'admin',
      contactInfo: '+1 123-456-7890',
      additionalInfo: {
        department: 'Management',
        accessLevel: 'Full'
      }
    },
    {
      email: 'staff@ngo.org',
      password: 'staff123',
      fullName: 'Staff Member',
      role: 'staff',
      contactInfo: '+1 234-567-8901',
      additionalInfo: {
        department: 'Operations',
        specialization: 'Project Management'
      }
    },
    {
      email: 'volunteer@ngo.org',
      password: 'volunteer123',
      fullName: 'Volunteer Helper',
      role: 'volunteer',
      contactInfo: '+1 345-678-9012',
      additionalInfo: {
        skills: ['Teaching', 'First Aid'],
        availability: 'Weekends'
      }
    },
    {
      email: 'beneficiary@example.com',
      password: 'beneficiary123',
      fullName: 'Service Recipient',
      role: 'beneficiary',
      contactInfo: '+1 456-789-0123',
      additionalInfo: {
        services: ['Education', 'Healthcare'],
        familySize: 4
      }
    }
  ]

  const results = []

  for (const user of demoUsers) {
    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .eq('full_name', user.fullName)
      .single()

    if (existingUser) {
      results.push({ email: user.email, status: 'already exists', id: existingUser.id })
      continue
    }

    // Create the user
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: {
        full_name: user.fullName,
        role: user.role
      }
    })

    if (authError) {
      results.push({ email: user.email, status: 'error', message: authError.message })
      continue
    }

    // Update profile with additional data
    if (authUser?.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .update({
          contact_info: user.contactInfo,
          additional_info: user.additionalInfo
        })
        .eq('id', authUser.user.id)

      results.push({ 
        email: user.email, 
        status: 'created', 
        id: authUser.user.id,
        profileUpdated: !profileError
      })
    }
  }

  return results
}

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  // Only POST method is allowed
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 405,
    })
  }

  try {
    const results = await createDemoUsers()
    
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
