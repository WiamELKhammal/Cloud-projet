import { useEffect, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'

export default function Calendar() {
  const [events, setEvents] = useState([])

  // Cette fonction est utilisée pour récupérer les projets
  const fetchProjects = async () => {
    const teacherUid = 'teacherUidDynamique' // Récupère dynamiquement l'UID de l'enseignant

    // Récupérer les projets du backend
    const responseProjects = await fetch(`http://localhost:5000/api/projects?teacherUid=${teacherUid}`)

    if (responseProjects.ok) {
      const projects = await responseProjects.json()

      // Récupérer les utilisateurs (les étudiants) pour associer l'email
      const responseUsers = await fetch('http://localhost:5000/api/users?role=student')
      if (responseUsers.ok) {
        const users = await responseUsers.json()

        // Formater les projets et ajouter l'email de l'utilisateur concerné
        const formattedEvents = projects.map(
          (project: { person_uid: any; title: any; created_at: any; deadline: any; status: any; matiere: any }) => {
            // Trouver l'utilisateur correspondant à ce projet
            const user = users.find((user: { uid: any }) => user.uid === project.person_uid)

            return {
              title: `${project.title} `,
              start: project.created_at,
              end: project.deadline,
              extendedProps: {
                status: project.status,
                matiere: project.matiere,
              },
            }
          }
        )

        setEvents(formattedEvents)
      } else {
        console.error('Erreur lors de la récupération des utilisateurs')
      }
    } else {
      console.error('Erreur lors de la récupération des projets')
    }
  }

  useEffect(() => {
    fetchProjects() // Appelle la fonction dès le chargement de la page
  }, [])

  return (
    <div>
      <h1>Calendrier des Projets</h1>
      <FullCalendar
        plugins={[dayGridPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventContent={(info) => (
          <>
            <b>{info.event.title}</b>
            <i>{info.event.extendedProps.status}</i>
          </>
        )}
      />
    </div>
  )
}
