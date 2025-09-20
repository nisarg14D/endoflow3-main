import { AppointmentOrganizerNew } from '@/components/appointment-organizer-new'
import { getCurrentUser } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'

export default async function AssistantAppointmentsPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'assistant') {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AppointmentOrganizerNew currentAssistantId={user.id} />
    </div>
  )
}