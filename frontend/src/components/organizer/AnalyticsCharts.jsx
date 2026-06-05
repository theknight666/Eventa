import React from "react";
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";

function fmtDay(d) {
  try {
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  } catch {
    return d;
  }
}

export default function AnalyticsCharts({ data = [] }) {
  const chart = data.map((d) => ({ ...d, label: fmtDay(d.date) }));

  return (
    <div className="grid lg:grid-cols-2 gap-6" data-testid="analytics-charts">
      {[
        { key: "views", title: "Views", color: "#3b82f6" },
        { key: "registrations", title: "Registrations", color: "#10b981" },
      ].map((m) => (
        <div key={m.key} className="rounded-3xl border border-border bg-card p-6">
          <p className="label-eyebrow text-muted-foreground mb-4">{m.title} · last 14 days</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chart} margin={{ left: -20, right: 6, top: 6 }}>
              <defs>
                <linearGradient id={`g-${m.key}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={m.color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={m.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} interval={2} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickLine={false} axisLine={false} width={40} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: 12,
                  fontSize: 12,
                }}
              />
              <Area type="monotone" dataKey={m.key} stroke={m.color} strokeWidth={2.5} fill={`url(#g-${m.key})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ))}
    </div>
  );
}
