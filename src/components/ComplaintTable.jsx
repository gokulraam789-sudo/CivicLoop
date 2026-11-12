import { Link } from 'react-router-dom'
import { StatusBadge, CategoryTag, Empty } from './ui'
import { fmtDate, daysLeft } from '../lib/format'

function Deadline({ c }) {
  if (c.status === 'Resolved') return <span className="text-slate-400">Done</span>
  const d = daysLeft(c.deadline)
  if (d == null) return <span className="text-slate-400">—</span>
  if (d < 0) return <span className="font-semibold text-red-600">Overdue {-d} d</span>
  return <span className={d <= 2 ? 'font-semibold text-amber-500' : ''}>{d} d left</span>
}

export default function ComplaintTable({ rows, showDept, showDeadline = true, departments, onAssign, empty }) {
  if (!rows.length) return <Empty title="No complaints match">{empty || 'Try clearing a filter or search term.'}</Empty>
  return (
    <div className="card overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-line bg-paper">
          <tr>
            <th className="th">Complaint</th><th className="th">Category</th><th className="th">Location</th><th className="th">Submitted</th>
            <th className="th">Supporters</th>{showDept && <th className="th">Department</th>}<th className="th">Status</th>{showDeadline && <th className="th">Deadline</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((c) => (
            <tr key={c.id} className="hover:bg-brand-50/40">
              <td className="td"><Link to={`/complaints/${c.id}`} className="font-semibold text-brand-700 hover:underline">{c.id}</Link>{c.parentId && <span className="ml-1 text-xs text-slate-500">(linked)</span>}</td>
              <td className="td"><CategoryTag id={c.category} /></td>
              <td className="td max-w-[220px] truncate" title={c.address}>{c.address}</td>
              <td className="td whitespace-nowrap">{fmtDate(c.createdAt)}</td>
              <td className="td">{c.supportCount}</td>
              {showDept && (
                <td className="td">
                  {onAssign ? (
                    <select aria-label={`Department for ${c.id}`} className="input !w-52 !py-1.5" value={c.deptId || ''} onChange={(e) => e.target.value && onAssign(c.id, e.target.value)}>
                      <option value="">Unassigned</option>
                      {departments.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                  ) : c.deptName}
                </td>
              )}
              <td className="td"><StatusBadge status={c.status} /></td>
              {showDeadline && <td className="td whitespace-nowrap"><Deadline c={c} /></td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
