
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.21.0'

// Define your Supabase URL and anon key
const supabaseUrl = 'https://gglmfscrnyxvuyvwfxkw.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbG1mc2Nybnl4dnV5dndmeGt3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ2MzAyNzIsImV4cCI6MjA2MDIwNjI3Mn0.3qScP80UckABrqHH10ta378-hVv8N3PK2WwHKzjWpXg'

// Create a Supabase client with the admin key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Define user data
const beneficiaries = [
  {
    email: 'ananya.sharma@example.com',
    full_name: 'Ananya Sharma',
    contact_info: '+91 98765-43210',
    needs: 'Education support for children',
    additional_info: { address: 'Malviya Nagar, Delhi', familySize: 4, primaryNeeds: ['Education', 'Healthcare'] }
  },
  {
    email: 'rajiv.malhotra@example.com',
    full_name: 'Rajiv Malhotra',
    contact_info: '+91 87654-32109',
    needs: 'Healthcare for elderly family members',
  },
  {
    email: 'priya.patel@example.com',
    full_name: 'Priya Patel',
    contact_info: '+91 76543-21098',
    needs: 'Skill development training',
  },
  {
    email: 'vikram.singh@example.com',
    full_name: 'Vikram Singh',
    contact_info: '+91 65432-10987',
    needs: 'Housing support',
  },
  {
    email: 'meera.devi@example.com',
    full_name: 'Meera Devi',
    contact_info: '+91 54321-09876',
    needs: 'Food security',
  }
]

const staff = [
  {
    email: 'arun.kumar@ngo.org',
    full_name: 'Arun Kumar',
    contact_info: '+91 98765-12345',
    position: 'Program Manager',
    department: 'Education',
    additional_info: { experience: '5 years', specialization: 'Children Education Programs' }
  },
  {
    email: 'divya.reddy@ngo.org',
    full_name: 'Divya Reddy',
    contact_info: '+91 87654-23456',
    position: 'Field Coordinator',
    department: 'Healthcare',
  },
  {
    email: 'sunil.joshi@ngo.org',
    full_name: 'Sunil Joshi',
    contact_info: '+91 76543-34567',
    position: 'Resource Manager',
    department: 'Operations',
  },
  {
    email: 'neha.gupta@ngo.org',
    full_name: 'Neha Gupta',
    contact_info: '+91 65432-45678',
    position: 'Case Worker',
    department: 'Social Services',
  },
  {
    email: 'prakash.verma@ngo.org',
    full_name: 'Prakash Verma',
    contact_info: '+91 54321-56789',
    position: 'Outreach Specialist',
    department: 'Community Relations',
  }
]

const volunteers = [
  {
    email: 'deepak.sharma@example.com',
    full_name: 'Deepak Sharma',
    contact_info: '+91 98765-67890',
    availability: 'Weekends',
    skills: ['Teaching', 'Computer Skills'],
    additional_info: { totalHours: 120 }
  },
  {
    email: 'kavita.nair@example.com',
    full_name: 'Kavita Nair',
    contact_info: '+91 87654-78901',
    availability: 'Evenings, Monday and Wednesday',
    skills: ['First Aid', 'Counseling'],
  },
  {
    email: 'rahul.khanna@example.com',
    full_name: 'Rahul Khanna',
    contact_info: '+91 76543-89012',
    availability: 'Weekday mornings',
    skills: ['Driving', 'Food Distribution'],
  },
  {
    email: 'anjali.mehta@example.com',
    full_name: 'Anjali Mehta',
    contact_info: '+91 65432-90123',
    availability: 'Flexible',
    skills: ['Event Planning', 'Photography'],
  },
  {
    email: 'kiran.desai@example.com',
    full_name: 'Kiran Desai',
    contact_info: '+91 54321-01234',
    availability: 'Tuesday, Thursday evenings',
    skills: ['Language Translation', 'Administration'],
  }
]

const admins = [
  {
    email: 'rohit.kapoor@ngo.org',
    full_name: 'Rohit Kapoor',
    contact_info: '+91 98765-10987',
    additional_info: { department: 'Management', accessLevel: 'Full', experience: '8 years in NGO sector' }
  },
  {
    email: 'sarita.agarwal@ngo.org',
    full_name: 'Sarita Agarwal',
    contact_info: '+91 87654-21098',
  }
]

