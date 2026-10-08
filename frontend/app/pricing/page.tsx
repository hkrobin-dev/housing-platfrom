import type { Metadata } from "next";
import PricingClient from "./PricingClient";

export const metadata: Metadata = {
  title: "Pricing | Housing Platform",
  description:
    "Simple pricing: free for tenants, flexible plans for owners and managers based on listings and rooms. Pay securely via SSLCommerz.",
  openGraph: {
    title: "Pricing | Housing Platform",
    description: "Free for tenants. Fair plans for owners.",
  },
};

export default function PricingPage() {
  return <PricingClient />;
}
