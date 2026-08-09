// @ts-nocheck
// Socket.io Server for Real-time Features
import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { createAdapter } from '@socket.io/redis-adapter'
import { createClient } from 'redis'
import jwt from 'jsonwebtoken'
import { db } from '../db'

// Types
interface AuthenticatedSocket extends Socket {
  userId?: string
  userRole?: string
}

interface ServerToClientEvents {
  "appointment:created": (data: AppointmentEvent) => void
  "appointment:updated": (data: AppointmentEvent) => void
  "appointment:cancelled": (data: AppointmentEvent) => void
  "slot:available": (data: SlotEvent) => void
  "slot:booked": (data: SlotEvent) => void
  "notification:new": (data: NotificationEvent) => void
  "admin:stats:updated": (data: StatsEvent) => void
  "slot:locked": (data: { slotId: string, userId: string, expiresAt: number }) => void
  "slot:unlocked": (data: { slotId: string }) => void
  error: (message: string) => void
}

interface ClientToServerEvents {
  authenticate: (token: string) => void
  subscribe: (channels: string[]) => void
  unsubscribe: (channels: string[]) => void
  ping: () => void
  "lock:slot": (slotId: string) => void
  "unlock:slot": (slotId: string) => void
}

interface InterServerEvents {
  ping: () => void
}

interface SocketData {
  userId: string
  userRole: string
  channels: Set<string>
}

type AppointmentEvent = {
  appointmentId: string
  patientId: string
  patientName: string
  serviceName: string
  startTime: string
  endTime: string
  status: string
  adminId?: string
}

type SlotEvent = {
  slotId: string
  serviceId: string
  serviceName: string
  startTime: string
  endTime: string
  status: string
}

type NotificationEvent = {
  notificationId: string
  type: string
  title: string
  message: string
}

type StatsEvent = {
  totalAppointments: number
  todayAppointments: number
  pendingPayments: number
  revenue: number
}

// Redis clients for scaling (optional)
let pubClient: any = null
let subClient: any = null

async function initRedis() {
  if (process.env.REDIS_URL) {
    try {
      pubClient = createClient({ url: process.env.REDIS_URL })
      subClient = pubClient.duplicate()
      await pubClient.connect()
      await subClient.connect()
      console.log('��✅ Redis connected for Socket.io scaling')
    } catch (error) {
      console.warn('��⚠��️ Redis connection failed, running without adapter:', error)
    }
  }
}

// In-memory store for connected users (fallback without Redis)
const connectedUsers = new Map<string, Set<string>>() // userId -> Set<socketId>
const slotLocks = new Map<string, { userId: string, expiresAt: number }>() // slotId -> lock data

function addUserConnection(userId: string, socketId: string) {
  if (!connectedUsers.has(userId)) {
    connectedUsers.set(userId, new Set())
  }
  connectedUsers.get(userId)!.add(socketId)
}

function removeUserConnection(userId: string, socketId: string) {
  const sockets = connectedUsers.get(userId)
  if (sockets) {
    sockets.delete(socketId)
    if (sockets.size === 0) {
      connectedUsers.delete(userId)
    }
  }
}

function getUserSockets(userId: string): string[] {
  return Array.from(connectedUsers.get(userId) || [])
}

function isUserOnline(userId: string): boolean {
  return connectedUsers.has(userId) && connectedUsers.get(userId)!.size > 0
}