// Resources data
const resources = [
  {
    name: 'School Backpack Kit',
    category: 'education',
    description: 'Complete kit with notebook, pencils, eraser, sharpener, ruler, and water bottle',
    quantity: 100,
    unit: 'kit',
    allocated: 25
  },
  {
    name: 'Monthly Ration Pack',
    category: 'food',
    description: 'Contains 5kg rice, 2kg dal, 1kg sugar, 1L cooking oil, 1kg salt, and basic spices',
    quantity: 80,
    unit: 'pack',
    allocated: 35
  },
  {
    name: 'Medical Kit',
    category: 'healthcare',
    description: 'Basic first aid supplies and common medications',
    quantity: 50,
    unit: 'kit',
    allocated: 15
  },
  {
    name: 'Woolen Blanket',
    category: 'shelter',
    description: 'Thick blanket for winter protection',
    quantity: 200,
    unit: 'piece',
    allocated: 90
  },
  {
    name: 'Solar Study Lamp',
    category: 'education',
    description: 'Solar-powered LED lamp for students in areas with limited electricity',
    quantity: 70,
    unit: 'piece',
    allocated: 30
  },
  {
    name: 'Sewing Machine',
    category: 'livelihood',
    description: 'Basic manual sewing machine for skill training and self-employment',
    quantity: 15,
    unit: 'unit',
    allocated: 5
  },
  {
    name: 'Water Filter',
    category: 'health',
    description: 'Gravity-based water filter for clean drinking water',
    quantity: 40,
    unit: 'unit',
    allocated: 20
  }
]

// Volunteer opportunities data
const volunteerOpportunities = [
  {
    title: 'Teaching Assistant at Mumbai Municipal School',
    description: 'Help teachers with classroom activities and student engagement in underprivileged schools',
    location: 'Dharavi Municipal School, Mumbai',
    date: '2025-05-15',
    start_time: '2025-05-15T09:00:00+05:30',
    end_time: '2025-05-15T13:00:00+05:30',
    spots_available: 10,
    spots_filled: 3,
    status: 'active',
    category: 'education'
  },
  {
    title: 'Health Camp in Delhi Slum Area',
    description: 'Assist medical professionals in providing basic health check-ups and awareness',
    location: 'Seemapuri, Delhi',
    date: '2025-05-20',
    start_time: '2025-05-20T08:00:00+05:30',
    end_time: '2025-05-20T17:00:00+05:30',
    spots_available: 15,
    spots_filled: 5,
    status: 'active',
    category: 'healthcare'
  },
  {
    title: 'Ration Distribution in Chennai',
    description: 'Help distribute food supplies to families affected by recent floods',
    location: 'Perumbakkam, Chennai',
    date: '2025-05-18',
    start_time: '2025-05-18T10:00:00+05:30',
    end_time: '2025-05-18T16:00:00+05:30',
    spots_available: 20,
    spots_filled: 8,
    status: 'active',
    category: 'food_security'
  },
  {
    title: 'Computer Training for Rural Youth',
    description: 'Teach basic computer skills to young adults from rural communities',
    location: 'Community Center, Jaipur, Rajasthan',
    date: '2025-06-01',
    start_time: '2025-06-01T11:00:00+05:30',
    end_time: '2025-06-01T16:00:00+05:30',
    spots_available: 8,
    spots_filled: 2,
    status: 'active',
    category: 'skill_development'
  },
  {
    title: 'Tree Plantation Drive',
    description: 'Plant trees in urban areas to increase green cover and create environmental awareness',
    location: 'Lalbagh Botanical Garden, Bangalore',
    date: '2025-06-05',
    start_time: '2025-06-05T07:00:00+05:30',
    end_time: '2025-06-05T11:00:00+05:30',
    spots_available: 25,
    spots_filled: 10,
    status: 'active',
    category: 'environment'
  }
]

// Announcements data
const announcements = [
  {
    title: 'COVID-19 Vaccination Drive',
    message: 'Free vaccination camp for all beneficiaries at our Delhi center on May 25th. Bring your Aadhar card.',
    date: '2025-05-25',
    status: 'active'
  },
  {
    title: 'School Supplies Distribution',
    message: 'Annual distribution of school supplies for registered children on June 1st at all centers.',
    date: '2025-06-01',
    status: 'active'
  },
  {
    title: 'Skill Development Workshop',
    message: 'Three-day workshop on tailoring and embroidery at our Mumbai center from May 28-30.',
    date: '2025-05-28',
    status: 'active'
  },
  {
    title: 'Staff Training Day',
    message: 'All staff members are required to attend the annual training day on June 5th at head office.',
    date: '2025-06-05',
    status: 'active'
  },
  {
    title: 'Volunteer Appreciation Event',
    message: 'Join us to celebrate our volunteers on June 10th at our Bangalore center.',
    date: '2025-06-10',
    status: 'active'
  }
]

