// Socket.io Client Hook
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

type ServerToClientEvents = {
  'appointment:created': (data: any) => void
  'appointment:updated': (data: any) => void
  'appointment:cancelled': (data: any) => void
  'slot:available': (data: any) => void
  'slot:booked': (data: any) => void
  'slot:locked': (data: { slotId: string, userId: string, expiresAt: number }) => void
  'slot:unlocked': (data: { slotId: string }) => void
  'notification:new': (data: any) => void
  'admin:stats:updated': (data: any) => void
  error: (message: string) => void
  authenticated: (data: { success: boolean }) => void
  pong: (data: { timestamp: number }) => void
}

type ClientToServerEvents = {
  authenticate: (token: string) => void
  subscribe: (channels: string[]) => void
  unsubscribe: (channels: string[]) => void
  ping: () => void
  'lock:slot': (slotId: string) => void
  'unlock:slot': (slotId: string) => void
}

type SocketType = Socket<ServerToClientEvents, ClientToServerEvents>

interface UseSocketOptions {
  autoConnect?: boolean
  channels?: string[]
  onAppointmentCreated?: (data: any) => void
  onAppointmentUpdated?: (data: any) => void
  onAppointmentCancelled?: (data: any) => void
  onSlotAvailable?: (data: any) => void
  onSlotBooked?: (data: any) => void
  onSlotLocked?: (data: { slotId: string, userId: string, expiresAt: number }) => void
  onSlotUnlocked?: (data: { slotId: string }) => void
  onNotification?: (data: any) => void
  onStatsUpdated?: (data: any) => void
  onError?: (error: string) => void
}

export function useSocket(options: UseSocketOptions = {}) {
  const {
    autoConnect = false, // Disabled to prevent console errors
    channels = [],
    onAppointmentCreated,
    onAppointmentUpdated,
    onAppointmentCancelled,
    onSlotAvailable,
    onSlotBooked,
    onSlotLocked,
    onSlotUnlocked,
    onNotification,
    onStatsUpdated,
    onError
  } = options

  const { data: session } = useSession()
  const socketRef = useRef<SocketType | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initialize socket
  useEffect(() => {
    if (!autoConnect) return

    // Connect to same origin in production (Render), or localhost:3001 in development
    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3001')

    socketRef.current = io(socketUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      auth: {
        token: (session as any)?.accessToken || (session as any)?.user?.accessToken
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000
    })

    const socket = socketRef.current

    // Connection events
    socket.on('connect', () => {
      console.log('���🔌 Socket connected:', socket.id)
      setIsConnected(true)
      setConnectionError(null)

      // Subscribe to channels
      if (channels.length > 0) {
        socket.emit('subscribe', channels)
      }

      // Start heartbeat
      pingIntervalRef.current = setInterval(() => {
        socket.emit('ping')
      }, 30000)
    })

    socket.on('disconnect', (reason) => {
      console.log('���🔌 Socket disconnected:', reason)
      setIsConnected(false)

      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
    })

    socket.on('connect_error', (error) => {
      console.error('���🔌 Socket connection error:', error)
      setConnectionError(error.message)
      setIsConnected(false)
      onError?.(error.message)
    })

    socket.on('error', (message) => {
      console.error('���🔌 Socket error:', message)
      onError?.(message)
    })

    socket.on('authenticated', (data) => {
      console.log('���🔌 Authenticated:', data.success)
    })

    // Event handlers
    socket.on('appointment:created', (data) => {
      console.log('���📅 Appointment created:', data)
      onAppointmentCreated?.(data)
    })

    socket.on('appointment:updated', (data) => {
      console.log('���📅 Appointment updated:', data)
      onAppointmentUpdated?.(data)
    })

    socket.on('appointment:cancelled', (data) => {
      console.log('���📅 Appointment cancelled:', data)
      onAppointmentCancelled?.(data)
    })

    socket.on('slot:available', (data) => {
      console.log('🎯 Slot available:', data)
      onSlotAvailable?.(data)
    })

    socket.on('slot:booked', (data) => {
      console.log('🎯 Slot booked:', data)
      onSlotBooked?.(data)
    })

    socket.on('slot:locked', (data) => {
      console.log('🔒 Slot locked:', data)
      onSlotLocked?.(data)
    })

    socket.on('slot:unlocked', (data) => {
      console.log('🔓 Slot unlocked:', data)
      onSlotUnlocked?.(data)
    })

    socket.on('notification:new', (data) => {
      console.log('🔔 New notification:', data)
      onNotification?.(data)
    })

    socket.on('admin:stats:updated', (data) => {
      console.log('���📊 Stats updated:', data)
      onStatsUpdated?.(data)
    })

    // Cleanup
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current)
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      socket.disconnect()
      socketRef.current = null
    }
  }, [
    autoConnect,
    channels.join(','),
    session,
    onAppointmentCreated,
    onAppointmentUpdated,
    onAppointmentCancelled,
    onSlotAvailable,
    onSlotBooked,
    onSlotLocked,
    onSlotUnlocked,
    onNotification,
    onStatsUpdated,
    onError
  ])

  // Subscribe to additional channels
  const subscribe = useCallback((newChannels: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('subscribe', newChannels)
    }
  }, [])

  const unsubscribe = useCallback((channelsToLeave: string[]) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unsubscribe', channelsToLeave)
    }
  }, [])

  // Reconnect manually
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect()
    }
  }, [])

  // Disconnect manually
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect()
    }
  }, [])

  const emitLockSlot = useCallback((slotId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('lock:slot', slotId)
    }
  }, [])

  const emitUnlockSlot = useCallback((slotId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('unlock:slot', slotId)
    }
  }, [])

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    subscribe,
    unsubscribe,
    reconnect,
    disconnect,
    emitLockSlot,
    emitUnlockSlot
  }
}

