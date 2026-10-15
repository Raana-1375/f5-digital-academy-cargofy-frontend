import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'

const STAFF_ROLES = ['OPERATOR', 'ADMIN']

// Only operators and admins can create shipments and change their status
export function usePermissions() {
  const auth = useAuthStore()
  const isStaff = computed(() => STAFF_ROLES.includes(auth.role))

  return {
    canCreateShipment: isStaff,
    canUpdateStatus: isStaff,
  }
}
