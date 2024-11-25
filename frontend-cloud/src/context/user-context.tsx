/* eslint-disable @typescript-eslint/explicit-function-return-type */
import React, { createContext, useState, useContext, ReactNode } from 'react'
import { User as FirebaseUser } from 'firebase/auth'

// Extend the Firebase User type to include custom properties
interface CustomUser extends FirebaseUser {
  role?: 'student' | 'teacher' // Optional role property
}

interface UserContextProps {
  user: CustomUser | null
  setUser: React.Dispatch<React.SetStateAction<CustomUser | null>>
}

const UserContext = createContext<UserContextProps | undefined>(undefined)

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null)

  return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
