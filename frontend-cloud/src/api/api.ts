import axios, { AxiosResponse } from 'axios';

// URL de votre backend, à récupérer depuis les variables d'environnement
const backendUrl ='https://cloud-projet.onrender.com';

// Type générique pour la réponse de l'API
export async function getData<T>(endpoint: string): Promise<T> {
  try {
    const response: AxiosResponse<T> = await axios.get(`${backendUrl}${endpoint}`);
    return response.data; // Retourne les données reçues
  } catch (error) {
    console.error('Erreur lors de l’appel API :', error);
    throw error; // Lance l'erreur pour permettre de la gérer dans le composant
  }
}
