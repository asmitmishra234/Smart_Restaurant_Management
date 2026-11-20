const roleHome = {
  ADMIN: '/admin',
  KITCHEN: '/kitchen',
  WAITER: '/waiter',
}

export function getRoleHome(role) {
  return roleHome[role] ?? '/login'
}
