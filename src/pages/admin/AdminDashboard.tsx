import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Mock data for cycles (replace with Supabase later)
const DATA = {
  "2025-Semi-Annual": {
    employees: 120,
    inCycle: 118,
    avgRating: 3.2,
    pendingApprovals: 9,
    overdueFeedbacks: 7,
    completionTrend: [10, 24, 48, 66, 82, 95], // weekly cumulative %
    workflow: [
      { step: "Select Reviewers", count: 118 },
      { step: "Mentor Approval", count: 109 },
      { step: "Reviewer Feedback", count: 96 },
      { step: "Finalize Ratings", count: 72 },
      { step: "Discussions", count: 64 },
      { step: "Reflections", count: 58 },
    ],
    ratings: [
      { name: "Tracking -", value: 15 },
      { name: "As expected", value: 78 },
      { name: "Tracking +", value: 25 },
    ],
  },
  "2025-Annual": {
    employees: 120,
    inCycle: 0,
    avgRating: 0,
    pendingApprovals: 0,
    overdueFeedbacks: 0,
    completionTrend: [0, 0, 0, 0, 0, 0],
    workflow: [
      { step: "Select Reviewers", count: 0 },
      { step: "Mentor Approval", count: 0 },
      { step: "Reviewer Feedback", count: 0 },
      { step: "Finalize Ratings", count: 0 },
      { step: "Discussions", count: 0 },
      { step: "Reflections", count: 0 },
    ],
    ratings: [
      { name: "Tracking -", value: 0 },
      { name: "As expected", value: 0 },
      { name: "Tracking +", value: 0 },
    ],
  },
} as const;

export default function AdminDashboard() {
  const canonical = typeof window !== "undefined" ? window.location.origin + "/admin" : "/admin";
  const [year, setYear] = useState("2025");
  const [type, setType] = useState<"Semi-Annual" | "Annual">("Semi-Annual");

  const key = `${year}-${type}` as keyof typeof DATA;
  const current = DATA[key];

  const kpis = useMemo(
    () => [
      { label: "Completion", value: `${current.completionTrend.at(-1)}%`, sub: "Feedback submitted" },
      { label: "Pending Approvals", value: current.pendingApprovals, sub: "Mentor stage" },
      { label: "Overdue Feedbacks", value: current.overdueFeedbacks, sub: "Past due date" },
      { label: "Average Rating", value: current.avgRating.toFixed(1), sub: "Overall" },
    ],
    [current]
  );

  const pieColors = ["hsl(var(--destructive))", "hsl(var(--secondary))", "hsl(var(--primary))"];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | KPH</title>
        <meta name="description" content="System Administrator dashboard to monitor KPH activities." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="mb-6 animate-fade-in">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div>
            <h1 className="text-2xl font-bold">KPH Admin Dashboard</h1>
            <p className="text-muted-foreground">Monitor Review Process and masters</p>
          </div>
          <div className="flex gap-2">
            <Select value={year} onValueChange={setYear}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
              </SelectContent>
            </Select>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Cycle" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                <SelectItem value="Annual">Annual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map((k) => (
          <Card key={k.label} className="shadow-sm hover-scale animate-fade-in">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{k.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{k.value as any}</div>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator className="my-6" />

      <section className="grid gap-6 xl:grid-cols-3 animate-fade-in">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Workflow by Stage ({type})</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[...current.workflow] as any[]}>
                <XAxis dataKey="step" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ratings Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={[...current.ratings] as any[]} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60} paddingAngle={4}>
                  {current.ratings.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 mt-6 animate-fade-in">
        <Card>
          <CardHeader>
            <CardTitle>Feedback Completion Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={current.completionTrend.map((v, i) => ({ week: `W${i + 1}`, value: v }))}>
                <XAxis dataKey="week" />
                <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="value" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cycle Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Employees in cycle</p>
              <p className="text-2xl font-semibold">{current.inCycle}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total employees</p>
              <p className="text-2xl font-semibold">{current.employees}</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
