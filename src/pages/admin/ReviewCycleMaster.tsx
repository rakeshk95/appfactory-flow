import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

const STORAGE_KEY = "kph_admin_cycles";

type Cycle = {
  id: string;
  year: number;
  type: "Semi-Annual" | "Annual";
  start: string; // ISO
  end: string; // ISO
  status: "Draft" | "Active" | "Closed";
};

export default function ReviewCycleMaster() {
  const canonical = typeof window !== "undefined" ? window.location.origin + "/admin/review-cycles" : "/admin/review-cycles";
  const [rows, setRows] = useState<Cycle[]>([]);
  const [yearFilter, setYearFilter] = useState<string>("All");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [editing, setEditing] = useState<Cycle | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRows(raw ? JSON.parse(raw) : []);
    } catch {
      setRows([]);
    }
  }, []);

  const save = (list: Cycle[]) => {
    setRows(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const filtered = useMemo(() => {
    return rows.filter((r) =>
      (yearFilter === "All" || String(r.year) === yearFilter) &&
      (typeFilter === "All" || r.type === typeFilter) &&
      (statusFilter === "All" || r.status === statusFilter)
    );
  }, [rows, yearFilter, typeFilter, statusFilter]);

  const startNew = () => {
    const now = new Date();
    const y = now.getFullYear();
    setEditing({ id: crypto.randomUUID(), year: y, type: "Semi-Annual", start: `${y}-01-01`, end: `${y}-06-30`, status: "Draft" });
    setOpen(true);
  };

  const submit = () => {
    if (!editing) return;
    if (!editing.year || !editing.start || !editing.end) {
      toast({ title: "Missing info", description: "Year and date range are required" });
      return;
    }
    const exists = rows.some((r) => r.id === editing.id);
    const next = exists ? rows.map((r) => (r.id === editing.id ? editing : r)) : [editing, ...rows];
    save(next);
    setOpen(false);
    toast({ title: exists ? "Cycle updated" : "Cycle created" });
  };

  const remove = (id: string) => {
    save(rows.filter((r) => r.id !== id));
    toast({ title: "Cycle deleted" });
  };

  const years = Array.from(new Set(rows.map((r) => r.year))).sort((a, b) => b - a);

  return (
    <>
      <Helmet>
        <title>Review Cycle Master | KPH Admin</title>
        <meta name="description" content="Manage Semi-Annual and Annual review cycles for each year." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="mb-4">
        <h1 className="text-xl font-semibold">Review Cycle Master</h1>
        <p className="text-muted-foreground">Two review cycles per calendar year - Semi-Annual and Annual.</p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Review Cycles</CardTitle>
          <div className="flex flex-wrap gap-2 items-center">
            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-28"><SelectValue placeholder="Year" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All</SelectItem>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {(["All", "Semi-Annual", "Annual"] as const).map((t) => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                {(["All", "Draft", "Active", "Closed"] as const).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={startNew}>Add Cycle</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[560px]">
                <DialogHeader>
                  <DialogTitle>{rows.some((r) => r.id === editing?.id) ? "Edit Review Cycle" : "Add Review Cycle"}</DialogTitle>
                </DialogHeader>
                {editing && (
                  <div className="grid gap-4">
                    <div className="grid gap-2 md:grid-cols-3">
                      <div className="grid gap-2">
                        <Label>Year</Label>
                        <Input type="number" value={editing.year} onChange={(e) => setEditing({ ...editing, year: Number(e.target.value) })} />
                      </div>
                      <div className="grid gap-2 md:col-span-2">
                        <Label>Type</Label>
                        <Select value={editing.type} onValueChange={(v) => setEditing({ ...editing, type: v as Cycle["type"] })}>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Semi-Annual">Semi-Annual</SelectItem>
                            <SelectItem value="Annual">Annual</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid gap-2 md:grid-cols-2">
                      <div className="grid gap-2">
                        <Label>Start date</Label>
                        <Input type="date" value={editing.start} onChange={(e) => setEditing({ ...editing, start: e.target.value })} />
                      </div>
                      <div className="grid gap-2">
                        <Label>End date</Label>
                        <Input type="date" value={editing.end} onChange={(e) => setEditing({ ...editing, end: e.target.value })} />
                      </div>
                    </div>
                    <div className="grid gap-2">
                      <Label>Status</Label>
                      <Select value={editing.status} onValueChange={(v) => setEditing({ ...editing, status: v as Cycle["status"] })}>
                        <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Draft">Draft</SelectItem>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
                      <Button onClick={submit}>Save</Button>
                    </div>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Year</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[160px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.year}</TableCell>
                  <TableCell>{r.type}</TableCell>
                  <TableCell>{r.start}</TableCell>
                  <TableCell>{r.end}</TableCell>
                  <TableCell>{r.status}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => { setEditing(r); setOpen(true); }}>Edit</Button>
                      <Button variant="destructive" size="sm" onClick={() => remove(r.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">No review cycles found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
