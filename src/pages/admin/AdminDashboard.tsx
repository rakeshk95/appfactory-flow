import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts";

export default function AdminDashboard() {
  const canonical = typeof window !== "undefined" ? window.location.origin + "/admin" : "/admin";

  // Mocked stats – in a real app, fetch from Supabase
  const workflow = [
    { step: "Select Reviewers", count: 42 },
    { step: "Mentor Approval", count: 38 },
    { step: "Reviewer Feedback", count: 35 },
    { step: "Finalize Ratings", count: 30 },
    { step: "Discussions", count: 28 },
    { step: "Reflections", count: 26 },
  ];

  const ratings = [
    { name: "Tracking -", value: 6 },
    { name: "As expected", value: 21 },
    { name: "Tracking +", value: 8 },
  ];
  const pieColors = ["hsl(var(--destructive))", "hsl(var(--secondary))", "hsl(var(--primary))"];

  return (
    <>
      <Helmet>
        <title>Admin Dashboard | KPH</title>
        <meta name="description" content="System Administrator dashboard to monitor KPH activities." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="mb-6">
        <h1 className="text-2xl font-bold">KPH Admin Dashboard</h1>
        <p className="text-muted-foreground">Monitor Review Process Workflow and system masters.</p>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[{ label: "Employees", value: 120 }, { label: "Reviewers", value: 340 }, { label: "Active Cycles", value: 2 }].map((kpi) => (
          <Card key={kpi.label} className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{kpi.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{kpi.value}</div>
            </CardContent>
          </Card>
        ))}
      </section>

      <Separator className="my-6" />

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workflow Progress</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={workflow}>
                <XAxis dataKey="step" tick={{ fontSize: 12 }} interval={0} angle={-12} textAnchor="end" height={60} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Overall Ratings Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip />
                <Pie data={ratings} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60} paddingAngle={4}>
                  {ratings.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>
    </>
  );
}
