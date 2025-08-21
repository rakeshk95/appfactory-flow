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
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileText, 
  MessageSquare, 
  Star,
  Eye,
  Send,
  RefreshCw,
  Settings
} from "lucide-react";

const employees = [
  "Arjun Mehta",
  "Priya Singh", 
  "Ravi Kumar",
  "Neha Kapoor",
];

// Review Process Status Types
type ReviewStatus = "pending" | "approved" | "rejected" | "in_progress" | "completed";

interface ReviewRequest {
  id: string;
  employee: string;
  reviewers: string[];
  status: ReviewStatus;
  submittedAt: number;
  approvedBy?: string;
  approvedAt?: number;
  feedback?: any[];
}

interface FeedbackData {
  id: string;
  employee: string;
  reviewer: string;
  strengths: string;
  improvements: string;
  rating: "Tracking below expectations" | "Tracking as expected" | "Tracking above expectations";
  submittedAt: number;
}

// Initialize dummy data
const initializeDummyData = () => {
  // Check if dummy data already exists
  if (localStorage.getItem("kph_dummy_initialized")) {
    return;
  }

  // Dummy review requests
  const dummyReviewRequests: ReviewRequest[] = [
    {
      id: "req_001",
      employee: "Arjun Mehta",
      reviewers: ["Priya Singh", "Ravi Kumar"],
      status: "approved",
      submittedAt: Date.now() - 86400000 * 7, // 7 days ago
      approvedBy: "mentor@kedaara.com",
      approvedAt: Date.now() - 86400000 * 6, // 6 days ago
    },
    {
      id: "req_002",
      employee: "Priya Singh",
      reviewers: ["Arjun Mehta", "Neha Kapoor"],
      status: "approved",
      submittedAt: Date.now() - 86400000 * 5, // 5 days ago
      approvedBy: "mentor@kedaara.com",
      approvedAt: Date.now() - 86400000 * 4, // 4 days ago
    },
    {
      id: "req_003",
      employee: "Ravi Kumar",
      reviewers: ["Arjun Mehta", "Priya Singh"],
      status: "pending",
      submittedAt: Date.now() - 86400000 * 2, // 2 days ago
    },
    {
      id: "req_004",
      employee: "Neha Kapoor",
      reviewers: ["Priya Singh", "Ravi Kumar"],
      status: "approved",
      submittedAt: Date.now() - 86400000 * 3, // 3 days ago
      approvedBy: "mentor@kedaara.com",
      approvedAt: Date.now() - 86400000 * 2, // 2 days ago
    },
  ];

  // Dummy feedback data
  const dummyFeedback: FeedbackData[] = [
    {
      id: "fb_001",
      employee: "Arjun Mehta",
      reviewer: "Priya Singh",
      strengths: "Excellent problem-solving skills and strong technical knowledge. Shows great initiative in taking on complex projects and mentoring junior team members.",
      improvements: "Could improve time management and delegation skills. Should focus more on strategic thinking and long-term planning.",
      rating: "Tracking above expectations",
      submittedAt: Date.now() - 86400000 * 3, // 3 days ago
    },
    {
      id: "fb_002",
      employee: "Arjun Mehta",
      reviewer: "Ravi Kumar",
      strengths: "Very reliable and consistent in delivering high-quality work. Great team player and excellent communication skills.",
      improvements: "Needs to work on being more proactive in identifying potential issues early. Could benefit from more cross-functional collaboration.",
      rating: "Tracking as expected",
      submittedAt: Date.now() - 86400000 * 2, // 2 days ago
    },
    {
      id: "fb_003",
      employee: "Priya Singh",
      reviewer: "Arjun Mehta",
      strengths: "Outstanding leadership qualities and excellent project management skills. Very detail-oriented and ensures high standards.",
      improvements: "Could be more patient with team members who are still learning. Should work on providing more constructive feedback.",
      rating: "Tracking above expectations",
      submittedAt: Date.now() - 86400000 * 2, // 2 days ago
    },
    {
      id: "fb_004",
      employee: "Priya Singh",
      reviewer: "Neha Kapoor",
      strengths: "Great analytical skills and very thorough in her work. Excellent at identifying potential risks and proposing solutions.",
      improvements: "Sometimes takes too long to make decisions. Could be more decisive in time-sensitive situations.",
      rating: "Tracking as expected",
      submittedAt: Date.now() - 86400000 * 1, // 1 day ago
    },
    {
      id: "fb_005",
      employee: "Neha Kapoor",
      reviewer: "Priya Singh",
      strengths: "Very creative and innovative in her approach to problem-solving. Excellent at thinking outside the box.",
      improvements: "Needs to improve documentation and follow-up on projects. Should be more systematic in her approach.",
      rating: "Tracking as expected",
      submittedAt: Date.now() - 86400000 * 1, // 1 day ago
    },
    {
      id: "fb_006",
      employee: "Neha Kapoor",
      reviewer: "Ravi Kumar",
      strengths: "Great interpersonal skills and very good at building relationships with stakeholders. Excellent presentation skills.",
      improvements: "Could improve technical depth in certain areas. Should focus more on continuous learning and skill development.",
      rating: "Tracking below expectations",
      submittedAt: Date.now() - 86400000 * 1, // 1 day ago
    },
  ];

  // Dummy reflections
  const dummyReflections = {
    "Arjun Mehta": "The review process was very insightful. I learned that I need to work on my time management skills and be more strategic in my approach. My mentor provided excellent guidance on how to improve my delegation skills.",
    "Priya Singh": "The feedback was very constructive and helped me understand my strengths better. I need to work on being more patient and providing better feedback to my team members.",
    "Ravi Kumar": "Still in the process of selecting reviewers and waiting for approval.",
    "Neha Kapoor": "The review highlighted areas where I can improve my technical skills and documentation. I'm committed to working on these areas in the coming months.",
  };

  // Save dummy data
  localStorage.setItem("kph_review_requests", JSON.stringify(dummyReviewRequests));
  localStorage.setItem("kph_feedback", JSON.stringify(dummyFeedback));
  localStorage.setItem("kph_reflections", JSON.stringify(dummyReflections));
  localStorage.setItem("kph_dummy_initialized", "true");
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Initialize dummy data on component mount
  useEffect(() => {
    initializeDummyData();
  }, []);

  // Redirect System Administrators to Admin Dashboard
  useEffect(() => {
    if (user?.role === "System Administrator") {
      navigate("/admin", { replace: true });
    }
  }, [user?.role, navigate]);

  // State management for review process
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kph_reviewers") || "[]");
    } catch {
      return [];
    }
  });

  const [reflection, setReflection] = useState<string>(() => {
    try {
      const reflections = JSON.parse(localStorage.getItem("kph_reflections") || "{}");
      return reflections[user?.email || ""] || "";
    } catch {
      return "";
    }
  });

  // Get review requests and feedback data
  const reviewRequests = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("kph_review_requests") || "[]") as ReviewRequest[];
    } catch {
      return [];
    }
  }, []);

  const feedbackData = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("kph_feedback") || "[]") as FeedbackData[];
    } catch {
      return [];
    }
  }, []);

  // Helper functions
  const saveReviewRequest = (request: ReviewRequest) => {
    const requests = JSON.parse(localStorage.getItem("kph_review_requests") || "[]");
    requests.push(request);
    localStorage.setItem("kph_review_requests", JSON.stringify(requests));
  };

  const updateReviewRequest = (id: string, updates: Partial<ReviewRequest>) => {
    const requests = JSON.parse(localStorage.getItem("kph_review_requests") || "[]");
    const updated = requests.map((r: ReviewRequest) => 
      r.id === id ? { ...r, ...updates } : r
    );
    localStorage.setItem("kph_review_requests", JSON.stringify(updated));
  };

  const saveReflection = (reflectionText: string) => {
    const reflections = JSON.parse(localStorage.getItem("kph_reflections") || "{}");
    reflections[user?.email || ""] = reflectionText;
    localStorage.setItem("kph_reflections", JSON.stringify(reflections));
  };

  const getStatusBadge = (status: ReviewStatus) => {
    const variants = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
      in_progress: "default",
      completed: "default"
    } as const;

    const icons = {
      pending: Clock,
      approved: CheckCircle,
      rejected: AlertCircle,
      in_progress: RefreshCw,
      completed: CheckCircle
    };

    const Icon = icons[status];
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      approved: "bg-green-100 text-green-800",
      rejected: "bg-red-100 text-red-800",
      in_progress: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800"
    };

    return (
      <Badge variant={variants[status]} className={colors[status]}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const actions = useMemo(() => {
    switch (user?.role) {
      case "Employee":
        return [
          {
            title: "Select Reviewers",
            desc: "Choose colleagues who will provide feedback on your performance.",
            icon: Users,
            content: (
              <div className="space-y-4">
                <div className="text-sm text-muted-foreground mb-3">
                  Select up to 3 reviewers for your performance review
                </div>
                {employees.filter(e => e !== user?.email).map((e) => (
                  <label key={e} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <Checkbox
                      checked={selectedReviewers.includes(e)}
                      onCheckedChange={(c) => {
                        const checked = Boolean(c);
                        if (checked && selectedReviewers.length >= 3) {
                          toast({ 
                            title: "Maximum reviewers reached", 
                            description: "You can select up to 3 reviewers",
                            variant: "destructive"
                          });
                          return;
                        }
                        setSelectedReviewers((prev) =>
                          checked ? [...new Set([...prev, e])] : prev.filter((x) => x !== e)
                        );
                      }}
                    />
                    <span className="flex-1">{e}</span>
                  </label>
                ))}
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (selectedReviewers.length === 0) {
                        toast({ 
                          title: "No reviewers selected", 
                          description: "Please select at least one reviewer",
                          variant: "destructive"
                        });
                        return;
                      }
                      
                      const request: ReviewRequest = {
                        id: Date.now().toString(),
                        employee: user?.email || "",
                        reviewers: selectedReviewers,
                        status: "pending",
                        submittedAt: Date.now()
                      };
                      
                      saveReviewRequest(request);
                      localStorage.setItem("kph_reviewers", JSON.stringify(selectedReviewers));
                      toast({ 
                        title: "Review request submitted", 
                        description: "Waiting for mentor approval" 
                      });
                    }}
                    disabled={selectedReviewers.length === 0}
                  >
                    Submit for Approval
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      localStorage.setItem("kph_reviewers", JSON.stringify(selectedReviewers));
                      toast({ title: "Reviewers saved", description: "Your reviewer list has been saved." });
                    }}
                  >
                    Save Draft
                  </Button>
                </div>
              </div>
            ),
          },
          {
            title: "Review Status",
            desc: "Track the status of your review request and feedback.",
            icon: Eye,
            content: (
              <div className="space-y-3">
                {reviewRequests
                  .filter(r => r.employee === user?.email)
                  .map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Review Request</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Reviewers: {request.reviewers.join(", ")}
                      </div>
                      {request.status === "approved" && (
                        <div className="mt-2 text-sm text-green-600">
                          ✓ Approved by mentor on {new Date(request.approvedAt!).toLocaleDateString()}
                        </div>
                      )}
                      {request.status === "approved" && (
                        <div className="mt-2 text-sm text-blue-600">
                          📊 {feedbackData.filter(f => f.employee === user?.email).length} feedback received
                        </div>
                      )}
                    </div>
                  ))}
                {reviewRequests.filter(r => r.employee === user?.email).length === 0 && (
                  <p className="text-sm text-muted-foreground">No review requests submitted yet.</p>
                )}
              </div>
            ),
          },
          {
            title: "Post-Appraisal Reflection",
            desc: "Capture your reflections after the appraisal discussion with your mentor.",
            icon: MessageSquare,
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
                    saveReflection(reflection);
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
            icon: FileText,
            action: () => navigate("/feedback"),
          },
        ];

      case "Mentor":
        const pendingRequests = reviewRequests.filter(r => r.status === "pending");
        return [
          {
            title: "Approve Reviewer Lists",
            desc: `Review and approve or send back employees' reviewer lists. (${pendingRequests.length} pending)`,
            icon: CheckCircle,
            content: (
              <div className="space-y-4">
                {pendingRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No pending review requests.</p>
                ) : (
                  pendingRequests.map((request) => (
                    <div key={request.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{request.employee}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-3">
                        Reviewers: {request.reviewers.join(", ")}
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => {
                            updateReviewRequest(request.id, {
                              status: "approved",
                              approvedBy: user?.email,
                              approvedAt: Date.now()
                            });
                            toast({ title: "Approved", description: "Review request approved." });
                          }}
                        >
                          Approve
                        </Button>
                        <Button 
                          size="sm"
                          variant="secondary" 
                          onClick={() => {
                            updateReviewRequest(request.id, { status: "rejected" });
                            toast({ title: "Sent back", description: "Requested changes." });
                          }}
                        >
                          Send Back
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ),
          },
          {
            title: "View Employee Feedback",
            desc: "Browse feedback received for each employee.",
            icon: Eye,
            action: () => navigate("/feedback"),
          },
          {
            title: "Appraisal Discussions",
            desc: "Track and communicate outcomes of appraisal discussions.",
            icon: MessageSquare,
            content: (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {feedbackData.length} feedback submissions received
                </p>
                <div className="space-y-2">
                  {employees.map((employee) => {
                    const employeeFeedback = feedbackData.filter(f => f.employee === employee);
                    return (
                      <div key={employee} className="p-2 bg-gray-50 rounded">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{employee}</span>
                          <Badge variant="secondary">{employeeFeedback.length} feedback</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button onClick={() => navigate("/feedback")}>
                  View All Feedback
                </Button>
              </div>
            ),
          },
        ];

      case "HR Lead":
      case "People Committee":
        const completedReviews = reviewRequests.filter(r => r.status === "approved");
        return [
          {
            title: "Initiate Performance Cycle",
            desc: "Create and manage performance review cycles with milestone dates.",
            icon: Settings,
            action: () => navigate("/dashboard/initiate-cycle"),
          },
          {
            title: "Review Performance Data",
            desc: "Search and analyze past performance review data with export functionality.",
            icon: FileText,
            action: () => navigate("/dashboard/review-data"),
          },
          {
            title: "Review & Finalize Ratings",
            desc: `View consolidated feedback and finalize performance ratings. (${completedReviews.length} ready for review)`,
            icon: Star,
            content: (
              <div className="space-y-4">
                {completedReviews.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No reviews ready for finalization.</p>
                ) : (
                  completedReviews.map((request) => {
                    const employeeFeedback = feedbackData.filter(f => f.employee === request.employee);
                    const avgRating = employeeFeedback.length > 0 
                      ? employeeFeedback.reduce((acc, f) => {
                          const ratingValue = f.rating === "Tracking above expectations" ? 3 : 
                                            f.rating === "Tracking as expected" ? 2 : 1;
                          return acc + ratingValue;
                        }, 0) / employeeFeedback.length
                      : 0;
                    
                    return (
                      <div key={request.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{request.employee}</span>
                          <Badge variant="secondary">{employeeFeedback.length} feedback</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mb-3">
                          {employeeFeedback.length > 0 ? 
                            `Average rating: ${avgRating.toFixed(1)}/3` :
                            "No feedback submitted yet"
                          }
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => {
                            updateReviewRequest(request.id, { status: "completed" });
                            toast({ title: "Review finalized", description: "Performance review completed." });
                          }}
                          disabled={employeeFeedback.length === 0}
                        >
                          Finalize Review
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            ),
          },
          {
            title: "View All Feedback",
            desc: "Access comprehensive feedback data across the organization.",
            icon: FileText,
            action: () => navigate("/feedback"),
          },
        ];

      default:
        return [];
    }
  }, [user?.role, navigate, reflection, selectedReviewers, reviewRequests, feedbackData]);

  const canonical = typeof window !== "undefined" ? window.location.origin + "/dashboard" : "/dashboard";

  return (
    <>
      <Helmet>
        <title>KPH Dashboard | Kedaara Performance Hub</title>
        <meta name="description" content="Role-based dashboard for Kedaara Performance Hub (KPH)." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <main 
        className="space-y-6"
        style={{
          width: '100%',
          maxWidth: 'none',
          minWidth: '100%',
          margin: '0',
          padding: '0'
        }}
      >
        <header 
          style={{
            width: '100%',
            maxWidth: 'none',
            minWidth: '100%',
            margin: '0',
            padding: '0'
          }}
        >
          <h1 className="text-3xl font-bold">Welcome{user ? `, ${user.role}` : ""}</h1>
          <p className="text-muted-foreground">Review Process Workflow Dashboard</p>
        </header>

        <section 
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          style={{
            width: '100%',
            maxWidth: 'none',
            minWidth: '100%',
            margin: '0',
            padding: '0'
          }}
        >
          {actions.map((a, idx) => {
            const Icon = a.icon;
            return (
              <Card 
                key={idx} 
                className="flex flex-col"
                style={{
                  width: '100%',
                  maxWidth: 'none',
                  minWidth: '100%',
                  margin: '0',
                  padding: '0'
                }}
              >
                <CardHeader>
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-5 h-5 text-teal-600" />}
                    <CardTitle>{a.title}</CardTitle>
                  </div>
                  <CardDescription>{a.desc}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-4">
                  {a.content}
                  {a.action && (
                    <Button onClick={a.action} className="w-full">
                      Open
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </section>
      </main>
    </>
  );
}
