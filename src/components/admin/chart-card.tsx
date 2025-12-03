'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

// Theme colors
const CHART_COLORS = {
  primary: '#1d43d8',
  neon: '#adfc04',
  secondary: '#4f7df9',
  tertiary: '#7c3aed',
  quaternary: '#f59e0b',
  success: '#10b981',
  danger: '#ef4444',
  muted: '#6b7280',
};

const GRADIENT_COLORS = [
  { start: '#1d43d8', end: '#4f7df9' },
  { start: '#adfc04', end: '#84cc16' },
  { start: '#7c3aed', end: '#a855f7' },
  { start: '#f59e0b', end: '#fbbf24' },
];

// Type alias for Recharts data input
type ChartDataInput = Record<string, string | number>;

interface ChartCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
  action?: React.ReactNode;
}

export function ChartCard({ title, description, children, className, loading, action }: ChartCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className={cn('overflow-hidden', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div>
            <CardTitle className="text-base font-semibold font-admin-heading">{title}</CardTitle>
            {description && <CardDescription className="text-xs mt-1">{description}</CardDescription>}
          </div>
          {action}
        </CardHeader>
        <CardContent className="pt-0">
          {loading ? (
            <div className="h-[300px] flex items-center justify-center">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-muted" />
                <div className="h-3 w-24 rounded bg-muted" />
              </div>
            </div>
          ) : (
            children
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg shadow-lg p-3 text-sm">
        <p className="font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-muted-foreground" style={{ color: entry.color }}>
            {entry.name}: <span className="font-semibold">{entry.value.toLocaleString()}</span>
          </p>
        ))}
      </div>
    );
  }
  return null;
}

interface AreaChartData {
  name: string;
  [key: string]: string | number;
}

interface AreaChartComponentProps {
  data: AreaChartData[];
  dataKeys: { key: string; name: string; color?: string }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  gradient?: boolean;
}

export function AreaChartComponent({ data, dataKeys, height = 300, showGrid = true, showLegend = false, gradient = true }: AreaChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          {dataKeys.map((dk, index) => (
            <linearGradient key={dk.key} id={`gradient-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={dk.color || GRADIENT_COLORS[index % GRADIENT_COLORS.length].start} stopOpacity={0.3} />
              <stop offset="95%" stopColor={dk.color || GRADIENT_COLORS[index % GRADIENT_COLORS.length].end} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />}
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
        <YAxis
          tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => value.toLocaleString()}
        />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        {dataKeys.map((dk, index) => (
          <Area
            key={dk.key}
            type="monotone"
            dataKey={dk.key}
            name={dk.name}
            stroke={dk.color || GRADIENT_COLORS[index % GRADIENT_COLORS.length].start}
            strokeWidth={2}
            fill={gradient ? `url(#gradient-${dk.key})` : dk.color || GRADIENT_COLORS[index % GRADIENT_COLORS.length].start}
            fillOpacity={gradient ? 1 : 0.1}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface BarChartComponentProps {
  data: AreaChartData[];
  dataKeys: { key: string; name: string; color?: string }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  layout?: 'vertical' | 'horizontal';
  stacked?: boolean;
}

export function BarChartComponent({
  data,
  dataKeys,
  height = 300,
  showGrid = true,
  showLegend = false,
  layout = 'horizontal',
  stacked = false,
}: BarChartComponentProps) {
  const isVertical = layout === 'vertical';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout={layout} margin={{ top: 10, right: 10, left: isVertical ? 60 : -20, bottom: 0 }}>
        <defs>
          {dataKeys.map((dk, index) => (
            <linearGradient key={dk.key} id={`bar-gradient-${dk.key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={dk.color || GRADIENT_COLORS[index % GRADIENT_COLORS.length].start} stopOpacity={1} />
              <stop offset="100%" stopColor={dk.color || GRADIENT_COLORS[index % GRADIENT_COLORS.length].end} stopOpacity={0.8} />
            </linearGradient>
          ))}
        </defs>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />}
        {isVertical ? (
          <>
            <XAxis type="number" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              width={50}
            />
          </>
        ) : (
          <>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
          </>
        )}
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        {dataKeys.map((dk, index) => (
          <Bar
            key={dk.key}
            dataKey={dk.key}
            name={dk.name}
            fill={`url(#bar-gradient-${dk.key})`}
            radius={[4, 4, 0, 0]}
            stackId={stacked ? 'stack' : undefined}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

interface LineChartComponentProps {
  data: AreaChartData[];
  dataKeys: { key: string; name: string; color?: string }[];
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showDots?: boolean;
}

export function LineChartComponent({ data, dataKeys, height = 300, showGrid = true, showLegend = false, showDots = true }: LineChartComponentProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.5} />}
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
        <YAxis tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} tickLine={false} axisLine={false} />
        <Tooltip content={<CustomTooltip />} />
        {showLegend && <Legend />}
        {dataKeys.map((dk, index) => (
          <Line
            key={dk.key}
            type="monotone"
            dataKey={dk.key}
            name={dk.name}
            stroke={dk.color || GRADIENT_COLORS[index % GRADIENT_COLORS.length].start}
            strokeWidth={2}
            dot={showDots ? { fill: dk.color || GRADIENT_COLORS[index % GRADIENT_COLORS.length].start, strokeWidth: 0, r: 4 } : false}
            activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

interface PieChartData {
  name: string;
  value: number;
  color?: string;
}

interface PieChartComponentProps {
  data: PieChartData[];
  height?: number;
  innerRadius?: number;
  showLegend?: boolean;
  showLabels?: boolean;
}

export function PieChartComponent({ data, height = 300, innerRadius = 60, showLegend = true, showLabels = false }: PieChartComponentProps) {
  const COLORS = [CHART_COLORS.primary, CHART_COLORS.neon, CHART_COLORS.secondary, CHART_COLORS.tertiary, CHART_COLORS.quaternary];

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data as unknown as ChartDataInput[]}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 40}
          paddingAngle={2}
          dataKey="value"
          label={
            showLabels ? ({ name, percent }: { name?: string; percent?: number }) => `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%` : undefined
          }
          labelLine={showLabels}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [value.toLocaleString(), '']}
          contentStyle={{
            backgroundColor: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            borderRadius: '8px',
          }}
        />
        {showLegend && (
          <Legend
            layout="horizontal"
            verticalAlign="bottom"
            align="center"
            formatter={(value) => <span className="text-xs text-muted-foreground">{value}</span>}
          />
        )}
      </PieChart>
    </ResponsiveContainer>
  );
}

// Mini sparkline for inline use
interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  width?: number;
}

export function Sparkline({ data, color = CHART_COLORS.primary, height = 32, width = 100 }: SparklineProps) {
  const chartData = data.map((value, index) => ({ value, index }));

  return (
    <ResponsiveContainer width={width} height={height}>
      <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="sparkline-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={1.5} fill="url(#sparkline-gradient)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export { CHART_COLORS };
