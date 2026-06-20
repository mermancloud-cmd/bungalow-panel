import { useQuery } from '@tanstack/react-query'
import { mockDashboardStats } from '@/lib/mock-data'

interface DashboardStats {
  check_ins_today: number
  check_outs_today: number
  occupancy_rate: number
  pending_actions: number
  revenue_today: number
  active_conversations: number
  ai_enabled: boolean
  // Component display fields
  checkInsToday?: number
  checkOutsToday?: number
  occupancyRate?: number
  pendingActions?: number
  aiStatus?: string
  aiMessagesHandled?: number
  aiLastActivity?: string
  weeklyRevenue?: { day: string; revenue: number }[]
}

export function useDashboardStats() {
  return useQuery<DashboardStats, Error>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats')
        }
        
        const data = await response.json()
        return data.stats
      } catch (error) {
        console.warn('API failed, falling back to mock data:', error)
        // Graceful degradation to mock data
        return mockDashboardStats
      }
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
  })
}
