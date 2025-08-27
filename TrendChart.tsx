import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getPillarColor } from '@/lib/utils';

interface TrendData {
  date: string;
  mind: number;
  body: number;
  career: number;
  skills: number;
  finance: number;
}

interface TrendChartProps {
  data: TrendData[];
  focusPillar?: string;
}

const pillarColors = {
  mind: '#e74c3c',
  body: '#2ecc71', 
  career: '#f39c12',
  skills: '#3498db',
  finance: '#9b59b6'
};

export function TrendChart({ data, focusPillar }: TrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        <div className="text-center">
          <i className="fas fa-chart-line text-4xl mb-4 opacity-50"></i>
          <p>No trend data available</p>
          <p className="text-sm">Start tracking daily ratings to see trends</p>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="chart-container" data-testid="trend-chart">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            stroke="hsl(var(--muted-foreground))"
          />
          <YAxis 
            domain={[0, 5]}
            stroke="hsl(var(--muted-foreground))"
          />
          <Tooltip 
            labelFormatter={(label) => `Week of ${formatDate(label)}`}
            contentStyle={{
              backgroundColor: 'hsl(var(--popover))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
          />
          <Legend />
          
          <Line
            type="monotone"
            dataKey="mind"
            stroke={pillarColors.mind}
            strokeWidth={focusPillar === 'mind' ? 3 : 2}
            name="Mind"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="body"
            stroke={pillarColors.body}
            strokeWidth={focusPillar === 'body' ? 3 : 2}
            name="Body"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="career"
            stroke={pillarColors.career}
            strokeWidth={focusPillar === 'career' ? 3 : 2}
            name="Career"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="skills"
            stroke={pillarColors.skills}
            strokeWidth={focusPillar === 'skills' ? 3 : 2}
            name="Skills"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="finance"
            stroke={pillarColors.finance}
            strokeWidth={focusPillar === 'finance' ? 3 : 2}
            name="Finance"
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
