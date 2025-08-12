import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/layout/Header";

const employees = [
  "Arjun Mehta",
  "Priya Singh",
  "Ravi Kumar",
  "Neha Kapoor",
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect System Administrators to Admin Dashboard
  useEffect(() => {
    if (user?.role === "System Administrator") {
      navigate("/admin", { replace: true });
    }
  }, [user?.role, navigate]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kph_reviewers") || "[]");
    } catch {
      return [];
    }
  });
  const [reflection, setReflection] = useState<string>(localStorage.getItem("kph_reflection") || "");

  const actions = useMemo(() => {
    switch (user?.role) {
      case "Employee":
        return [
          {
            title: "Select Reviewers",
            desc: "Choose colleagues who will provide feedback on your performance.",
            content: (
              <div className="space-y-3">
                {employees.map((e) => (
                  <label key={e} className="flex items-center gap-3">
                    <Checkbox
                      checked={selectedReviewers.includes(e)}
                      onCheckedChange={(c) => {
                        const checked = Boolean(c);
                        setSelectedReviewers((prev) =>
                          checked ? [...new Set([...prev, e])] : prev.filter((x) => x !== e)
                        );
                      }}
                    />
                    <span>{e}</span>
                  </label>
                ))}
                <Button
                  onClick={() => {
                    localStorage.setItem("kph_reviewers", JSON.stringify(selectedReviewers));
                    toast({ title: "Reviewers saved", description: "Your reviewer list has been saved." });
                  }}
                >
                  Save Reviewers
                </Button>
              </div>
            ),
          },
          {
            title: "Post-Appraisal Reflection",
            desc: "Capture your reflections after the appraisal discussion with your mentor.",
            content: (
              <div className="space-y-3">
                <Label htmlFor="reflection">Your reflection</Label>
                <Textarea
                  id="reflection"
                  placeholder="Key learnings, next steps, areas to improve..."
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="min-h-[120px]"
                />
                <Button
                  onClick={() => {
                    localStorage.setItem("kph_reflection", reflection);
                    toast({ title: "Reflection saved" });
                  }}
                >
                  Save Reflection
                </Button>
              </div>
            ),
          },
          {
            title: "Submit Feedback (Reviewer)",
            desc: "If you were selected as a reviewer, submit your feedback here.",
            action: () => navigate("/feedback"),
          },
        ];
      case "Mentor":
        return [
          {
            title: "Approve Reviewer Lists",
            desc: "Review and approve or send back employees' reviewer lists.",
            content: (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Pending reviewer lists (mock): 3</p>
                <div className="flex gap-2">
                  <Button onClick={() => toast({ title: "Approved", description: "Lists approved." })}>Approve</Button>
                  <Button variant="secondary" onClick={() => toast({ title: "Sent back", description: "Requested changes." })}>Send Back</Button>
                </div>
              </div>
            ),
          },
          {
            title: "View Employee Feedback",
            desc: "Browse feedback received for each employee.",
            action: () => navigate("/feedback"),
          },
          {
            title: "Appraisal Discussions",
            desc: "Track and communicate outcomes of appraisal discussions.",
            content: <p className="text-sm text-muted-foreground">Use internal notes and meeting records (mock).</p>,
          },
        ];
      case "People Committee":
        return [
          {
            title: "Review & Finalize Ratings",
            desc: "View consolidated feedback and finalize performance ratings.",
            content: (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">3 employees awaiting finalization (mock)</p>
                <Button onClick={() => toast({ title: "Ratings finalized" })}>Finalize</Button>
              </div>
            ),
          },
        ];
      case "HR Lead":
        return [
          {
            title: "Monitor Review Progress",
            desc: "Track completion status across the organization.",
            content: <p className="text-sm text-muted-foreground">Completion: 67% (mock)</p>,
          },
        ];
      case "System Administrator":
        return [
          {
            title: "User & Role Management",
            desc: "Manage access, roles, and system settings.",
            content: <p className="text-sm text-muted-foreground">Admin console placeholder.</p>,
            action: () => navigate("/admin"),
          },
        ];
      default:
        return [];
    }
  }, [user?.role, navigate, reflection, selectedReviewers]);

  const canonical = typeof window !== "undefined" ? window.location.origin + "/dashboard" : "/dashboard";

  return (
    <>
      <Helmet>
        <title>KPH Dashboard | Kedaara Performance Hub</title>
        <meta name="description" content="Role-based dashboard for Kedaara Performance Hub (KPH)." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <AppHeader />

      <main className="container py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Welcome{user ? `, ${user.role}` : ""}</h1>
          <p className="text-muted-foreground">Review Process Workflow actions</p>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actions.map((a, idx) => (
            <Card key={idx} className="flex flex-col">
              <CardHeader>
                <CardTitle>{a.title}</CardTitle>
                <CardDescription>{a.desc}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                {a.content}
                {a.action && (
                  <Button onClick={a.action}>Open</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </section>
      </main>
    </>
  );
}
