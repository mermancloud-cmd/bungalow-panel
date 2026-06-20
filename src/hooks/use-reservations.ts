import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { mockReservations } from '@/lib/mock-data'

interface Room {
  room_number: string
  room_type: string
  capacity: number
  price_per_night: number
}

interface Reservation {
  id: string
  tenant_id: string
  guest_name: string
  guest_email: string
  guest_phone: string | null
  room_id: string
  check_in_date: string
  check_out_date: string
  status: 'pending' | 'confirmed' | 'rejected' | 'cancelled'
  total_amount: number
  payment_method: string | null
  payment_status: 'pending' | 'confirmed' | 'rejected'
  payment_notes: string | null
  iban_last4: string | null
  created_at: string
  updated_at: string
  rooms?: Room
}

export function useReservations(status?: string) {
  return useQuery<{ reservations: Reservation[] }, Error>({
    queryKey: ['reservations', status],
    queryFn: async () => {
      try {
        const params = status ? `?status=${encodeURIComponent(status)}` : ''
        const response = await fetch(`/api/reservations${params}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch reservations')
        }
        
        return await response.json()
      } catch (error) {
        console.warn('API failed, falling back to mock data:', error)
        return { reservations: mockReservations }
      }
    },
    staleTime: 10 * 1000, // 10 seconds
  })
}

export function useReservation(id: string) {
  return useQuery<{ reservation: Reservation }, Error>({
    queryKey: ['reservation', id],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/reservations/${id}`)
        
        if (!response.ok) {
          throw new Error('Failed to fetch reservation')
        }
        
        return await response.json()
      } catch (error) {
        console.warn('API failed, falling back to mock data:', error)
        return { reservation: { ...mockReservations[0], id } }
      }
    },
    enabled: !!id,
    staleTime: 5 * 1000, // 5 seconds
  })
}

export function useUpdateReservationStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      status 
    }: { 
      id: string
      status: 'confirmed' | 'rejected' | 'cancelled' 
    }) => {
      const response = await fetch(`/api/reservations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update reservation')
      }

      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservation'] })
    },
  })
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ 
      id, 
      action, 
      notes 
    }: { 
      id: string
      action: 'confirm' | 'reject'
      notes?: string 
    }) => {
      const response = await fetch(`/api/reservations/${id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update payment status')
      }

      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
      queryClient.invalidateQueries({ queryKey: ['reservation'] })
    },
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (reservationData: Partial<Reservation>) => {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create reservation')
      }

      return await response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] })
    },
  })
}