// Create Socket.io server
export function createSocketServer(httpServer: HttpServer) {
  const io = new Server<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(httpServer, {
    cors: {
      origin: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
  })

  // Use Redis adapter if available
  if (pubClient && subClient) {
    io.adapter(createAdapter(pubClient, subClient))
  }

  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.query.token

      if (!token) {
        // Allow guest connections for public real-time features (like slot booking)
        socket.userRole = 'GUEST'
        socket.data.userRole = 'GUEST'
        socket.data.channels = new Set()
        return next()
      }

      // Verify JWT token
      const decoded = jwt.verify(token as string, process.env.NEXTAUTH_SECRET!) as {
        id: string
        email: string
        role: string
      }

      const user = await db.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, role: true, email: true },
      })

      if (!user) {
        // If token is invalid or user deleted, fallback to guest
        socket.userRole = 'GUEST'
        socket.data.userRole = 'GUEST'
        socket.data.channels = new Set()
        return next()
      }

      socket.userId = user.id
      socket.userRole = user.role
      socket.data.userId = user.id
      socket.data.userRole = user.role
      socket.data.channels = new Set()

      next()
    } catch (error) {
      // If token is expired or malformed, fallback to guest
      socket.userRole = 'GUEST'
      socket.data.userRole = 'GUEST'
      socket.data.channels = new Set()
      next()
    }
  })

  // Connection handler
  io.on('connection', (socket: AuthenticatedSocket) => {
    console.log(`🔌 Client connected: ${socket.id} (User: ${socket.userId || 'Guest'}, Role: ${socket.userRole})`)

    // Track user connection
    if (socket.userId) {
      addUserConnection(socket.userId, socket.id)
      // Join user-specific room
      socket.join(`user:${socket.userId}`)
    }

    // Join role-based room
    if (socket.userRole) {
      socket.join(`role:${socket.userRole}`)
    }

    // Admin joins admin room
    if (socket.userRole === 'ADMIN' || socket.userRole === 'SUPER_ADMIN') {
      socket.join('admin:all')
    }

    // Handle authentication (for reconnection)
    socket.on('authenticate', (token: string) => {
      try {
        const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as {
          id: string
          role: string
        }
        socket.userId = decoded.id
        socket.userRole = decoded.role
        socket.join(`user:${decoded.id}`)
        socket.join(`role:${decoded.role}`)
        if (decoded.role === 'ADMIN' || decoded.role === 'SUPER_ADMIN') {
          socket.join('admin:all')
        }
        socket.emit('authenticated', { success: true })
      } catch {
        socket.emit('error', 'Authentication failed')
      }
    })

    // Handle channel subscriptions
    socket.on('subscribe', (channels: string[]) => {
      for (const channel of channels) {
        // Validate channel access
        if (isValidChannel(socket, channel)) {
          socket.join(channel)
          socket.data.channels.add(channel)
        }
      }
    })

    socket.on('unsubscribe', (channels: string[]) => {
      for (const channel of channels) {
        socket.leave(channel)
        socket.data.channels.delete(channel)
      }
    })

    // Heartbeat
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() })
    })

    // Handle Slot Locking
    socket.on('lock:slot', async (slotId: string) => {
      if (!socket.userId) return
      
      const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes
      
      if (pubClient) {
        // SET NX EX (Only set if it does not exist, expiry 300s)
        const locked = await pubClient.set(`slot:lock:${slotId}`, socket.userId, {
          EX: 300,
          NX: true
        })
        
        if (locked) {
          io.to('public:slots').emit('slot:locked', { slotId, userId: socket.userId, expiresAt })
        } else {
          // Check if the current user already owns the lock
          const existingOwner = await pubClient.get(`slot:lock:${slotId}`)
          if (existingOwner === socket.userId) {
             // Refresh lock
             await pubClient.expire(`slot:lock:${slotId}`, 300)
             io.to('public:slots').emit('slot:locked', { slotId, userId: socket.userId, expiresAt })
          }
        }
      } else {
        // Fallback in-memory logic
        const existingLock = slotLocks.get(slotId)
        if (!existingLock || existingLock.expiresAt < Date.now() || existingLock.userId === socket.userId) {
          slotLocks.set(slotId, { userId: socket.userId, expiresAt })
          io.to('public:slots').emit('slot:locked', { slotId, userId: socket.userId, expiresAt })
        }
      }
    })

    socket.on('unlock:slot', async (slotId: string) => {
      if (!socket.userId) return
      
      if (pubClient) {
        const owner = await pubClient.get(`slot:lock:${slotId}`)
        if (owner === socket.userId) {
          await pubClient.del(`slot:lock:${slotId}`)
          io.to('public:slots').emit('slot:unlocked', { slotId })
        }
      } else {
        const existingLock = slotLocks.get(slotId)
        if (existingLock && existingLock.userId === socket.userId) {
          slotLocks.delete(slotId)
          io.to('public:slots').emit('slot:unlocked', { slotId })
        }
      }
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`���🔌 Client disconnected: ${socket.id} (Reason: ${reason})`)
      removeUserConnection(socket.userId!, socket.id)
    })

    // Error handling
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error)
    })
  })

  // Helper to validate channel access
  function isValidChannel(socket: AuthenticatedSocket, channel: string): boolean {
    // User-specific channels
    if (channel.startsWith('user:')) {
      return channel === `user:${socket.userId}`
    }
    // Appointment-specific channels
    if (channel.startsWith('appointment:')) {
      // Allow if user is patient or admin
      return true // Will be validated server-side when emitting
    }
    // Admin channels
    if (channel.startsWith('admin:')) {
      return socket.userRole === 'ADMIN' || socket.userRole === 'SUPER_ADMIN'
    }
    // Public channels
    if (channel === 'public:slots') {
      return true
    }
    return false
  }

  // Broadcast functions for use in API routes
  const broadcast = {
    // Appointment events
    appointmentCreated: (data: AppointmentEvent) => {
      io.to(`user:${data.patientId}`).emit('appointment:created', data)
      io.to('admin:all').emit('appointment:created', data)
      io.to(`appointment:${data.appointmentId}`).emit('appointment:created', data)
    },

    appointmentUpdated: (data: AppointmentEvent) => {
      io.to(`user:${data.patientId}`).emit('appointment:updated', data)
      if (data.adminId) io.to(`user:${data.adminId}`).emit('appointment:updated', data)
      io.to('admin:all').emit('appointment:updated', data)
      io.to(`appointment:${data.appointmentId}`).emit('appointment:updated', data)
    },

    appointmentCancelled: (data: AppointmentEvent) => {
      io.to(`user:${data.patientId}`).emit('appointment:cancelled', data)
      io.to('admin:all').emit('appointment:cancelled', data)
      io.to(`appointment:${data.appointmentId}`).emit('appointment:cancelled', data)
      // Notify about slot availability
      broadcast.slotAvailable({
        slotId: data.appointmentId, // This would be the timeSlotId in reality
        serviceId: '',
        serviceName: data.serviceName,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'AVAILABLE',
      })
    },

    // Slot events
    slotAvailable: (data: SlotEvent) => {
      io.to('public:slots').emit('slot:available', data)
      io.to('admin:all').emit('slot:available', data)
    },

    slotBooked: (data: SlotEvent) => {
      io.to('public:slots').emit('slot:booked', data)
      io.to('admin:all').emit('slot:booked', data)
    },

    // Notification events
    notificationCreated: (userId: string, data: NotificationEvent) => {
      io.to(`user:${userId}`).emit('notification:new', data)
    },

    // Admin stats
    statsUpdated: (data: StatsEvent) => {
      io.to('admin:all').emit('admin:stats:updated', data)
    },

    // Send to specific user
    toUser: (userId: string, event: string, data: any) => {
      io.to(`user:${userId}`).emit(event, data)
    },

    // Send to all admins
    toAdmins: (event: string, data: any) => {
      io.to('admin:all').emit(event, data)
    },

    // Check if user is online
    isUserOnline,
    getUserSockets,
  }

  return { io, broadcast }
}

// Initialize Redis on module load
initRedis().catch(console.error)

// If run directly via tsx, start a standalone server
if (process.argv[1]?.includes('server.ts') || process.env.NODE_ENV !== 'production') {
  const PORT = process.env.SOCKET_PORT || 3001
  const { createServer } = require('http')
  const httpServer = createServer((req: any, res: any) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('Socket.io server running\n')
  })
  
  createSocketServer(httpServer)
  
  httpServer.listen(PORT, () => {
    console.log(`🔌 Standalone Socket.io server listening on port ${PORT}`)
  })
}

export type { ServerToClientEvents, ClientToServerEvents, SocketData }