import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ShellClient from '@/components/budget/ShellClient'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: membership } = await supabase
    .from('household_members')
    .select('household_id, role, households(id, name, invite_code)')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!membership) redirect('/onboarding')

  const household = Array.isArray(membership.households)
    ? membership.households[0]
    : membership.households

  return (
    <ShellClient
      userEmail={user.email ?? ''}
      householdName={household?.name ?? ''}
      inviteCode={household?.invite_code ?? ''}
    >
      {children}
    </ShellClient>
  )
}
