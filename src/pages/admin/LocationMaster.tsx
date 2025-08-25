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
import { Plus, Search, Edit, Trash2, MapPin, Filter, Globe, Building2 } from "lucide-react";

const STORAGE_KEY = "kph_admin_locations";

type LocationRow = { 
  id: string; 
  name: string; 
  address: string;
  city: string;
  country: string;
  type: "office" | "remote" | "hybrid";
  capacity: number;
  status: "active" | "inactive";
  description?: string;
  createdAt: string;
};

// Initialize dummy data
const initializeDummyLocations = () => {
  if (localStorage.getItem("kph_locations_initialized")) {
    return;
  }

  const dummyLocations: LocationRow[] = [
    {
      id: "1",
      name: "Kedaara Headquarters",
      address: "123 Business Park, Tower A",
      city: "Mumbai",
      country: "India",
      type: "office",
      capacity: 500,
      status: "active",
      description: "Main corporate headquarters with full facilities",
      createdAt: "2024-01-10"
    },
    {
      id: "2",
      name: "Bangalore Development Center",
      address: "456 Tech Hub, Electronic City",
      city: "Bangalore",
      country: "India",
      type: "office",
      capacity: 300,
      status: "active",
      description: "Primary development and engineering center",
      createdAt: "2024-01-15"
    },
    {
      id: "3",
      name: "Delhi Regional Office",
      address: "789 Connaught Place, Block B",
      city: "Delhi",
      country: "India",
      type: "office",
      capacity: 150,
      status: "active",
      description: "Regional office for North India operations",
      createdAt: "2024-01-20"
    },
    {
      id: "4",
      name: "Chennai Branch",
      address: "321 IT Corridor, Tidel Park",
      city: "Chennai",
      country: "India",
      type: "office",
      capacity: 200,
      status: "active",
      description: "South India operations and support center",
      createdAt: "2024-01-25"
    },
    {
      id: "5",
      name: "Remote Work Hub - East",
      address: "Virtual Office",
      city: "Kolkata",
      country: "India",
      type: "remote",
      capacity: 50,
      status: "active",
      description: "Remote work support for Eastern region",
      createdAt: "2024-02-01"
    },
    {
      id: "6",
      name: "Hybrid Workspace - Pune",
      address: "654 Hinjewadi Tech Park",
      city: "Pune",
      country: "India",
      type: "hybrid",
      capacity: 100,
      status: "active",
      description: "Flexible workspace with hybrid work options",
      createdAt: "2024-02-05"
    },
    {
      id: "7",
      name: "International Office - Singapore",
      address: "987 Marina Bay, Level 15",
      city: "Singapore",
      country: "Singapore",
      type: "office",
      capacity: 75,
      status: "active",
      description: "Asia-Pacific regional headquarters",
      createdAt: "2024-02-10"
    },
    {
      id: "8",
      name: "Legacy Office - Hyderabad",
      address: "147 Hitech City, Phase 2",
      city: "Hyderabad",
      country: "India",
      type: "office",
      capacity: 120,
      status: "inactive",
      description: "Former office location (closed)",
      createdAt: "2024-01-05"
    }
  ];

  localStorage.setItem(STORAGE_KEY, JSON.stringify(dummyLocations));
  localStorage.setItem("kph_locations_initialized", "true");
};

