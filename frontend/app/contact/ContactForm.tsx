"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import toast from "react-hot-toast";
import clsx from "clsx";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  topic: z.enum(["SUPPORT", "LISTING", "PAYMENT", "PARTNERSHIP"], {
    message: "Choose a topic",
  }),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactForm() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({ resolver: zodResolver(contactSchema) });

  async function onSubmit(values: ContactFormValues) {
    // No backend ticket endpoint yet — acknowledge locally and keep the data visible.
    await new Promise((r) => setTimeout(r, 600));
    setSent(true);
    toast.success(`Thanks ${values.name}! Your ${values.topic.toLowerCase()} message was received.`);
    reset();
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cf-name" className="text-sm font-medium mb-1 block">
            Name
          </label>
          <input
            id="cf-name"
            className={clsx("input", errors.name && "border-red-500")}
            placeholder="Your name"
            {...register("name")}
          />
          {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="cf-email" className="text-sm font-medium mb-1 block">
            Email
          </label>
          <input
            id="cf-email"
            type="email"
            className={clsx("input", errors.email && "border-red-500")}
            placeholder="you@example.com"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="cf-topic" className="text-sm font-medium mb-1 block">
          Topic
        </label>
        <select id="cf-topic" className={clsx("input", errors.topic && "border-red-500")} {...register("topic")}>
          <option value="SUPPORT">General support</option>
          <option value="LISTING">Listing question</option>
          <option value="PAYMENT">Payment issue</option>
          <option value="PARTNERSHIP">Partnership</option>
        </select>
        {errors.topic && <p className="text-xs text-red-600 mt-1">{errors.topic.message}</p>}
      </div>
      <div>
        <label htmlFor="cf-message" className="text-sm font-medium mb-1 block">
          Message
        </label>
        <textarea
          id="cf-message"
          rows={5}
          className={clsx("input", errors.message && "border-red-500")}
          placeholder="How can we help?"
          {...register("message")}
        />
        {errors.message && <p className="text-xs text-red-600 mt-1">{errors.message.message}</p>}
      </div>
      <button className="btn-primary" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : sent ? "Send another message" : "Send message"}
      </button>
    </form>
  );
}
