/**
 * User data structure returned from the API
 * Based on the backend IUser interface, excluding password (which is excluded in toJSON transform)
 */
export interface User {
  _id: string
  googleId?: string
  displayName: string
  firstName?: string
  lastName?: string
  email?: string
  image?: string
  createdAt: string // ISO date string
}
