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
import type { Role } from "@/context/AuthContext";

const STORAGE_KEY = "kph_admin_users";

type UserRow = { id: string; name: string; email: string; role: Role };

export default function UserMaster() {
  const canonical = typeof window !== "undefined" ? window.location.origin + "/admin/users" : "/admin/users";
  const [rows, setRows] = useState<UserRow[]>([]);
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("All");

  const [editing, setEditing] = useState<UserRow | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
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
      (r.name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
    );
  }, [rows, query, roleFilter]);

  const startNew = () => {
    setEditing({ id: crypto.randomUUID(), name: "", email: "", role: "Employee" });
    setOpen(true);
  };

  const submit = () => {
    if (!editing) return;
    if (!editing.name || !editing.email) {
      toast({ title: "Missing info", description: "Name and email are required" });
      return;
    }
    const exists = rows.some((r) => r.id === editing.id);
    const next = exists ? rows.map((r) => (r.id === editing.id ? editing : r)) : [editing, ...rows];
    save(next);
    setOpen(false);
    toast({ title: exists ? "User updated" : "User created" });
  };

  const remove = (id: string) => {
    save(rows.filter((r) => r.id !== id));
    toast({ title: "User deleted" });
  };

  return (
    <>
      <Helmet>
        <title>User Master | KPH Admin</title>
        <meta name="description" content="Manage users and roles in Kedaara Performance Hub." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <header className="mb-4">
        <h1 className="text-xl font-semibold">User Master</h1>
        <p className="text-muted-foreground">Create, update, and manage users and their roles.</p>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Users</CardTitle>
          <div className="flex gap-2">
            <Input placeholder="Search name or email" value={query} onChange={(e) => setQuery(e.target.value)} className="w-56" />
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40"><SelectValue placeholder="Filter role" /></SelectTrigger>
              <SelectContent>
                {(["All", "Employee", "Mentor", "HR Lead", "People Committee", "System Administrator"] as const).map((r) => (
                  <SelectItem key={r} value={r}>{r}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button onClick={startNew}>Add User</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[520px]">
                <DialogHeader>
                  <DialogTitle>{rows.some((r) => r.id === editing?.id) ? "Edit User" : "Add User"}</DialogTitle>
                </DialogHeader>
                {editing && (
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label>Name</Label>
                      <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Email</Label>
                      <Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                    </div>
                    <div className="grid gap-2">
                      <Label>Role</Label>
                      <Select value={editing.role} onValueChange={(v) => setEditing({ ...editing, role: v as Role })}>
                        <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                        <SelectContent>
                          {(["Employee", "Mentor", "HR Lead", "People Committee", "System Administrator"] as const).map((r) => (
                            <SelectItem key={r} value={r}>{r}</SelectItem>
                          ))}
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="w-[140px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.name}</TableCell>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.role}</TableCell>
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
                  <TableCell colSpan={4} className="text-center text-muted-foreground">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
