import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL

export const addUser = async (uid: string, email: string, role: string) => {
  try {
    const response = await axios.post(`${API_URL}/api/users`, { uid, email, role })
    return response.data
  } catch (error) {
    console.error('Error adding user:', error)
    throw error
  }
}

export const getUser = async (uid: string) => {
  try {
    const response = await axios.get(`${API_URL}/api/users/${uid}`)
    return response.data
  } catch (error) {
    console.error('Error fetching user:', error)
    throw error
  }
}
