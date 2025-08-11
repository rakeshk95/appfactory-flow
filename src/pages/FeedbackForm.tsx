import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/hooks/use-toast";
import { AppHeader } from "@/components/layout/Header";

const employees = ["Arjun Mehta", "Priya Singh", "Ravi Kumar", "Neha Kapoor"];

type FeedbackFormValues = {
  employee: string;
  strengths: string;
  improvements: string;
  rating: "Tracking below expectations" | "Tracking as expected" | "Tracking above expectations";
};

export default function FeedbackForm() {
  const { user } = useAuth();
  const { register, handleSubmit, setValue, watch, reset } = useForm<FeedbackFormValues>({
    defaultValues: {
      employee: employees[0],
      strengths: "",
      improvements: "",
      rating: "Tracking as expected",
    },
  });

  const onSubmit = (v: FeedbackFormValues) => {
    const list = JSON.parse(localStorage.getItem("kph_feedback") || "[]");
    list.push({ ...v, reviewer: user?.email, ts: Date.now() });
    localStorage.setItem("kph_feedback", JSON.stringify(list));
    toast({ title: "Feedback submitted", description: `For ${v.employee}` });
    reset();
  };

  const canonical = typeof window !== "undefined" ? window.location.origin + "/feedback" : "/feedback";

  return (
    <>
      <Helmet>
        <title>Submit Feedback | KPH</title>
        <meta name="description" content="Submit structured performance feedback in Kedaara Performance Hub." />
        <link rel="canonical" href={canonical} />
      </Helmet>

      <AppHeader />

      <main className="container py-8">
        <header className="mb-6">
          <h1 className="text-3xl font-bold">Submit Feedback</h1>
          <p className="text-muted-foreground">Provide structured feedback using the KPH framework.</p>
        </header>

        <Card>
          <CardHeader>
            <CardTitle>Feedback form</CardTitle>
            <CardDescription>
              Complete the fields below and select an overall performance rating.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label>Employee</Label>
                <Select defaultValue={watch("employee")} onValueChange={(v) => setValue("employee", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((e) => (
                      <SelectItem key={e} value={e}>{e}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strengths">What is this person doing well and key strengths?</Label>
                <Textarea id="strengths" className="min-h-[120px]" placeholder="Strengths, achievements, behaviors..." {...register("strengths", { required: true })} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="improvements">Where can he/she do better?</Label>
                <Textarea id="improvements" className="min-h-[120px]" placeholder="Opportunities, suggestions..." {...register("improvements", { required: true })} />
              </div>

              <div className="space-y-3">
                <Label>Provide Overall Rating</Label>
                <RadioGroup value={watch("rating")} onValueChange={(v) => setValue("rating", v as any)}>
                  <label className="flex items-center gap-3">
                    <RadioGroupItem value="Tracking below expectations" />
                    <span>Tracking below expectations (Tracking -)</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <RadioGroupItem value="Tracking as expected" />
                    <span>Tracking as expected</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <RadioGroupItem value="Tracking above expectations" />
                    <span>Tracking above expectations (Tracking +)</span>
                  </label>
                </RadioGroup>
              </div>

              <Button type="submit">Submit Feedback</Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
