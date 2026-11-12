import { useState } from 'react'
import { api } from '../../services/api'
import { useApi } from '../../lib/hooks'
import { useAuth } from '../../context/AuthContext'
import { Loading, PageHeader, Tabs } from '../../components/ui'
import ComplaintTable from '../../components/ComplaintTable'

export default function MyComplaints() {
  const { user } = useAuth()
  const [g, setG] = useState('')
  const rows = useApi(() => api.listComplaints({ citizenId: user.id, group: g || undefined }), [g, user.id])
  return (
    <div>
      <PageHeader title="My complaints" sub="Everything you have reported, with its current status." />
      <Tabs value={g} onChange={setG} tabs={[['', 'All'], ['pending', 'Pending'], ['progress', 'In progress'], ['resolved', 'Resolved'], ['reopened', 'Reopened']]} />
      {!rows ? <Loading /> : <ComplaintTable rows={rows} showDeadline={false} empty="Nothing here yet." />}
    </div>
  )
}
