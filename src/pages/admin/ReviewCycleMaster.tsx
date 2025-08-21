import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, CalendarClock, Filter, Play, Pause, CheckCircle } from "lucide-react";

const STORAGE_KEY = "kph_admin_review_cycles";

type ReviewCycleRow = { 
  id: string; 
  name: string; 
  description: string;
  startDate: string;
  endDate: string;
  type: "annual" | "mid-year" | "quarterly" | "project-based";
  status: "draft" | "active" | "completed" | "cancelled";
  participants: number;
  createdAt: string;
  createdBy: string;
};

// Initialize dummy data
const initializeDummyReviewCycles = () => {
  if (localStorage.getItem("kph_review_cycles_initialized")) {
    return;
  }

  const dummyReviewCycles: ReviewCycleRow[] = [
    {
      id: "1",
      name: "Annual Performance Review 2024",
      description: "Comprehensive annual performance evaluation for all employees",
      startDate: "2024-01-15",
      endDate: "2024-03-31",
      type: "annual",
      status: "active",
      participants: 150,
      createdAt: "2024-01-10",
      createdBy: "HR Lead"
    },
    {
      id: "2",
      name: "Q1 2024 Mid-Year Review",
      description: "Mid-year performance check and goal alignment",
      startDate: "2024-04-01",
      endDate: "2024-04-30",
      type: "mid-year",
      status: "draft",
      participants: 120,
      createdAt: "2024-03-15",
      createdBy: "HR Lead"
    },
    {
      id: "3",
      name: "Engineering Team Q1 Review",
      description: "Quarterly review for engineering department",
      startDate: "2024-01-01",
      endDate: "2024-01-31",
      type: "quarterly",
      status: "completed",
      participants: 45,
      createdAt: "2023-12-20",
      createdBy: "Engineering Manager"
    },
    {
      id: "4",
      name: "Product Launch Project Review",
      description: "Performance review for product launch team",
      startDate: "2024-02-01",
      endDate: "2024-02-28",
      type: "project-based",
      status: "completed",
      participants: 25,
      createdAt: "2024-01-25",
      createdBy: "Product Manager"
    },
    {
      id: "5",
      name: "Sales Team Q2 Review",
      description: "Quarterly performance review for sales team",
      startDate: "2024-04-01",
      endDate: "2024-04-30",
      type: "quarterly",
      status: "draft",
      participants: 30,
      createdAt: "2024-03-20",
      createdBy: "Sales Manager"
    },
    {
      id: "6",
      name: "Design Team Annual Review",
      description: "Annual comprehensive review for design team",
      startDate: "2024-03-01",
      endDate: "2024-03-31",
      type: "annual",
      status: "active",
      participants: 20,
      createdAt: "2024-02-15",
      createdBy: "Design Lead"
    },
    {
      id: "7",
      name: "Marketing Campaign Review",
      description: "Project-based review for recent marketing campaign",
      startDate: "2024-01-15",
      endDate: "2024-02-15",
      type: "project-based",
      status: "completed",
      participants: 15,
      createdAt: "2024-01-10",
      createdBy: "Marketing Manager"
    },
    {
      id: "8",
      name: "Support Team Q3 Review",
      description: "Quarterly review for customer support team",
      startDate: "2024-07-01",
      endDate: "2024-07-31",
      type: "quarterly",
      status: "cancelled",
      participants: 35,
      createdAt: "2024-06-15",
      createdBy: "Support Manager"
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyReviewCycles));
  localStorage.setItem("kph_review_cycles_initialized", "true");
};