// Hook for appointment-specific real-time updates
export function useAppointmentSocket(appointmentId: string | null) {
  const [appointment, setAppointment] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const { isConnected } = useSocket({
    channels: appointmentId ? [`appointment:${appointmentId}`] : [],
    onAppointmentCreated: (data) => {
      if (data.appointmentId === appointmentId) {
        setAppointment(data)
        setLoading(false)
      }
    },
    onAppointmentUpdated: (data) => {
      if (data.appointmentId === appointmentId) {
        setAppointment(data)
      }
    },
    onAppointmentCancelled: (data) => {
      if (data.appointmentId === appointmentId) {
        setAppointment({ ...data, status: 'CANCELLED' })
      }
    }
  })

  return { appointment, isConnected, loading }
}

// Hook for real-time slot availability
export function useSlotAvailability(serviceId?: string, date?: string) {
  const [slots, setSlots] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const channel = serviceId && date ? `slots:${serviceId}:${date}` : 'public:slots'

  const { isConnected } = useSocket({
    channels: [channel],
    onSlotAvailable: (data) => {
      setSlots((prev) => {
        const exists = prev.find((s) => s.slotId === data.slotId)
        if (exists) {
          return prev.map((s) =>
            s.slotId === data.slotId ? { ...s, ...data, status: 'AVAILABLE' } : s
          )
        }
        return [...prev, { ...data, status: 'AVAILABLE' }]
      })
      setLoading(false)
    },
    onSlotBooked: (data) => {
      setSlots((prev) =>
        prev.map((s) =>
          s.slotId === data.slotId
            ? { ...s, ...data, status: 'BOOKED' }
            : s
        )
      )
    },
    onSlotLocked: (data) => {
      setSlots((prev) =>
        prev.map((s) =>
          s.id === data.slotId || s.slotId === data.slotId
            ? { ...s, status: 'LOCKED', lockedBy: data.userId, expiresAt: data.expiresAt }
            : s
        )
      )
    },
    onSlotUnlocked: (data) => {
      setSlots((prev) =>
        prev.map((s) =>
          (s.id === data.slotId || s.slotId === data.slotId) && s.status === 'LOCKED'
            ? { ...s, status: 'AVAILABLE', lockedBy: undefined, expiresAt: undefined }
            : s
        )
      )
    }
  })

  return { slots, isConnected, loading, setSlots }
}

// Hook for notifications
export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => {
        if (data.notifications) {
          setNotifications(data.notifications)
          setUnreadCount(data.notifications.filter((n: any) => !n.read).length)
        }
      })
      .catch(err => console.error('Error fetching notifications:', err))
  }, [])

  const { isConnected } = useSocket({
    channels: ['notifications'],
    onNotification: (data) => {
      setNotifications((prev) => [data, ...prev])
      setUnreadCount((prev) => prev + 1)
    }
  })

  const markAsRead = useCallback((notificationId: string) => {
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationIds: [notificationId] })
    }).catch(err => console.error('Error marking notification as read', err))

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }, [])

  const markAllAsRead = useCallback(() => {
    fetch('/api/notifications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ markAll: true })
    }).catch(err => console.error('Error marking all notifications as read', err))

    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }, [])

  return { notifications, unreadCount, isConnected, markAsRead, markAllAsRead }
}

// Hook for admin dashboard stats
export function useAdminStats() {
  const [stats, setStats] = useState<any>(null)

  const { isConnected } = useSocket({
    channels: ['admin:stats'],
    onStatsUpdated: (data) => {
      setStats(data)
    }
  })

  return { stats, isConnected }
}