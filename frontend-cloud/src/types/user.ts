// types/user.ts
import type { User as FirebaseUser } from 'firebase/auth'

export interface CustomUser extends FirebaseUser {
  role?: 'student' | 'teacher'
}
