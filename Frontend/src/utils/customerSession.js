const SESSION_TOKEN_KEY = 'restoflow.tableSessionToken'
const QR_TOKEN_KEY = 'restoflow.tableQrToken'
const TABLE_NUMBER_KEY = 'restoflow.tableNumber'

export function getCustomerSession() {
  const sessionToken = sessionStorage.getItem(SESSION_TOKEN_KEY)
  if (!sessionToken) return null

  return {
    sessionToken,
    qrToken: sessionStorage.getItem(QR_TOKEN_KEY),
    tableNumber: sessionStorage.getItem(TABLE_NUMBER_KEY),
  }
}

export function saveCustomerSession(session, qrToken) {
  sessionStorage.setItem(SESSION_TOKEN_KEY, session.sessionToken)
  sessionStorage.setItem(QR_TOKEN_KEY, qrToken)
  sessionStorage.setItem(TABLE_NUMBER_KEY, session.tableNumber)
}

export function clearCustomerSession() {
  sessionStorage.removeItem(SESSION_TOKEN_KEY)
  sessionStorage.removeItem(QR_TOKEN_KEY)
  sessionStorage.removeItem(TABLE_NUMBER_KEY)
}
