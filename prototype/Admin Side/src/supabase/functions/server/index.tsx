import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { Hono } from 'npm:hono'
import { cors } from 'npm:hono/cors'
import { logger } from 'npm:hono/logger'
import * as kv from './kv_store.tsx'

const app = new Hono()

// Middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))
app.use('*', logger(console.log))

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
)

// Create storage bucket on startup
const bucketName = 'make-5ae0b225-documents'
const initializeStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets()
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName)
    
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, { public: false })
      console.log(`Created storage bucket: ${bucketName}`)
    }
  } catch (error) {
    console.error('Error initializing storage:', error)
  }
}

await initializeStorage()

// Helper function to verify authentication
const verifyAuth = async (request: Request) => {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1]
  if (!accessToken) {
    return { error: 'No token provided', status: 401 }
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)
  if (error || !user?.id) {
    return { error: 'Invalid token', status: 401 }
  }
  
  return { user, error: null }
}

// Routes

// Authentication Routes
app.post('/make-server-5ae0b225/signup', async (c) => {
  try {
    const { email, password, name, role = 'Staff', department } = await c.req.json()
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role, department },
      email_confirm: true // Auto-confirm since email server isn't configured
    })
    
    if (error) {
      console.error('Signup error:', error)
      return c.json({ error: `Signup failed: ${error.message}` }, 400)
    }
    
    // Store user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      department,
      status: 'active',
      createdAt: new Date().toISOString(),
      lastLogin: null
    })
    
    return c.json({ user: data.user })
  } catch (error) {
    console.error('Signup error:', error)
    return c.json({ error: `Signup failed: ${error}` }, 500)
  }
})

// Projects Routes
app.get('/make-server-5ae0b225/projects', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const category = c.req.query('category')
    
    // Get user profile to check role
    const userProfile = await kv.get(`user:${authResult.user.id}`)
    
    if (category) {
      const projects = await kv.getByPrefix(`project:${category}:`)
      
      // Filter projects based on user role
      if (userProfile?.role === 'Client') {
        // Clients can only see their own projects
        const filteredProjects = projects.filter(project => 
          project.clientId === authResult.user.id
        )
        return c.json(filteredProjects)
      }
      
      return c.json(projects)
    }
    
    // Get all projects
    const allProjects = await kv.getByPrefix('project:')
    
    if (userProfile?.role === 'Client') {
      const filteredProjects = allProjects.filter(project => 
        project.clientId === authResult.user.id
      )
      return c.json(filteredProjects)
    }
    
    return c.json(allProjects)
  } catch (error) {
    console.error('Error fetching projects:', error)
    return c.json({ error: `Failed to fetch projects: ${error}` }, 500)
  }
})

app.post('/make-server-5ae0b225/projects', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    // Check if user has permission to create projects
    const userProfile = await kv.get(`user:${authResult.user.id}`)
    if (userProfile?.role === 'Client') {
      return c.json({ error: 'Clients cannot create projects' }, 403)
    }
    
    const projectData = await c.req.json()
    const projectId = `project:${projectData.category}:${Date.now()}`
    
    const project = {
      id: projectId,
      ...projectData,
      createdBy: authResult.user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(projectId, project)
    
    return c.json(project)
  } catch (error) {
    console.error('Error creating project:', error)
    return c.json({ error: `Failed to create project: ${error}` }, 500)
  }
})

app.get('/make-server-5ae0b225/projects/:id', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const projectId = c.req.param('id')
    const project = await kv.get(projectId)
    
    if (!project) {
      return c.json({ error: 'Project not found' }, 404)
    }
    
    // Check access permissions
    const userProfile = await kv.get(`user:${authResult.user.id}`)
    if (userProfile?.role === 'Client' && project.clientId !== authResult.user.id) {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    return c.json(project)
  } catch (error) {
    console.error('Error fetching project:', error)
    return c.json({ error: `Failed to fetch project: ${error}` }, 500)
  }
})

app.put('/make-server-5ae0b225/projects/:id', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const userProfile = await kv.get(`user:${authResult.user.id}`)
    if (userProfile?.role === 'Client') {
      return c.json({ error: 'Clients cannot edit projects' }, 403)
    }
    
    const projectId = c.req.param('id')
    const updateData = await c.req.json()
    
    const existingProject = await kv.get(projectId)
    if (!existingProject) {
      return c.json({ error: 'Project not found' }, 404)
    }
    
    const updatedProject = {
      ...existingProject,
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    await kv.set(projectId, updatedProject)
    
    return c.json(updatedProject)
  } catch (error) {
    console.error('Error updating project:', error)
    return c.json({ error: `Failed to update project: ${error}` }, 500)
  }
})

// File Upload/Download Routes
app.post('/make-server-5ae0b225/upload/:projectId', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const userProfile = await kv.get(`user:${authResult.user.id}`)
    if (userProfile?.role === 'Client') {
      return c.json({ error: 'Clients cannot upload documents' }, 403)
    }
    
    const projectId = c.req.param('projectId')
    const formData = await c.req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400)
    }
    
    const fileName = `${projectId}/${Date.now()}-${file.name}`
    const fileBuffer = await file.arrayBuffer()
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      })
    
    if (error) {
      console.error('Storage upload error:', error)
      return c.json({ error: `Upload failed: ${error.message}` }, 400)
    }
    
    // Store file metadata
    const fileMetadata = {
      id: `file:${projectId}:${Date.now()}`,
      projectId,
      fileName: file.name,
      storagePath: fileName,
      size: file.size,
      type: file.type,
      uploadedBy: authResult.user.id,
      uploadedAt: new Date().toISOString()
    }
    
    await kv.set(fileMetadata.id, fileMetadata)
    
    return c.json(fileMetadata)
  } catch (error) {
    console.error('Error uploading file:', error)
    return c.json({ error: `Upload failed: ${error}` }, 500)
  }
})

