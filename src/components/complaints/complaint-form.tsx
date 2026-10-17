"use client";

import { useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { complaintCategories, complaintCategoryLabels } from "@/constants/complaints";
import type { ComplaintCategory } from "@/types/complaint";

type ComplaintFormValues = {
  category: ComplaintCategory | "";
  subject: string;
  message: string;
};

type ComplaintFormErrors = Partial<Record<keyof ComplaintFormValues, string>>;

export function ComplaintForm({ onSubmit }: { onSubmit: (values: ComplaintFormValues & { category: ComplaintCategory }) => void }) {
  const [values, setValues] = useState<ComplaintFormValues>({ category: "", subject: "", message: "" });
  const [errors, setErrors] = useState<ComplaintFormErrors>({});

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors: ComplaintFormErrors = {};
    if (!values.category) nextErrors.category = "Choose a complaint category.";
    if (!values.subject.trim()) nextErrors.subject = "Enter a subject for your complaint.";
    if (values.subject.trim().length > 100) nextErrors.subject = "Keep the subject under 100 characters.";
    if (!values.message.trim()) nextErrors.message = "Tell us what happened or what you would like to suggest.";
    if (values.message.trim().length < 10) nextErrors.message = "Please add a little more detail (at least 10 characters).";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length || !values.category) return;
    onSubmit({ ...values, category: values.category });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Category</span>
        <select
          value={values.category}
          onChange={(event) => setValues((current) => ({ ...current, category: event.target.value as ComplaintCategory }))}
          aria-invalid={Boolean(errors.category)}
          className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
        >
          <option value="">Select a category</option>
          {complaintCategories.map((category) => <option key={category} value={category}>{complaintCategoryLabels[category]}</option>)}
        </select>
        {errors.category ? <p className="mt-2 text-xs font-semibold text-rose-600">{errors.category}</p> : null}
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Subject</span>
        <Input value={values.subject} onChange={(event) => setValues((current) => ({ ...current, subject: event.target.value }))} placeholder="Briefly describe the issue" maxLength={101} aria-invalid={Boolean(errors.subject)} />
        {errors.subject ? <p className="mt-2 text-xs font-semibold text-rose-600">{errors.subject}</p> : null}
      </label>
      <label className="block">
        <span className="mb-2 block text-sm font-bold text-slate-700">Message</span>
        <textarea value={values.message} onChange={(event) => setValues((current) => ({ ...current, message: event.target.value }))} placeholder="Share the details so the admin can help" rows={7} aria-invalid={Boolean(errors.message)} className="w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100" />
        {errors.message ? <p className="mt-2 text-xs font-semibold text-rose-600">{errors.message}</p> : null}
      </label>
      <Button type="submit" size="lg" className="w-full"><Send className="size-4" />Submit Complaint</Button>
      <p className="text-center text-xs leading-5 text-slate-500">We&apos;ll review your message and get back to you as soon as possible.</p>
    </form>
  );
}
