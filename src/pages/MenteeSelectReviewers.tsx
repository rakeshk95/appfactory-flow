import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Calendar, Users, Send, Edit, CheckCircle, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Reviewer {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
}

interface PerformanceCycle {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: "active" | "inactive";
}

interface ReviewerSubmission {
  id: string;
  reviewers: Reviewer[];
  status: "pending" | "approved" | "sent_back";
  submittedAt: string;
  mentorFeedback?: string;
}

const MenteeSelectReviewers: React.FC = () => {
  const { user } = useAuth();
  const [activeCycle, setActiveCycle] = useState<PerformanceCycle | null>(null);
  const [availableReviewers, setAvailableReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<string[]>([]);
  const [submission, setSubmission] = useState<ReviewerSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Mock data - in real app, this would come from API
  useEffect(() => {
    // Simulate API call for active cycle
    setActiveCycle({
      id: "cycle-1",
      name: "Q4 2024 Performance Review",
      startDate: "2024-10-01",
      endDate: "2024-12-31",
      status: "active"
    });

    // Simulate API call for available reviewers
    setAvailableReviewers([
      { id: "1", name: "John Smith", email: "john.smith@company.com", department: "Engineering", position: "Senior Engineer" },
      { id: "2", name: "Sarah Johnson", email: "sarah.johnson@company.com", department: "Product", position: "Product Manager" },
      { id: "3", name: "Mike Davis", email: "mike.davis@company.com", department: "Design", position: "UX Designer" },
      { id: "4", name: "Lisa Wilson", email: "lisa.wilson@company.com", department: "Engineering", position: "Tech Lead" },
      { id: "5", name: "David Brown", email: "david.brown@company.com", department: "Marketing", position: "Marketing Manager" },
    ]);

    // Check for existing submission
    const existingSubmission = localStorage.getItem(`reviewer_submission_${user?.email}`);
    if (existingSubmission) {
      setSubmission(JSON.parse(existingSubmission));
      if (JSON.parse(existingSubmission).status === "sent_back") {
        setSelectedReviewers(JSON.parse(existingSubmission).reviewers.map((r: Reviewer) => r.id));
        setIsEditing(true);
      }
    }
  }, [user]);

  const handleReviewerToggle = (reviewerId: string) => {
    setSelectedReviewers(prev => 
      prev.includes(reviewerId) 
        ? prev.filter(id => id !== reviewerId)
        : [...prev, reviewerId]
    );
  };

  const handleSubmit = async () => {
    if (selectedReviewers.length === 0) {
      alert("Please select at least one reviewer");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const selectedReviewerObjects = availableReviewers.filter(r => selectedReviewers.includes(r.id));
    const newSubmission: ReviewerSubmission = {
      id: Date.now().toString(),
      reviewers: selectedReviewerObjects,
      status: "pending",
      submittedAt: new Date().toISOString(),
    };

    setSubmission(newSubmission);
    localStorage.setItem(`reviewer_submission_${user?.email}`, JSON.stringify(newSubmission));
    setIsSubmitting(false);
    setIsEditing(false);
  };

  const handleResubmit = async () => {
    if (selectedReviewers.length === 0) {
      alert("Please select at least one reviewer");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const selectedReviewerObjects = availableReviewers.filter(r => selectedReviewers.includes(r.id));
    const updatedSubmission: ReviewerSubmission = {
      ...submission!,
      reviewers: selectedReviewerObjects,
      status: "pending",
      submittedAt: new Date().toISOString(),
      mentorFeedback: undefined,
    };

    setSubmission(updatedSubmission);
    localStorage.setItem(`reviewer_submission_${user?.email}`, JSON.stringify(updatedSubmission));
    setIsSubmitting(false);
    setIsEditing(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case "sent_back":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Sent Back</Badge>;
      default:
        return null;
    }
  };

  if (!activeCycle) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Active Performance Cycle</h3>
          <p className="text-gray-500">There is currently no active performance review cycle.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Select Reviewers</h1>
          <p className="text-gray-600 mt-2">Choose reviewers for your performance feedback</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-gray-500" />
          <span className="text-sm text-gray-600">
            {new Date(activeCycle.startDate).toLocaleDateString()} - {new Date(activeCycle.endDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Active Cycle Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Active Performance Cycle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Cycle Name</p>
              <p className="text-lg font-semibold">{activeCycle.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Start Date</p>
              <p className="text-lg font-semibold">{new Date(activeCycle.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">End Date</p>
              <p className="text-lg font-semibold">{new Date(activeCycle.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submission Status */}
      {submission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Submission Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Status:</span>
                {getStatusBadge(submission.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Submitted:</span>
                <span className="text-sm">{new Date(submission.submittedAt).toLocaleString()}</span>
              </div>
              {submission.mentorFeedback && (
                <div>
                  <span className="text-sm font-medium">Mentor Feedback:</span>
                  <Alert className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{submission.mentorFeedback}</AlertDescription>
                  </Alert>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviewer Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Select Reviewers
          </CardTitle>
          <CardDescription>
            Choose the reviewers who will provide feedback on your performance. 
            You can select multiple reviewers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {availableReviewers.map((reviewer) => (
              <div key={reviewer.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-gray-50">
                <Checkbox
                  id={reviewer.id}
                  checked={selectedReviewers.includes(reviewer.id)}
                  onCheckedChange={() => handleReviewerToggle(reviewer.id)}
                  disabled={submission?.status === "approved"}
                />
                <div className="flex-1">
                  <label htmlFor={reviewer.id} className="text-sm font-medium cursor-pointer">
                    {reviewer.name}
                  </label>
                  <p className="text-sm text-gray-500">{reviewer.email}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">{reviewer.department}</Badge>
                    <Badge variant="outline" className="text-xs">{reviewer.position}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-6" />

          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Selected: {selectedReviewers.length} reviewer(s)
            </div>
            <div className="flex gap-2">
              {submission?.status === "sent_back" && (
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  {isEditing ? "Cancel Edit" : "Edit Selection"}
                </Button>
              )}
              {(!submission || submission.status === "sent_back") && (
                <Button
                  onClick={submission?.status === "sent_back" ? handleResubmit : handleSubmit}
                  disabled={isSubmitting || selectedReviewers.length === 0}
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? "Submitting..." : submission?.status === "sent_back" ? "Resubmit" : "Submit for Approval"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MenteeSelectReviewers;
