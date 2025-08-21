import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Edit, Trash2, Users, Filter } from "lucide-react";
import type { Role } from "@/context/AuthContext";

const STORAGE_KEY = "kph_admin_users";

type UserRow = { 
  id: string; 
  name: string; 
  email: string; 
  role: Role;
  department?: string;
  status: "active" | "inactive";
  createdAt: string;
};

// Initialize dummy data
const initializeDummyUsers = () => {
  if (localStorage.getItem("kph_users_initialized")) {
    return;
  }

  const dummyUsers: UserRow[] = [
    {
      id: "1",
      name: "Arjun Mehta",
      email: "arjun.mehta@kedaara.com",
      role: "Employee",
      department: "Engineering",
      status: "active",
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Priya Singh",
      email: "priya.singh@kedaara.com",
      role: "Mentor",
      department: "Product Management",
      status: "active",
      createdAt: "2024-01-10"
    },
    {
      id: "3",
      name: "Ravi Kumar",
      email: "ravi.kumar@kedaara.com",
      role: "Employee",
      department: "Design",
      status: "active",
      createdAt: "2024-01-20"
    },
    {
      id: "4",
      name: "Neha Kapoor",
      email: "neha.kapoor@kedaara.com",
      role: "HR Lead",
      department: "Human Resources",
      status: "active",
      createdAt: "2024-01-05"
    },
    {
      id: "5",
      name: "Amit Patel",
      email: "amit.patel@kedaara.com",
      role: "People Committee",
      department: "Operations",
      status: "active",
      createdAt: "2024-01-12"
    },
    {
      id: "6",
      name: "Sneha Sharma",
      email: "sneha.sharma@kedaara.com",
      role: "Employee",
      department: "Marketing",
      status: "inactive",
      createdAt: "2024-01-18"
    },
    {
      id: "7",
      name: "Rajesh Verma",
      email: "rajesh.verma@kedaara.com",
      role: "System Administrator",
      department: "IT",
      status: "active",
      createdAt: "2024-01-08"
    },
    {
      id: "8",
      name: "Kavita Reddy",
      email: "kavita.reddy@kedaara.com",
      role: "Mentor",
      department: "Engineering",
      status: "active",
      createdAt: "2024-01-14"
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyUsers));
  localStorage.setItem("kph_users_initialized", "true");
};