// Main function to insert data
async function insertDemoData() {
  console.log('Starting data insertion...')
  
  // Clear existing data first (if needed)
  try {
    // Insert resources
    console.log('Inserting resources...')
    for (const resource of resources) {
      const { error } = await supabase
        .from('resources')
        .insert(resource)
      
      if (error) throw error
    }
    
    // Insert announcements
    console.log('Inserting announcements...')
    for (const announcement of announcements) {
      const { error } = await supabase
        .from('announcements')
        .insert(announcement)
      
      if (error) throw error
    }
    
    // First, insert the user profiles with generated UUIDs
    console.log('Creating beneficiary users...')
    for (const beneficiary of beneficiaries) {
      // Generate UUID
      const id = crypto.randomUUID()
      
      // Insert into profiles table first
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: id,
          full_name: beneficiary.full_name,
          role: 'beneficiary',
          is_active: true,
          contact_info: beneficiary.contact_info,
          additional_info: beneficiary.additional_info || null
        })
      
      if (profileError) throw profileError
      
      // Use the same ID for beneficiary_users
      const { error: beneficiaryError } = await supabase
        .from('beneficiary_users')
        .insert({
          id: id,
          full_name: beneficiary.full_name,
          email: beneficiary.email,
          contact_info: beneficiary.contact_info,
          needs: beneficiary.needs
        })
      
      if (beneficiaryError) throw beneficiaryError
    }
    
    // Create staff users with same approach
    console.log('Creating staff users...')
    for (const staffMember of staff) {
      const id = crypto.randomUUID()
      
      // Insert into profiles table first
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: id,
          full_name: staffMember.full_name,
          role: 'staff',
          is_active: true,
          contact_info: staffMember.contact_info,
          additional_info: staffMember.additional_info || null
        })
      
      if (profileError) throw profileError
      
      // Use the same ID for staff_users
      const { error: staffError } = await supabase
        .from('staff_users')
        .insert({
          id: id,
          full_name: staffMember.full_name,
          email: staffMember.email,
          contact_info: staffMember.contact_info,
          position: staffMember.position,
          department: staffMember.department
        })
      
      if (staffError) throw staffError
    }
    
    // Create volunteer users with same approach
    console.log('Creating volunteer users...')
    for (const volunteer of volunteers) {
      const id = crypto.randomUUID()
      
      // Insert into profiles table first
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: id,
          full_name: volunteer.full_name,
          role: 'volunteer',
          is_active: true,
          contact_info: volunteer.contact_info,
          additional_info: volunteer.additional_info || null
        })
      
      if (profileError) throw profileError
      
      // Use the same ID for volunteer_users
      const { error: volunteerError } = await supabase
        .from('volunteer_users')
        .insert({
          id: id,
          full_name: volunteer.full_name,
          email: volunteer.email,
          contact_info: volunteer.contact_info,
          availability: volunteer.availability,
          skills: volunteer.skills
        })
      
      if (volunteerError) throw volunteerError
    }
    
    // Create admin users with same approach
    console.log('Creating admin users...')
    for (const admin of admins) {
      const id = crypto.randomUUID()
      
      // Insert into profiles table first
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: id,
          full_name: admin.full_name,
          role: 'admin',
          is_active: true,
          contact_info: admin.contact_info,
          additional_info: admin.additional_info || null
        })
      
      if (profileError) throw profileError
      
      // Use the same ID for admin_users
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: id,
          full_name: admin.full_name,
          email: admin.email,
          contact_info: admin.contact_info
        })
      
      if (adminError) throw adminError
    }
    
    // Insert volunteer opportunities
    console.log('Inserting volunteer opportunities...')
    // Get one staff user ID to use as created_by
    const { data: staffUser } = await supabase
      .from('staff_users')
      .select('id')
      .limit(1)
      .single()
    
    for (const opportunity of volunteerOpportunities) {
      const { error } = await supabase
        .from('volunteer_opportunities')
        .insert({
          ...opportunity,
          created_by: staffUser.id
        })
      
      if (error) throw error
    }
    
    // Create relationships between users for tasks, needs, etc.
    console.log('Creating relationships between data...')
    
    // Get IDs
    const { data: beneficiaryIds } = await supabase
      .from('beneficiary_users')
      .select('id, full_name')
    
    const { data: staffIds } = await supabase
      .from('staff_users')
      .select('id, full_name')
    
    const { data: adminIds } = await supabase
      .from('admin_users')
      .select('id')
    
    if (beneficiaryIds && staffIds && adminIds) {
      // Create beneficiary needs
      console.log('Creating beneficiary needs...')
      const needs = [
        {
          beneficiary_id: beneficiaryIds[0].id,
          category: 'education',
          description: 'School supplies and tuition support for two children (ages 8 and 10)',
          priority: 'high',
          status: 'pending',
          assigned_to: staffIds[0].id
        },
        {
          beneficiary_id: beneficiaryIds[1].id,
          category: 'healthcare',
          description: 'Medical assistance for elderly parents (diabetes and hypertension medication)',
          priority: 'high',
          status: 'in-progress',
          assigned_to: staffIds[1].id
        },
        {
          beneficiary_id: beneficiaryIds[2].id,
          category: 'skill_development',
          description: 'Tailoring training program for self-employment',
          priority: 'medium',
          status: 'pending'
        },
        {
          beneficiary_id: beneficiaryIds[3].id,
          category: 'housing',
          description: 'Temporary shelter support after displacement due to urban development',
          priority: 'high',
          status: 'in-progress',
          assigned_to: staffIds[3].id
        },
        {
          beneficiary_id: beneficiaryIds[4].id,
          category: 'food_security',
          description: 'Monthly ration support for family of five',
          priority: 'medium',
          status: 'pending',
          assigned_to: staffIds[2].id
        },
        {
          beneficiary_id: beneficiaryIds[0].id,
          category: 'healthcare',
          description: 'Eye check-up and glasses for eldest child',
          priority: 'low',
          status: 'completed',
          assigned_to: staffIds[1].id
        }
      ]
      
      for (const need of needs) {
        const { error } = await supabase
          .from('beneficiary_needs')
          .insert(need)
        
        if (error) throw error
      }
      
      // Create service requests
      console.log('Creating service requests...')
      const serviceRequests = [
        {
          beneficiary_id: beneficiaryIds[0].id,
          service_type: 'education',
          description: 'School admission assistance for daughter in Class 6',
          urgency: 'medium',
          status: 'pending'
        },
        {
          beneficiary_id: beneficiaryIds[1].id,
          service_type: 'healthcare',
          description: 'Hospital referral for father requiring cardiac treatment',
          urgency: 'high',
          status: 'in-progress',
          assigned_staff: staffIds[1].id
        },
        {
          beneficiary_id: beneficiaryIds[2].id,
          service_type: 'legal',
          description: 'Help with obtaining income certificate from local authorities',
          urgency: 'low',
          status: 'pending'
        },
        {
          beneficiary_id: beneficiaryIds[3].id,
          service_type: 'housing',
          description: 'Assistance with rental housing after eviction',
          urgency: 'high',
          status: 'in-progress',
          assigned_staff: staffIds[3].id
        },
        {
          beneficiary_id: beneficiaryIds[4].id,
          service_type: 'employment',
          description: 'Job placement support after completion of skill training',
          urgency: 'medium',
          status: 'pending',
          assigned_staff: staffIds[4].id
        }
      ]
      
      for (const request of serviceRequests) {
        const { error } = await supabase
          .from('service_requests')
          .insert(request)
        
        if (error) throw error
      }
      
      // Create staff tasks
      console.log('Creating staff tasks...')
      const tasks = [
        {
          title: 'Organize Education Workshop',
          description: 'Plan and execute workshop on importance of education for slum community parents',
          assigned_to: staffIds[0].id,
          status: 'pending',
          priority: 'medium',
          due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: adminIds[0].id
        },
        {
          title: 'Medical Camp Coordination',
          description: 'Coordinate with local doctors and volunteers for upcoming health camp in Dharavi',
          assigned_to: staffIds[1].id,
          status: 'in-progress',
          priority: 'high',
          due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: adminIds[0].id
        },
        {
          title: 'Ration Distribution Planning',
          description: 'Create distribution plan for monthly ration to identified families',
          assigned_to: staffIds[2].id,
          status: 'pending',
          priority: 'high',
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: adminIds[1].id
        },
        {
          title: 'Beneficiary Verification',
          description: 'Conduct home visits to verify new beneficiary applications',
          assigned_to: staffIds[3].id,
          status: 'in-progress',
          priority: 'medium',
          due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: adminIds[1].id
        },
        {
          title: 'Volunteer Training Session',
          description: 'Organize orientation session for new volunteers',
          assigned_to: staffIds[4].id,
          status: 'pending',
          priority: 'low',
          due_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: adminIds[0].id
        }
      ]
      
      for (const task of tasks) {
        const { error } = await supabase
          .from('staff_tasks')
          .insert(task)
        
        if (error) throw error
      }
    }
    
    console.log('Demo data successfully inserted!')
    return { success: true, message: 'Demo data successfully inserted' }
  } catch (error) {
    console.error('Error inserting demo data:', error)
    return { success: false, error: error.message }
  }
}

// Handle HTTP requests
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }
  
  try {
    const result = await insertDemoData()
    
    return new Response(
      JSON.stringify(result),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: result.success ? 200 : 500
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        },
        status: 500
      }
    )
  }
})
