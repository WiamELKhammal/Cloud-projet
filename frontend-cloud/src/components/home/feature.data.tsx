import React, { ReactNode } from 'react'
import ArtTrackIcon from '@mui/icons-material/ArtTrack'
import AttachMoneyIcon from '@mui/icons-material/AttachMoney'
import LocalLibraryIcon from '@mui/icons-material/LocalLibrary'
import ContactSupportIcon from '@mui/icons-material/ContactSupport'

interface Data {
  title: string
  description: string
  icon?: ReactNode
}

export const data: Data[] = [
  {
    title: 'Easy Collaboration',
    description: 'Easily connect and collaborate with team members from anywhere, anytime.',
    icon: <ArtTrackIcon />,
  },
  {
    title: 'Cost-Effective Solutions',
    description: 'Manage projects without the financial strain, while benefiting from affordable tools.',
    icon: <AttachMoneyIcon />,
  },
  {
    title: 'Flexible Project Timelines',
    description:
      'Set deadlines and milestones that work around your schedule, promoting a flexible approach to managing university projects.',
    icon: <LocalLibraryIcon />,
  },
  {
    title: 'Expert Mentorship',
    description:
      'Get personalized guidance and support from experienced mentors who help guide your project to success.',
    icon: <ContactSupportIcon />,
  },
]
