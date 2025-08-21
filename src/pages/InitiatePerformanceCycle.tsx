import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar, Settings, Save, Plus, Trash2 } from "lucide-react";

interface PerformanceCycle {
  id: string;
  type: "Mid-Year" | "Year-End";
  financialYear: string;
  milestoneDates: {
    selectReviewers: string;
    mentorApproval: string;
    feedbackSubmission: string;
    ratingFinalization: string;
    appraisalDiscussions: string;
    postAppraisalReflections: string;
  };
  status: "active" | "inactive" | "completed";
  createdAt: string;
  createdBy: string;
}

export default function InitiatePerformanceCycle() {
  const { user } = useAuth();
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    type: "" as "Mid-Year" | "Year-End" | "",
    financialYear: "",
    milestoneDates: {
      selectReviewers: "",
      mentorApproval: "",
      feedbackSubmission: "",
      ratingFinalization: "",
      appraisalDiscussions: "",
      postAppraisalReflections: "",
    }
  });

  // Generate financial years (current year + 5 years back)
  const financialYears = Array.from({ length: 6 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return `${year}-${year + 1}`;
  });

  useEffect(() => {
    // Load existing cycles from localStorage
    const existingCycles = JSON.parse(localStorage.getItem('performanceCycles') || '[]');
    setCycles(existingCycles);
  }, []);

  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        if (parent === 'milestoneDates') {
          return {
            ...prev,
            milestoneDates: {
              ...prev.milestoneDates,
              [child]: value
            }
          };
        }
        return prev;
      });
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.type) {
      toast.error("Please select the type of cycle");
      return false;
    }
    if (!formData.financialYear) {
      toast.error("Please select the financial year");
      return false;
    }
    
    const dates = Object.values(formData.milestoneDates);
    if (dates.some(date => !date)) {
      toast.error("Please fill in all milestone dates");
      return false;
    }

    // Validate date sequence
    const dateObjects = dates.map(date => new Date(date));
    for (let i = 1; i < dateObjects.length; i++) {
      if (dateObjects[i] <= dateObjects[i - 1]) {
        toast.error("Milestone dates must be in chronological order");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const newCycle: PerformanceCycle = {
      id: Date.now().toString(),
      type: formData.type as "Mid-Year" | "Year-End",
      financialYear: formData.financialYear,
      milestoneDates: formData.milestoneDates,
      status: "active",
      createdAt: new Date().toISOString(),
      createdBy: user?.email || ""
    };

    const updatedCycles = [...cycles, newCycle];
    setCycles(updatedCycles);
    localStorage.setItem('performanceCycles', JSON.stringify(updatedCycles));
    
    // Reset form
    setFormData({
      type: "",
      financialYear: "",
      milestoneDates: {
        selectReviewers: "",
        mentorApproval: "",
        feedbackSubmission: "",
        ratingFinalization: "",
        appraisalDiscussions: "",
        postAppraisalReflections: "",
      }
    });
    setIsCreating(false);
    
    toast.success("Performance cycle created successfully");
  };

  const handleDeleteCycle = (cycleId: string) => {
    const updatedCycles = cycles.filter(cycle => cycle.id !== cycleId);
    setCycles(updatedCycles);
    localStorage.setItem('performanceCycles', JSON.stringify(updatedCycles));
    toast.success("Performance cycle deleted");
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      completed: "bg-blue-100 text-blue-800"
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status as keyof typeof colors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div 
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
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="h-6 w-6" />
          Initiate Performance Cycle
        </h1>
        <p className="text-muted-foreground">Create and manage performance review cycles</p>
      </header>

      {/* Create New Cycle */}
      <Card 
        style={{
          width: '100%',
          maxWidth: 'none',
          minWidth: '100%',
          margin: '0',
          padding: '0'
        }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Create New Performance Cycle</CardTitle>
            <Button
              onClick={() => setIsCreating(!isCreating)}
              variant={isCreating ? "outline" : "default"}
            >
              {isCreating ? "Cancel" : "New Cycle"}
            </Button>
          </div>
        </CardHeader>
        {isCreating && (
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cycleType">Type of Cycle</Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select cycle type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mid-Year">Mid-Year</SelectItem>
                    <SelectItem value="Year-End">Year-End</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="financialYear">Financial Year</Label>
                <Select value={formData.financialYear} onValueChange={(value) => handleInputChange('financialYear', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select financial year" />
                  </SelectTrigger>
                  <SelectContent>
                    {financialYears.map(year => (
                      <SelectItem key={year} value={year}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-base font-medium">Milestone Dates</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                <div>
                  <Label htmlFor="selectReviewers">Select Reviewers</Label>
                  <Input
                    id="selectReviewers"
                    type="date"
                    value={formData.milestoneDates.selectReviewers}
                    onChange={(e) => handleInputChange('milestoneDates.selectReviewers', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="mentorApproval">Obtain Approval from Mentor</Label>
                  <Input
                    id="mentorApproval"
                    type="date"
                    value={formData.milestoneDates.mentorApproval}
                    onChange={(e) => handleInputChange('milestoneDates.mentorApproval', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="feedbackSubmission">Reviewer Submits Feedback</Label>
                  <Input
                    id="feedbackSubmission"
                    type="date"
                    value={formData.milestoneDates.feedbackSubmission}
                    onChange={(e) => handleInputChange('milestoneDates.feedbackSubmission', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="ratingFinalization">Review and Finalization of Ratings</Label>
                  <Input
                    id="ratingFinalization"
                    type="date"
                    value={formData.milestoneDates.ratingFinalization}
                    onChange={(e) => handleInputChange('milestoneDates.ratingFinalization', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="appraisalDiscussions">Appraisal Discussions & Communications</Label>
                  <Input
                    id="appraisalDiscussions"
                    type="date"
                    value={formData.milestoneDates.appraisalDiscussions}
                    onChange={(e) => handleInputChange('milestoneDates.appraisalDiscussions', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="postAppraisalReflections">Post Appraisal Reflections</Label>
                  <Input
                    id="postAppraisalReflections"
                    type="date"
                    value={formData.milestoneDates.postAppraisalReflections}
                    onChange={(e) => handleInputChange('milestoneDates.postAppraisalReflections', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSubmit} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                Create Cycle
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Existing Cycles */}
      <Card 
        style={{
          width: '100%',
          maxWidth: 'none',
          minWidth: '100%',
          margin: '0',
          padding: '0'
        }}
      >
        <CardHeader>
          <CardTitle>Existing Performance Cycles</CardTitle>
        </CardHeader>
        <CardContent>
          {cycles.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No performance cycles created yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {cycles.map((cycle) => (
                <div key={cycle.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium">{cycle.type} Cycle - {cycle.financialYear}</h3>
                      <p className="text-sm text-muted-foreground">
                        Created on {new Date(cycle.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(cycle.status)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCycle(cycle.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div><span className="font-medium">Select Reviewers:</span> {new Date(cycle.milestoneDates.selectReviewers).toLocaleDateString()}</div>
                    <div><span className="font-medium">Mentor Approval:</span> {new Date(cycle.milestoneDates.mentorApproval).toLocaleDateString()}</div>
                    <div><span className="font-medium">Feedback Submission:</span> {new Date(cycle.milestoneDates.feedbackSubmission).toLocaleDateString()}</div>
                    <div><span className="font-medium">Rating Finalization:</span> {new Date(cycle.milestoneDates.ratingFinalization).toLocaleDateString()}</div>
                    <div><span className="font-medium">Appraisal Discussions:</span> {new Date(cycle.milestoneDates.appraisalDiscussions).toLocaleDateString()}</div>
                    <div><span className="font-medium">Post Reflections:</span> {new Date(cycle.milestoneDates.postAppraisalReflections).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
