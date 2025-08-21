import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/layout/Header";
import { FileText, Eye, Star } from "lucide-react";

const employees = ["Arjun Mehta", "Priya Singh", "Ravi Kumar", "Neha Kapoor"];

type FeedbackFormValues = {
  employee: string;
  strengths: string;
  improvements: string;
  rating: "Tracking below expectations" | "Tracking as expected" | "Tracking above expectations";
};

interface ReviewRequest {
  id: string;
  employee: string;
  reviewers: string[];
  status: "pending" | "approved" | "rejected" | "in_progress" | "completed";
  submittedAt: number;
  approvedBy?: string;
  approvedAt?: number;
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

export default function FeedbackForm() {
  const { user } = useAuth();
  const { register, handleSubmit, setValue, watch, reset } = useForm<FeedbackFormValues>({
    defaultValues: {
      employee: "",
      strengths: "",
      improvements: "",
      rating: "Tracking as expected",
    },
  });

  // Get review requests and existing feedback
  const reviewRequests = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("kph_review_requests") || "[]") as ReviewRequest[];
    } catch {
      return [];
    }
  }, []);

  const existingFeedback = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("kph_feedback") || "[]") as FeedbackData[];
    } catch {
      return [];
    }
  }, []);

  // Get available employees for feedback based on user role
  const availableEmployees = useMemo(() => {
    if (!user) return [];

    switch (user.role) {
      case "Employee":
        // Employees can only submit feedback if they are selected as reviewers
        const approvedRequests = reviewRequests.filter(r => 
          r.status === "approved" && 
          r.reviewers.includes(user.email)
        );
        return approvedRequests.map(r => r.employee);

      case "Mentor":
        // Mentors can view feedback for all employees
        return employees;

      case "People Committee":
        // People Committee can view all feedback
        return employees;

      case "HR Lead":
        // HR Lead can view all feedback
        return employees;

      default:
        return [];
    }
  }, [user, reviewRequests]);

  const onSubmit = (v: FeedbackFormValues) => {
    if (!user) return;

    const feedback: FeedbackData = {
      id: Date.now().toString(),
      employee: v.employee,
      reviewer: user.email,
      strengths: v.strengths,
      improvements: v.improvements,
      rating: v.rating,
      submittedAt: Date.now()
    };

    const list = JSON.parse(localStorage.getItem("kph_feedback") || "[]");
    list.push(feedback);
    localStorage.setItem("kph_feedback", JSON.stringify(list));
    
    toast({ 
      title: "Feedback submitted", 
      description: `Feedback submitted for ${v.employee}` 
    });
    reset();
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "Tracking below expectations":
        return "bg-red-100 text-red-800";
      case "Tracking as expected":
        return "bg-yellow-100 text-yellow-800";
      case "Tracking above expectations":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canonical = typeof window !== "undefined" ? window.location.origin + "/feedback" : "/feedback";

  return (
    <>
      <Helmet>
        <title>Submit Feedback | KPH</title>
        <meta name="description" content="Submit structured performance feedback in Kedaara Performance Hub." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <AppHeader />

      <main className="container py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Feedback Management</h1>
          <p className="text-muted-foreground">
            {user?.role === "Employee" 
              ? "Submit feedback for employees you've been selected to review"
              : "Submit and view structured feedback using the KPH framework"
            }
          </p>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Submit Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Submit Feedback
              </CardTitle>
              <CardDescription>
                Complete the fields below and select an overall performance rating.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label>Employee</Label>
                  <Select 
                    value={watch("employee")} 
                    onValueChange={(v) => setValue("employee", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmployees.map((e) => (
                        <SelectItem key={e} value={e}>{e}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {availableEmployees.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      {user?.role === "Employee" 
                        ? "You haven't been selected as a reviewer for any approved review requests."
                        : "No employees available for feedback."
                      }
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strengths">What is this person doing well and key strengths?</Label>
                  <Textarea 
                    id="strengths" 
                    className="min-h-[120px]" 
                    placeholder="Strengths, achievements, behaviors..." 
                    {...register("strengths", { required: true })} 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="improvements">Where can he/she do better?</Label>
                  <Textarea 
                    id="improvements" 
                    className="min-h-[120px]" 
                    placeholder="Opportunities, suggestions..." 
                    {...register("improvements", { required: true })} 
                  />
                </div>

                <div className="space-y-3">
                  <Label>Provide Overall Rating</Label>
                  <RadioGroup value={watch("rating")} onValueChange={(v) => setValue("rating", v as any)}>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="Tracking below expectations" />
                      <span>Tracking below expectations (Tracking -)</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="Tracking as expected" />
                      <span>Tracking as expected</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                      <RadioGroupItem value="Tracking above expectations" />
                      <span>Tracking above expectations (Tracking +)</span>
                    </label>
                  </RadioGroup>
                </div>

                <Button 
                  type="submit" 
                  disabled={availableEmployees.length === 0 || !watch("employee")}
                  className="w-full"
                >
                  Submit Feedback
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* View Feedback */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                View Feedback
              </CardTitle>
              <CardDescription>
                View feedback submitted for employees.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {employees.map((employee) => {
                  const employeeFeedback = existingFeedback.filter(f => f.employee === employee);
                  return (
                    <div key={employee} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{employee}</h3>
                        <Badge variant="secondary">{employeeFeedback.length} feedback</Badge>
                      </div>
                      
                      {employeeFeedback.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No feedback submitted yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {employeeFeedback.map((feedback) => (
                            <div key={feedback.id} className="p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-600">
                                  By: {feedback.reviewer}
                                </span>
                                <Badge className={getRatingColor(feedback.rating)}>
                                  {feedback.rating}
                                </Badge>
                              </div>
                              
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium text-green-700">Strengths:</span>
                                  <p className="text-gray-700 mt-1">{feedback.strengths}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-orange-700">Improvements:</span>
                                  <p className="text-gray-700 mt-1">{feedback.improvements}</p>
                                </div>
                              </div>
                              
                              <div className="text-xs text-gray-500 mt-2">
                                Submitted: {new Date(feedback.submittedAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