export default function UserMaster() {
  const canonical = typeof window !== "undefined" ? window.location.origin + "/admin/users" : "/admin/users";
  const [rows, setRows] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [editing, setEditing] = useState<UserRow | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    initializeDummyUsers();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRows(raw ? JSON.parse(raw) : []);
    } catch {
      setRows([]);
    }
  }, []);

  const save = (list: UserRow[]) => {
    setRows(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter((r) =>
      (roleFilter === "All" || r.role === roleFilter) &&
      (statusFilter === "All" || r.status === statusFilter) &&
      (r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q) || r.department?.toLowerCase().includes(q))
    );
  }, [rows, query, roleFilter, statusFilter]);

  const startNew = () => {
    setEditing({ 
      id: crypto.randomUUID(), 
      name: "", 
      email: "", 
      role: "Employee",
      department: "",
      status: "active",
      createdAt: new Date().toISOString().split('T')[0]
    });
    setOpen(true);
  };

  const submit = () => {
    if (!editing) return;
    if (!editing.name || !editing.email) {
      toast({ 
        title: "Missing information", 
        description: "Name and email are required",
        variant: "destructive"
      });
      return;
    }
    const exists = rows.some((r) => r.id === editing.id);
    const next = exists ? rows.map((r) => (r.id === editing.id ? editing : r)) : [editing, ...rows];
    save(next);
    setOpen(false);
    toast({ 
      title: exists ? "User updated successfully" : "User created successfully",
      description: exists ? "User information has been updated" : "New user has been added to the system"
    });
  };

  const remove = (id: string) => {
    const user = rows.find(r => r.id === id);
    if (user) {
      save(rows.filter((r) => r.id !== id));
      toast({ 
        title: "User deleted", 
        description: `${user.name} has been removed from the system`,
        variant: "destructive"
      });
    }
  };

  const getRoleBadge = (role: Role) => {
    const colors = {
      "Employee": "bg-blue-100 text-blue-800",
      "Mentor": "bg-green-100 text-green-800",
      "HR Lead": "bg-purple-100 text-purple-800",
      "People Committee": "bg-orange-100 text-orange-800",
      "System Administrator": "bg-red-100 text-red-800"
    };
    return <Badge className={colors[role]}>{role}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>User Master | KPH Admin</title>
        <meta name="description" content="Manage users and roles in Kedaara Performance Hub." />
        <link rel="canonical" href={canonical} />
      </Helmet>

    

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-teal-600" />
              Users Management
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search and Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search users..." 
                    value={query} 
                    onChange={(e) => setQuery(e.target.value)} 
                    className="pl-10 w-64 bg-white/80 backdrop-blur-sm border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                  />
                </div>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-40 bg-white/80 backdrop-blur-sm border-gray-200">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    {(["All", "Employee", "Mentor", "HR Lead", "People Committee", "System Administrator"] as const).map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32 bg-white/80 backdrop-blur-sm border-gray-200">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Add User Button */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={startNew}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25 transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[520px] bg-white/95 backdrop-blur-sm">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold text-gray-900">
                      {rows.some((r) => r.id === editing?.id) ? "Edit User" : "Add New User"}
                    </DialogTitle>
                  </DialogHeader>
                  {editing && (
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label className="font-medium text-gray-700">Full Name</Label>
                        <Input 
                          value={editing.name} 
                          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                          className="border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                          placeholder="Enter full name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="font-medium text-gray-700">Email Address</Label>
                        <Input 
                          type="email" 
                          value={editing.email} 
                          onChange={(e) => setEditing({ ...editing, email: e.target.value })}
                          className="border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                          placeholder="Enter email address"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="font-medium text-gray-700">Department</Label>
                        <Input 
                          value={editing.department || ""} 
                          onChange={(e) => setEditing({ ...editing, department: e.target.value })}
                          className="border-gray-200 focus:border-teal-300 focus:ring-teal-200"
                          placeholder="Enter department"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label className="font-medium text-gray-700">Role</Label>
                        <Select value={editing.role} onValueChange={(v) => setEditing({ ...editing, role: v as Role })}>
                          <SelectTrigger className="border-gray-200 focus:border-teal-300 focus:ring-teal-200">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {(["Employee", "Mentor", "HR Lead", "People Committee", "System Administrator"] as const).map((r) => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label className="font-medium text-gray-700">Status</Label>
                        <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as "active" | "inactive" })}>
                          <SelectTrigger className="border-gray-200 focus:border-teal-300 focus:ring-teal-200">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                          </SelectContent>
                        </Select>
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
                          {rows.some((r) => r.id === editing.id) ? "Update User" : "Create User"}
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
                <TableHead className="font-semibold text-gray-700">Name</TableHead>
                <TableHead className="font-semibold text-gray-700">Email</TableHead>
                <TableHead className="font-semibold text-gray-700">Department</TableHead>
                <TableHead className="font-semibold text-gray-700">Role</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="font-semibold text-gray-700">Created</TableHead>
                <TableHead className="w-[160px] text-right font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium text-gray-900">{r.name}</TableCell>
                  <TableCell className="text-gray-600">{r.email}</TableCell>
                  <TableCell className="text-gray-600">{r.department || "-"}</TableCell>
                  <TableCell>{getRoleBadge(r.role)}</TableCell>
                  <TableCell>{getStatusBadge(r.status)}</TableCell>
                  <TableCell className="text-gray-600">{r.createdAt}</TableCell>
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
                    <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No users found</p>
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