export default function ReviewCycleMaster() {
  const canonical = typeof window !== "undefined" ? window.location.origin + "/admin/review-cycles" : "/admin/review-cycles";
  const [rows, setRows] = useState<ReviewCycleRow[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [editing, setEditing] = useState<ReviewCycleRow | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    initializeDummyReviewCycles();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRows(raw ? JSON.parse(raw) : []);
    } catch {
      setRows([]);
    }
  }, []);

  const save = (list: ReviewCycleRow[]) => {
    setRows(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter((r) =>
      (typeFilter === "All" || r.type === typeFilter) &&
      (statusFilter === "All" || r.status === statusFilter) &&
      (r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q))
    );
  }, [rows, query, typeFilter, statusFilter]);

  const startNew = () => {
    setEditing({ 
      id: crypto.randomUUID(), 
      name: "", 
      description: "",
      startDate: "",
      endDate: "",
      type: "annual",
      status: "draft",
      participants: 0,
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: "System Administrator"
    });
    setOpen(true);
  };

  const submit = () => {
    if (!editing) return;
    if (!editing.name || !editing.startDate || !editing.endDate) {
      toast({ 
        title: "Missing information", 
        description: "Name, start date, and end date are required",
        variant: "destructive"
      });
      return;
    }
    if (new Date(editing.startDate) >= new Date(editing.endDate)) {
      toast({ 
        title: "Invalid dates", 
        description: "End date must be after start date",
        variant: "destructive"
      });
      return;
    }
    const exists = rows.some((r) => r.id === editing.id);
    const next = exists ? rows.map((r) => (r.id === editing.id ? editing : r)) : [editing, ...rows];
    save(next);
    setOpen(false);
    toast({ 
      title: exists ? "Review cycle updated successfully" : "Review cycle created successfully",
      description: exists ? "Review cycle information has been updated" : "New review cycle has been added to the system"
    });
  };

  const remove = (id: string) => {
    const cycle = rows.find(r => r.id === id);
    if (cycle) {
      save(rows.filter((r) => r.id !== id));
      toast({ 
        title: "Review cycle deleted", 
        description: `${cycle.name} has been removed from the system`,
        variant: "destructive"
      });
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      "annual": "bg-blue-100 text-blue-800",
      "mid-year": "bg-green-100 text-green-800",
      "quarterly": "bg-purple-100 text-purple-800",
      "project-based": "bg-orange-100 text-orange-800"
    };
    return <Badge className={colors[type as keyof typeof colors]}>{type.replace('-', ' ').toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      "draft": "bg-gray-100 text-gray-800",
      "active": "bg-green-100 text-green-800",
      "completed": "bg-blue-100 text-blue-800",
      "cancelled": "bg-red-100 text-red-800"
    };
    const icons = {
      "draft": null,
      "active": Play,
      "completed": CheckCircle,
      "cancelled": Pause
    };
    const Icon = icons[status as keyof typeof icons];
    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {Icon && <Icon className="h-3 w-3 mr-1" />}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Review Cycle Master | KPH Admin</title>
        <meta name="description" content="Manage performance review cycles in Kedaara Performance Hub." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
            <CalendarClock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Review Cycle Master</h1>
            <p className="text-gray-600">Create and manage performance review cycles, schedules, and timelines across the organization.</p>
          </div>
        </div>
      </header>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarClock className="h-5 w-5 text-teal-600" />
              Review Cycles Management
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search and Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search cycles..." 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    className="pl-10 w-64 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-gray-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Types</SelectItem>
                    <SelectItem value="annual">Annual</SelectItem>
                    <SelectItem value="mid-year">Mid-Year</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="project-based">Project-Based</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Add Review Cycle Button */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={startNew}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25 transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Review Cycle
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] bg-white/95 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      {rows.some((r) => r.id === editing?.id) ? "Edit Review Cycle" : "Add New Review Cycle"}
                    </DialogTitle>
                  </DialogHeader>
                  {editing && (
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label className="font-medium text-gray-700">Cycle Name</Label>
                        <Input 
                          value={editing.name} 
                          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                          className="border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                          placeholder="Enter review cycle name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="font-medium text-gray-700">Description</Label>
                        <Textarea 
                          value={editing.description} 
                          onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                          className="border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                          placeholder="Enter cycle description"
                          rows={3}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="font-medium text-gray-700">Start Date</Label>
                          <Input 
                            type="date"
                            value={editing.startDate} 
                            onChange={(e) => setEditing({ ...editing, startDate: e.target.value })}
                            className="border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-medium text-gray-700">End Date</Label>
                          <Input 
                            type="date"
                            value={editing.endDate} 
                            onChange={(e) => setEditing({ ...editing, endDate: e.target.value })}
                            className="border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label className="font-medium text-gray-700">Type</Label>
                          <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as "annual" | "mid-year" | "quarterly" | "project-based" })}>
                            <SelectTrigger className="border-gray-200 focus:border-teal-300 focus:ring-teal-200">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="annual">Annual</SelectItem>
                              <SelectItem value="mid-year">Mid-Year</SelectItem>
                              <SelectItem value="quarterly">Quarterly</SelectItem>
                              <SelectItem value="project-based">Project-Based</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid gap-2">
                          <Label className="font-medium text-gray-700">Status</Label>
                          <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as "draft" | "active" | "completed" | "cancelled" })}>
                            <SelectTrigger className="border-gray-200 focus:border-teal-300 focus:ring-teal-200">
                              <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="draft">Draft</SelectItem>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label className="font-medium text-gray-700">Expected Participants</Label>
                        <Input 
                          type="number"
                          value={editing.participants} 
                          onChange={(e) => setEditing({ ...editing, participants: parseInt(e.target.value) || 0 })}
                          className="border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                          placeholder="Enter number of participants"
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4">
                        <Button 
                          variant="outline" 
                          onClick={() => setOpen(false)}
                          className="border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={submit}
                          className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                        >
                          {rows.some((r) => r.id === editing.id) ? "Update Cycle" : "Create Cycle"}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead className="font-semibold text-gray-700">Cycle Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Type</TableHead>
                <TableHead className="font-semibold text-gray-700">Duration</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Participants</TableHead>
                <TableHead className="font-semibold text-gray-700">Created By</TableHead>
                <TableHead className="w-[160px] text-right font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell>
                    <div>
                      <div className="font-medium text-gray-900">{r.name}</div>
                      <div className="text-sm text-gray-600 max-w-xs truncate">{r.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getTypeBadge(r.type)}</TableCell>
                  <TableCell className="text-gray-600">
                    <div className="text-sm">
                      <div>{formatDate(r.startDate)}</div>
                      <div>to {formatDate(r.endDate)}</div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(r.status)}</TableCell>
                  <TableCell className="text-gray-600">{r.participants}</TableCell>
                  <TableCell className="text-gray-600">{r.createdBy}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => { setEditing(r); setOpen(true); }}
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:border-blue-300"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => remove(r.id)}
                        className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                    <CalendarClock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No review cycles found</p>
                    <p className="text-sm">Try adjusting your search or filters</p>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