app.get('/make-server-5ae0b225/download/:fileId', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const fileId = c.req.param('fileId')
    const fileMetadata = await kv.get(fileId)
    
    if (!fileMetadata) {
      return c.json({ error: 'File not found' }, 404)
    }
    
    // Check access permissions
    const userProfile = await kv.get(`user:${authResult.user.id}`)
    const project = await kv.get(fileMetadata.projectId)
    
    if (userProfile?.role === 'Client' && project?.clientId !== authResult.user.id) {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileMetadata.storagePath, 3600) // 1 hour expiry
    
    if (error) {
      console.error('Error creating signed URL:', error)
      return c.json({ error: `Download failed: ${error.message}` }, 400)
    }
    
    return c.json({ downloadUrl: data.signedUrl, metadata: fileMetadata })
  } catch (error) {
    console.error('Error downloading file:', error)
    return c.json({ error: `Download failed: ${error}` }, 500)
  }
})

app.get('/make-server-5ae0b225/files/:projectId', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const projectId = c.req.param('projectId')
    const files = await kv.getByPrefix(`file:${projectId}:`)
    
    // Check access permissions
    const userProfile = await kv.get(`user:${authResult.user.id}`)
    const project = await kv.get(projectId)
    
    if (userProfile?.role === 'Client' && project?.clientId !== authResult.user.id) {
      return c.json({ error: 'Access denied' }, 403)
    }
    
    return c.json(files)
  } catch (error) {
    console.error('Error fetching files:', error)
    return c.json({ error: `Failed to fetch files: ${error}` }, 500)
  }
})

// User Management Routes (Admin only)
app.get('/make-server-5ae0b225/users', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const userProfile = await kv.get(`user:${authResult.user.id}`)
    if (userProfile?.role !== 'Admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    const users = await kv.getByPrefix('user:')
    return c.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return c.json({ error: `Failed to fetch users: ${error}` }, 500)
  }
})

app.get('/make-server-5ae0b225/dashboard-stats', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const allProjects = await kv.getByPrefix('project:')
    const userProfile = await kv.get(`user:${authResult.user.id}`)
    
    let projects = allProjects
    if (userProfile?.role === 'Client') {
      projects = allProjects.filter(project => project.clientId === authResult.user.id)
    }
    
    const stats = {
      totalProjects: projects.length,
      inProgress: projects.filter(p => p.status === 'in-progress').length,
      completed: projects.filter(p => p.status === 'completed').length,
      totalBudget: projects.reduce((sum, p) => sum + (p.totalContract || 0), 0),
      categories: {}
    }
    
    // Group by category
    projects.forEach(project => {
      const category = project.category || 'other'
      if (!stats.categories[category]) {
        stats.categories[category] = {
          projects: 0,
          budget: 0,
          completed: 0,
          inProgress: 0
        }
      }
      stats.categories[category].projects++
      stats.categories[category].budget += project.totalContract || 0
      if (project.status === 'completed') stats.categories[category].completed++
      if (project.status === 'in-progress') stats.categories[category].inProgress++
    })
    
    return c.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return c.json({ error: `Failed to fetch stats: ${error}` }, 500)
  }
})

// Initialize with sample data if no projects exist
app.post('/make-server-5ae0b225/init-sample-data', async (c) => {
  try {
    const authResult = await verifyAuth(c.req.raw)
    if (authResult.error) {
      return c.json({ error: authResult.error }, authResult.status)
    }
    
    const userProfile = await kv.get(`user:${authResult.user.id}`)
    if (userProfile?.role !== 'Admin') {
      return c.json({ error: 'Admin access required' }, 403)
    }
    
    const existingProjects = await kv.getByPrefix('project:')
    if (existingProjects.length > 0) {
      return c.json({ message: 'Sample data already exists' })
    }
    
    const sampleProjects = [
      {
        id: 'project:construction:1',
        name: 'Municipal Building Construction',
        category: 'construction',
        totalContract: 8500000,
        physicalAccomplishment: 75,
        powStatus: 'approved',
        status: 'in-progress',
        startDate: '2024-01-15',
        endDate: '2024-12-15',
        contractor: 'ABC Construction Co.',
        manager: 'John Smith',
        description: 'Comprehensive infrastructure development project for municipal facilities.',
        location: 'Municipality Center, District 1',
        createdBy: authResult.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'project:repairs:1',
        name: 'School Building Renovation',
        category: 'repairs',
        totalContract: 4200000,
        physicalAccomplishment: 30,
        powStatus: 'approved',
        status: 'in-progress',
        startDate: '2024-06-01',
        endDate: '2024-11-30',
        contractor: 'Education Builders',
        manager: 'Sarah Wilson',
        description: 'Renovation and repair of school facilities.',
        location: 'Central Elementary School',
        createdBy: authResult.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ]
    
    for (const project of sampleProjects) {
      await kv.set(project.id, project)
    }
    
    return c.json({ message: 'Sample data initialized', projects: sampleProjects.length })
  } catch (error) {
    console.error('Error initializing sample data:', error)
    return c.json({ error: `Failed to initialize data: ${error}` }, 500)
  }
})

// Health check
app.get('/make-server-5ae0b225/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

console.log('Project Management Server started')

Deno.serve(app.fetch)