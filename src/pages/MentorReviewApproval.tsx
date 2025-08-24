import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, CheckCircle, XCircle, Eye, Clock, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { apiService, PerformanceCycle } from "@/services/api";

interface Reviewer {
  id: number;
  name: string;
  email: string;
  department: string;
  position: string;
}

interface MenteeSubmission {
  id: number;
  menteeId: number;
  menteeName: string;
  menteeEmail: string;
  reviewers: Reviewer[];
  status: "pending" | "approved" | "sent_back";
  submittedAt: string;
  mentorFeedback?: string;
}

const MentorReviewApproval: React.FC = () => {
  const { user } = useAuth();
  const [activeCycle, setActiveCycle] = useState<PerformanceCycle | null>(null);
  const [menteeSubmissions, setMenteeSubmissions] = useState<MenteeSubmission[]>([]);
  const [selectedSubmission, setSelectedSubmission] = useState<MenteeSubmission | null>(null);
  const [feedback, setFeedback] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

        // Load pending approvals
        const approvalsResponse = await apiService.getPendingApprovals();
        if (approvalsResponse.data) {
          // Convert API response to local format
          const submissions = approvalsResponse.data.map((item: any) => ({
            id: item.id,
            menteeId: item.mentee_id,
            menteeName: item.mentee_name || 'Unknown',
            menteeEmail: item.mentee_email || 'unknown@company.com',
            reviewers: [], // This would need to be populated from reviewer_selection_details
            status: item.status as "pending" | "approved" | "sent_back",
            submittedAt: item.submitted_at,
            mentorFeedback: item.mentor_feedback,
          }));
          setMenteeSubmissions(submissions);
        } else if (approvalsResponse.error) {
          console.error('Error loading pending approvals:', approvalsResponse.error);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };

    loadData();
  }, []);

  const handleViewSubmission = (submission: MenteeSubmission) => {
    setSelectedSubmission(submission);
    setFeedback("");
    setIsDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedSubmission) return;

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedSubmissions = menteeSubmissions.map(sub => 
      sub.id === selectedSubmission.id 
        ? { ...sub, status: "approved" as const }
        : sub
    );

    setMenteeSubmissions(updatedSubmissions);
    setIsProcessing(false);
    setIsDialogOpen(false);
    setSelectedSubmission(null);
  };

  const handleSendBack = async () => {
    if (!selectedSubmission || !feedback.trim()) {
      alert("Please provide feedback when sending back a submission");
      return;
    }

    setIsProcessing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const updatedSubmissions = menteeSubmissions.map(sub => 
      sub.id === selectedSubmission.id 
        ? { ...sub, status: "sent_back" as const, mentorFeedback: feedback }
        : sub
    );

    setMenteeSubmissions(updatedSubmissions);
    setIsProcessing(false);
    setIsDialogOpen(false);
    setSelectedSubmission(null);
    setFeedback("");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "approved":
        return <Badge variant="default" className="bg-green-100 text-green-800">Approved</Badge>;
      case "sent_back":
        return <Badge variant="destructive" className="bg-red-100 text-red-800">Sent Back</Badge>;
      default:
        return null;
    }
  };

  const pendingSubmissions = menteeSubmissions.filter(sub => sub.status === "pending");
  const otherSubmissions = menteeSubmissions.filter(sub => sub.status !== "pending");

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
          <h1 className="text-3xl font-bold text-gray-900">Review & Approve Reviewers</h1>
          <p className="text-gray-600 mt-2">Review and approve reviewer selections from your mentees</p>
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
              <p className="text-lg font-semibold">{new Date(activeCycle.startDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">End Date</p>
              <p className="text-lg font-semibold">{new Date(activeCycle.endDate).toLocaleDateString()}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending Submissions */}
      {pendingSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Approvals ({pendingSubmissions.length})
            </CardTitle>
            <CardDescription>
              Review and approve reviewer selections from your mentees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingSubmissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{submission.menteeName}</h3>
                      <p className="text-sm text-gray-500">{submission.menteeEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(submission.status)}
                      <Button
                        onClick={() => handleViewSubmission(submission)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Review
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{submission.reviewers.length} reviewer(s) selected</span>
                    <span>•</span>
                    <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Other Submissions */}
      {otherSubmissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Other Submissions ({otherSubmissions.length})
            </CardTitle>
            <CardDescription>
              Previously processed submissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {otherSubmissions.map((submission) => (
                <div key={submission.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{submission.menteeName}</h3>
                      <p className="text-sm text-gray-500">{submission.menteeEmail}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(submission.status)}
                      <Button
                        onClick={() => handleViewSubmission(submission)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>{submission.reviewers.length} reviewer(s) selected</span>
                    <span>•</span>
                    <span>Submitted: {new Date(submission.submittedAt).toLocaleDateString()}</span>
                  </div>
                  {submission.mentorFeedback && (
                    <Alert className="mt-3">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{submission.mentorFeedback}</AlertDescription>
                    </Alert>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Submissions */}
      {menteeSubmissions.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Submissions</h3>
              <p className="text-gray-500">No mentee submissions to review at this time.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Submission</DialogTitle>
            <DialogDescription>
              Review the reviewer selection for {selectedSubmission?.menteeName}
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-500">Mentee</p>
                  <p className="font-semibold">{selectedSubmission.menteeName}</p>
                  <p className="text-sm text-gray-500">{selectedSubmission.menteeEmail}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Submitted</p>
                  <p className="font-semibold">{new Date(selectedSubmission.submittedAt).toLocaleString()}</p>
                </div>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium text-gray-500 mb-2">Selected Reviewers ({selectedSubmission.reviewers.length})</p>
                <div className="space-y-2">
                  {selectedSubmission.reviewers.map((reviewer) => (
                    <div key={reviewer.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{reviewer.name}</p>
                        <p className="text-sm text-gray-500">{reviewer.email}</p>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">{reviewer.department}</Badge>
                          <Badge variant="outline" className="text-xs">{reviewer.position}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedSubmission.status === "pending" && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-2">Feedback (required for sending back)</p>
                    <Textarea
                      placeholder="Provide feedback if sending back the submission..."
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            {selectedSubmission?.status === "pending" && (
              <>
                <Button
                  variant="destructive"
                  onClick={handleSendBack}
                  disabled={isProcessing || !feedback.trim()}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  {isProcessing ? "Sending..." : "Send Back"}
                </Button>
                <Button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  {isProcessing ? "Approving..." : "Approve"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MentorReviewApproval;