export default function LocationMaster() {
  const canonical = typeof window !== "undefined" ? window.location.origin + "/admin/locations" : "/admin/locations";
  const [rows, setRows] = useState<LocationRow[]>([]);
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const [editing, setEditing] = useState<LocationRow | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    initializeDummyLocations();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRows(raw ? JSON.parse(raw) : []);
    } catch {
      setRows([]);
    }
  }, []);

  const save = (list: LocationRow[]) => {
    setRows(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter((r) =>
      (typeFilter === "All" || r.type === typeFilter) &&
      (statusFilter === "All" || r.status === statusFilter) &&
      (r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.country.toLowerCase().includes(q))
    );
  }, [rows, query, typeFilter, statusFilter]);

  const startNew = () => {
    setEditing({ 
      id: crypto.randomUUID(), 
      name: "", 
      address: "",
      city: "",
      country: "",
      type: "office",
      capacity: 0,
      status: "active",
      description: "",
      createdAt: new Date().toISOString().split('T')[0]
    });
    setOpen(true);
  };

  const submit = () => {
    if (!editing) return;
    if (!editing.name || !editing.address || !editing.city || !editing.country) {
      toast({ 
        title: "Missing information", 
        description: "Name, address, city, and country are required",
        variant: "destructive"
      });
      return;
    }
    const exists = rows.some((r) => r.id === editing.id);
    const next = exists ? rows.map((r) => (r.id === editing.id ? editing : r)) : [editing, ...rows];
    save(next);
    setOpen(false);
    toast({ 
      title: exists ? "Location updated successfully" : "Location created successfully",
      description: exists ? "Location information has been updated" : "New location has been added to the system"
    });
  };

  const remove = (id: string) => {
    const location = rows.find(r => r.id === id);
    if (location) {
      save(rows.filter((r) => r.id !== id));
      toast({ 
        title: "Location deleted", 
        description: `${location.name} has been removed from the system`,
        variant: "destructive"
      });
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      "office": "bg-blue-100 text-blue-800",
      "remote": "bg-green-100 text-green-800",
      "hybrid": "bg-purple-100 text-purple-800"
    };
    const icons = {
      "office": Building2,
      "remote": Globe,
      "hybrid": MapPin
    };
    const Icon = icons[type as keyof typeof icons];
    return (
      <Badge className={colors[type as keyof typeof colors]}>
        <Icon className="h-3 w-3 mr-1" />
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === "active" 
      ? <Badge className="bg-green-100 text-green-800">Active</Badge>
      : <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>;
  };

  return (
    <>
      <Helmet>
        <title>Location Master | KPH Admin</title>
        <meta name="description" content="Manage office locations and workspaces in Kedaara Performance Hub." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-lg">
            <MapPin className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Location Master</h1>
            <p className="text-gray-600">Manage office locations, remote workspaces, and hybrid environments across the organization.</p>
          </div>
        </div>
      </header>

      <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader className="bg-gradient-to-r from-teal-50 to-cyan-50 border-b border-teal-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MapPin className="h-5 w-5 text-teal-600" />
              Locations Management
            </CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search and Filters */}
              <div className="flex gap-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Search locations..." 
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
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
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
              
              {/* Add Location Button */}
              <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                  <Button 
                    onClick={startNew}
                    className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white shadow-lg shadow-teal-500/25 transition-all duration-200 hover:scale-105"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Location
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[420px] max-w-[85vw] mx-auto bg-white/95 backdrop-blur-sm border-0 shadow-2xl rounded-xl p-0">
                  <DialogHeader className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                    <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-teal-600" />
                      {rows.some((r) => r.id === editing?.id) ? "Edit Location" : "Add New Location"}
                    </DialogTitle>
                  </DialogHeader>
                  {editing && (
                    <div className="space-y-3 p-5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Location Name</Label>
                                                     <Input 
                             value={editing.name} 
                             onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                             className="h-8 border-gray-200 focus:border-teal-300 focus:ring-teal-200 text-sm"
                             placeholder="Enter location name"
                           />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Type</Label>
                                                   <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as "office" | "remote" | "hybrid" })}>
                           <SelectTrigger className="h-8 border-gray-200 focus:border-teal-300 focus:ring-teal-200 text-sm">
                             <SelectValue placeholder="Select type" />
                           </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="office">Office</SelectItem>
                              <SelectItem value="remote">Remote</SelectItem>
                              <SelectItem value="hybrid">Hybrid</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Address</Label>
                                                 <Input 
                           value={editing.address} 
                           onChange={(e) => setEditing({ ...editing, address: e.target.value })}
                           className="h-8 border-gray-200 focus:border-teal-300 focus:ring-teal-200 text-sm"
                           placeholder="Enter full address"
                         />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">City</Label>
                                                     <Input 
                             value={editing.city} 
                             onChange={(e) => setEditing({ ...editing, city: e.target.value })}
                             className="h-8 border-gray-200 focus:border-teal-300 focus:ring-teal-200 text-sm"
                             placeholder="Enter city"
                           />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Country</Label>
                                                     <Input 
                             value={editing.country} 
                             onChange={(e) => setEditing({ ...editing, country: e.target.value })}
                             className="h-8 border-gray-200 focus:border-teal-300 focus:ring-teal-200 text-sm"
                             placeholder="Enter country"
                           />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Capacity</Label>
                                                     <Input 
                             type="number"
                             value={editing.capacity} 
                             onChange={(e) => setEditing({ ...editing, capacity: parseInt(e.target.value) || 0 })}
                             className="h-8 border-gray-200 focus:border-teal-300 focus:ring-teal-200 text-sm"
                             placeholder="Enter capacity"
                           />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700">Status</Label>
                                                     <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as "active" | "inactive" })}>
                             <SelectTrigger className="h-8 border-gray-200 focus:border-teal-300 focus:ring-teal-200 text-sm">
                               <SelectValue placeholder="Select status" />
                             </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700">Description</Label>
                        <Textarea 
                          value={editing.description || ""} 
                          onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                          className="border-gray-200 focus:border-teal-300 focus:ring-teal-200 text-sm"
                          placeholder="Enter location description"
                          rows={2}
                        />
                      </div>
                      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-6">
                        <Button 
                          variant="outline" 
                          onClick={() => setOpen(false)}
                          className="h-8 px-3 text-sm border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={submit}
                          className="h-8 px-4 text-sm bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white"
                        >
                          {rows.some((r) => r.id === editing.id) ? "Update Location" : "Create Location"}
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
                <TableHead className="font-semibold text-gray-700">Location</TableHead>
                <TableHead className="font-semibold text-gray-700">Address</TableHead>
                <TableHead className="font-semibold text-gray-700">City</TableHead>
                <TableHead className="font-semibold text-gray-700">Type</TableHead>
                <TableHead className="font-semibold text-gray-700">Capacity</TableHead>
                <TableHead className="font-semibold text-gray-700">Status</TableHead>
                <TableHead className="w-[160px] text-right font-semibold text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id} className="hover:bg-gray-50/50 transition-colors">
                  <TableCell className="font-medium text-gray-900">{r.name}</TableCell>
                  <TableCell className="text-gray-600 max-w-xs truncate">{r.address}</TableCell>
                  <TableCell className="text-gray-600">{r.city}</TableCell>
                  <TableCell>{getTypeBadge(r.type)}</TableCell>
                  <TableCell className="text-gray-600">{r.capacity}</TableCell>
                  <TableCell>{getStatusBadge(r.status)}</TableCell>
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
                    <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-lg font-medium">No locations found</p>
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
