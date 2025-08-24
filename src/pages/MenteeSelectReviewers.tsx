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
import { apiService, PerformanceCycle, User, ReviewerSelection } from "@/services/api";

interface Reviewer {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
}

interface ReviewerSubmission {
  id: number;
  reviewers: Reviewer[];
  status: "pending" | "approved" | "sent_back";
  submittedAt: string;
  mentorFeedback?: string;
}

const MenteeSelectReviewers: React.FC = () => {
  const { user } = useAuth();
  const [activeCycle, setActiveCycle] = useState<PerformanceCycle | null>(null);
  const [availableReviewers, setAvailableReviewers] = useState<Reviewer[]>([]);
  const [selectedReviewers, setSelectedReviewers] = useState<number[]>([]);
  const [submission, setSubmission] = useState<ReviewerSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Load data from API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load active performance cycle
        const cycleResponse = await apiService.getActivePerformanceCycle();
        if (cycleResponse.data) {
          setActiveCycle(cycleResponse.data);
        } else if (cycleResponse.error) {
          console.error('Error loading active cycle:', cycleResponse.error);
        }

        // Load available reviewers
        const reviewersResponse = await apiService.getAvailableReviewers(true);
        if (reviewersResponse.data) {
          setAvailableReviewers(reviewersResponse.data);
        } else if (reviewersResponse.error) {
          console.error('Error loading reviewers:', reviewersResponse.error);
        }

        // Check for existing submission
        const existingSubmissionResponse = await apiService.getMyReviewerSelection();
        if (existingSubmissionResponse.data) {
          const existingSubmission = existingSubmissionResponse.data;
          // Convert API response to local format
          const submissionData: ReviewerSubmission = {
            id: existingSubmission.id,
            reviewers: [], // This would need to be populated from reviewer_selection_details
            status: existingSubmission.status as "pending" | "approved" | "sent_back",
            submittedAt: existingSubmission.submitted_at,
            mentorFeedback: existingSubmission.mentor_feedback,
          };
          setSubmission(submissionData);
          
          if (existingSubmission.status === "sent_back") {
            // Note: In a real implementation, you'd need to fetch the selected reviewers
            // from the reviewer_selection_details table
            setIsEditing(true);
          }
        } else if (existingSubmissionResponse.error && existingSubmissionResponse.error !== 'No reviewer selection found') {
          console.error('Error loading existing submission:', existingSubmissionResponse.error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    if (user) {
      loadData();
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

    if (!activeCycle) {
      alert("No active performance cycle found");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await apiService.submitReviewerSelection({
        performance_cycle_id: activeCycle.id,
        selected_reviewers: selectedReviewers,
        comments: undefined,
      });

      if (response.data) {
        const selectedReviewerObjects = availableReviewers.filter(r => selectedReviewers.includes(r.id));
        const newSubmission: ReviewerSubmission = {
          id: response.data.id,
          reviewers: selectedReviewerObjects,
          status: "pending",
          submittedAt: response.data.submitted_at,
        };

        setSubmission(newSubmission);
        alert("Reviewer selection submitted successfully!");
      } else if (response.error) {
        alert(`Error submitting selection: ${response.error}`);
      }
    } catch (error) {
      alert("Error submitting selection. Please try again.");
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleResubmit = async () => {
    if (selectedReviewers.length === 0) {
      alert("Please select at least one reviewer");
      return;
    }

    if (!activeCycle) {
      alert("No active performance cycle found");
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await apiService.submitReviewerSelection({
        performance_cycle_id: activeCycle.id,
        selected_reviewers: selectedReviewers,
        comments: undefined,
      });

      if (response.data) {
        const selectedReviewerObjects = availableReviewers.filter(r => selectedReviewers.includes(r.id));
        const updatedSubmission: ReviewerSubmission = {
          ...submission!,
          reviewers: selectedReviewerObjects,
          status: "pending",
          submittedAt: response.data.submitted_at,
          mentorFeedback: undefined,
        };

        setSubmission(updatedSubmission);
        alert("Reviewer selection resubmitted successfully!");
      } else if (response.error) {
        alert(`Error resubmitting selection: ${response.error}`);
      }
    } catch (error) {
      alert("Error resubmitting selection. Please try again.");
      console.error('Error:', error);
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
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
            {new Date(activeCycle.start_date).toLocaleDateString()} - {new Date(activeCycle.end_date).toLocaleDateString()}
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
              <p className="text-lg font-semibold">{new Date(activeCycle.start_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">End Date</p>
              <p className="text-lg font-semibold">{new Date(activeCycle.end_date).toLocaleDateString()}</p>
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
