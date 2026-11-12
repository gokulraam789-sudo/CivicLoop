import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts'

const tip = { contentStyle: { borderRadius: 8, border: '1px solid #DCE3DF', fontSize: 12 } }
const axis = { tickLine: false, axisLine: false, fontSize: 12 }

export const MonthlyChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={data}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE7" />
      <XAxis dataKey="month" {...axis} /><YAxis allowDecimals={false} width={28} {...axis} />
      <Tooltip {...tip} /><Legend />
      <Bar dataKey="reported" name="Reported" fill="#0F6E63" radius={[4, 4, 0, 0]} />
      <Bar dataKey="resolved" name="Resolved" fill="#F2A93B" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
)

export const Donut = ({ data }) => (
  <ResponsiveContainer width="100%" height={250}>
    <PieChart>
      <Pie data={data.filter((d) => d.value)} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={2}>
        {data.filter((d) => d.value).map((d) => <Cell key={d.name} fill={d.color} />)}
      </Pie>
      <Tooltip {...tip} /><Legend iconType="circle" />
    </PieChart>
  </ResponsiveContainer>
)

export const HBars = ({ data, max, height = 250, unit = '' }) => (
  <ResponsiveContainer width="100%" height={height}>
    <BarChart data={data} layout="vertical" margin={{ left: 8 }}>
      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5EAE7" />
      <XAxis type="number" domain={max ? [0, max] : undefined} allowDecimals={false} {...axis} />
      <YAxis type="category" dataKey="name" width={110} {...axis} />
      <Tooltip {...tip} formatter={(v) => v + unit} />
      <Bar dataKey="value" radius={[0, 4, 4, 0]}>{data.map((d, i) => <Cell key={i} fill={d.color || '#0F6E63'} />)}</Bar>
    </BarChart>
  </ResponsiveContainer>
)
