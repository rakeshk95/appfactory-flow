import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

type Row = { id: string; name: string; code: string };
const STORAGE_KEY = "kph_admin_locations";

export default function LocationMaster() {
  const canonical = typeof window !== "undefined" ? window.location.origin + "/admin/locations" : "/admin/locations";
  const [rows, setRows] = useState<Row[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setRows(raw ? JSON.parse(raw) : []);
    } catch {
      setRows([]);
    }
  }, []);

  const save = (list: Row[]) => {
    setRows(list);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return rows.filter((r) => r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q));
  }, [rows, query]);

  const startNew = () => {
    setEditing({ id: crypto.randomUUID(), name: "", code: "" });
    setOpen(true);
  };

  const submit = () => {
    if (!editing) return;
    if (!editing.name || !editing.code) {
      toast({ title: "Missing info", description: "Name and code are required" });
      return;
    }
    const exists = rows.some((r) => r.id === editing.id);
    const next = exists ? rows.map((r) => (r.id === editing.id ? editing : r)) : [editing, ...rows];
    save(next);
    setOpen(false);
    toast({ title: exists ? "Location updated" : "Location created" });
  };

  const remove = (id: string) => {
    save(rows.filter((r) => r.id !== id));
    toast({ title: "Location deleted" });
  };

  return (
    <>
      <Helmet>
        <title>Location Master | KPH Admin</title>
        <meta name="description" content="Manage office locations for Kedaara Performance Hub." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="mb-4">
        <h1 className="text-xl font-semibold">Location Master</h1>
        <p className="text-muted-foreground">Create, update, and manage locations.</p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Locations</CardTitle>
          <div className="flex gap-2">
            <Input placeholder="Search name or code" value={query} onChange={(e) => setQuery(e.target.value)} className="w-56" />
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={startNew}>Add Location</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>{rows.some((r) => r.id === editing?.id) ? "Edit Location" : "Add Location"}</DialogTitle>
                </DialogHeader>
                {editing && (
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Name</Label>
                      <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Code</Label>
                      <Input value={editing.code} onChange={(e) => setEditing({ ...editing, code: e.target.value })} />
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
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.code}</TableCell>
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
                  <TableCell colSpan={3} className="text-center text-muted-foreground">No locations found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
