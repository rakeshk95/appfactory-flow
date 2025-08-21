import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar, Users, FileText, Edit, Save, Send, Clock, CheckCircle, AlertCircle, Plus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface Employee {
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

interface FeedbackForm {
  id: string;
  employeeId: string;
  employeeName: string;
  strengths: string;
  improvements: string;
  overallRating: "tracking_below" | "tracking_expected" | "tracking_above";
  status: "draft" | "submitted";
  createdAt: string;
  updatedAt: string;
}

const ReviewerFeedback: React.FC = () => {
  const { user } = useAuth();
  const [activeCycle, setActiveCycle] = useState<PerformanceCycle | null>(null);
  const [assignedEmployees, setAssignedEmployees] = useState<Employee[]>([]);
  const [feedbackForms, setFeedbackForms] = useState<FeedbackForm[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    strengths: "",
    improvements: "",
    overallRating: "" as string,
  });

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

    // Simulate API call for assigned employees
    setAssignedEmployees([
      { id: "emp-1", name: "Alice Johnson", email: "alice.johnson@company.com", department: "Engineering", position: "Software Engineer" },
      { id: "emp-2", name: "Bob Davis", email: "bob.davis@company.com", department: "Product", position: "Product Manager" },
      { id: "emp-3", name: "Carol White", email: "carol.white@company.com", department: "Design", position: "UX Designer" },
    ]);

    // Load existing feedback forms from localStorage
    const existingForms = localStorage.getItem(`feedback_forms_${user?.email}`);
    if (existingForms) {
      setFeedbackForms(JSON.parse(existingForms));
    }
  }, [user]);

  const handleInitiateReview = (employee: Employee) => {
    setSelectedEmployee(employee);
    
    // Check if there's already a form for this employee
    const existingForm = feedbackForms.find(form => form.employeeId === employee.id);
    if (existingForm) {
      setFormData({
        strengths: existingForm.strengths,
        improvements: existingForm.improvements,
        overallRating: existingForm.overallRating,
      });
    } else {
      setFormData({
        strengths: "",
        improvements: "",
        overallRating: "",
      });
    }
    
    setIsDialogOpen(true);
  };

  const handleSaveDraft = async () => {
    if (!selectedEmployee) return;

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newForm: FeedbackForm = {
      id: Date.now().toString(),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      strengths: formData.strengths,
      improvements: formData.improvements,
      overallRating: formData.overallRating as "tracking_below" | "tracking_expected" | "tracking_above",
      status: "draft",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedForms = feedbackForms.filter(form => form.employeeId !== selectedEmployee.id);
    const newForms = [...updatedForms, newForm];
    
    setFeedbackForms(newForms);
    localStorage.setItem(`feedback_forms_${user?.email}`, JSON.stringify(newForms));
    setIsSubmitting(false);
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleSubmit = async () => {
    if (!selectedEmployee || !formData.strengths.trim() || !formData.improvements.trim() || !formData.overallRating) {
      alert("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const newForm: FeedbackForm = {
      id: Date.now().toString(),
      employeeId: selectedEmployee.id,
      employeeName: selectedEmployee.name,
      strengths: formData.strengths,
      improvements: formData.improvements,
      overallRating: formData.overallRating as "tracking_below" | "tracking_expected" | "tracking_above",
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedForms = feedbackForms.filter(form => form.employeeId !== selectedEmployee.id);
    const newForms = [...updatedForms, newForm];
    
    setFeedbackForms(newForms);
    localStorage.setItem(`feedback_forms_${user?.email}`, JSON.stringify(newForms));
    setIsSubmitting(false);
    setIsDialogOpen(false);
    setSelectedEmployee(null);
  };

  const handleEditForm = (form: FeedbackForm) => {
    const employee = assignedEmployees.find(emp => emp.id === form.employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setFormData({
        strengths: form.strengths,
        improvements: form.improvements,
        overallRating: form.overallRating,
      });
      setIsDialogOpen(true);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case "submitted":
        return <Badge variant="default" className="bg-green-100 text-green-800">Submitted</Badge>;
      default:
        return null;
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case "tracking_below":
        return "Tracking below expectations (Tracking -)";
      case "tracking_expected":
        return "Tracking as expected";
      case "tracking_above":
        return "Tracking above expectations (Tracking +)";
      default:
        return "";
    }
  };

  const submittedForms = feedbackForms.filter(form => form.status === "submitted");
  const draftForms = feedbackForms.filter(form => form.status === "draft");
  const pendingEmployees = assignedEmployees.filter(emp => 
    !feedbackForms.some(form => form.employeeId === emp.id && form.status === "submitted")
  );

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
          <h1 className="text-3xl font-bold text-gray-900">Provide Feedback</h1>
          <p className="text-gray-600 mt-2">Review and provide feedback for assigned employees</p>
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

      {/* Pending Reviews */}
      {pendingEmployees.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              Pending Reviews ({pendingEmployees.length})
            </CardTitle>
            <CardDescription>
              Employees waiting for your feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingEmployees.map((employee) => (
                <div key={employee.id} className="border rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{employee.name}</h3>
                      <p className="text-sm text-gray-500">{employee.email}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">{employee.department}</Badge>
                        <Badge variant="outline" className="text-xs">{employee.position}</Badge>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleInitiateReview(employee)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Start Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Draft Forms */}
      {draftForms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-blue-600" />
              Draft Reviews ({draftForms.length})
            </CardTitle>
            <CardDescription>
              Reviews saved as drafts that you can continue editing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {draftForms.map((form) => (
                <div key={form.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{form.employeeName}</h3>
                      <p className="text-sm text-gray-500">
                        Last updated: {new Date(form.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(form.status)}
                      <Button
                        onClick={() => handleEditForm(form)}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Edit className="h-4 w-4" />
                        Continue
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Strengths:</strong> {form.strengths.substring(0, 100)}{form.strengths.length > 100 ? "..." : ""}</p>
                    <p><strong>Improvements:</strong> {form.improvements.substring(0, 100)}{form.improvements.length > 100 ? "..." : ""}</p>
                    {form.overallRating && (
                      <p><strong>Rating:</strong> {getRatingLabel(form.overallRating)}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submitted Forms */}
      {submittedForms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Submitted Reviews ({submittedForms.length})
            </CardTitle>
            <CardDescription>
              Reviews that have been submitted
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {submittedForms.map((form) => (
                <div key={form.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">{form.employeeName}</h3>
                      <p className="text-sm text-gray-500">
                        Submitted: {new Date(form.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(form.status)}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <p><strong>Strengths:</strong> {form.strengths.substring(0, 100)}{form.strengths.length > 100 ? "..." : ""}</p>
                    <p><strong>Improvements:</strong> {form.improvements.substring(0, 100)}{form.improvements.length > 100 ? "..." : ""}</p>
                    <p><strong>Rating:</strong> {getRatingLabel(form.overallRating)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Assignments */}
      {assignedEmployees.length === 0 && (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <div className="text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Assignments</h3>
              <p className="text-gray-500">No employees have been assigned to you for review.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Feedback Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Performance Review - {selectedEmployee?.name}</DialogTitle>
            <DialogDescription>
              Provide comprehensive feedback for {selectedEmployee?.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Employee Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Employee Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Name</p>
                  <p className="font-medium">{selectedEmployee?.name}</p>
                </div>
                <div>
                  <p className="text-gray-500">Email</p>
                  <p className="font-medium">{selectedEmployee?.email}</p>
                </div>
                <div>
                  <p className="text-gray-500">Department</p>
                  <p className="font-medium">{selectedEmployee?.department}</p>
                </div>
                <div>
                  <p className="text-gray-500">Position</p>
                  <p className="font-medium">{selectedEmployee?.position}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Feedback Form */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="strengths" className="text-base font-medium">
                  1. What is this person doing well and his/her key strengths?
                </Label>
                <Textarea
                  id="strengths"
                  placeholder="Describe the employee's strengths and what they do well..."
                  value={formData.strengths}
                  onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="improvements" className="text-base font-medium">
                  2. Where can he/she do better?
                </Label>
                <Textarea
                  id="improvements"
                  placeholder="Describe areas for improvement and growth opportunities..."
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  rows={4}
                  className="mt-2"
                />
              </div>

              <div>
                <Label className="text-base font-medium">
                  3. Provide Overall Rating
                </Label>
                <RadioGroup
                  value={formData.overallRating}
                  onValueChange={(value) => setFormData({ ...formData, overallRating: value })}
                  className="mt-2 space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tracking_below" id="tracking_below" />
                    <Label htmlFor="tracking_below">Tracking below expectations (Tracking -)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tracking_expected" id="tracking_expected" />
                    <Label htmlFor="tracking_expected">Tracking as expected</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tracking_above" id="tracking_above" />
                    <Label htmlFor="tracking_above">Tracking above expectations (Tracking +)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save as Draft"}
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.strengths.trim() || !formData.improvements.trim() || !formData.overallRating}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewerFeedback;
