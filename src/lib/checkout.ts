import { z } from "zod";
import type { DeliveryFees } from "./delivery";

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu",
  "FCT (Abuja)", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina",
  "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo",
  "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

export function deliveryFeeForState(state: string, fees: DeliveryFees): number {
  if (!state) return 0;
  return state === "Lagos" ? fees.lagosFee : fees.otherStatesFee;
}

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name"),
  email: z.string().trim().min(1, "Enter your email address").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .transform((v) => v.replace(/[\s-]/g, ""))
    .refine(
      (v) => /^(?:\+234|234|0)[789]\d{9}$/.test(v),
      "Enter a valid phone number"
    ),
  address: z.string().trim().min(5, "Enter a delivery address"),
  town: z.string().trim().min(2, "Enter your town"),
  state: z
    .string()
    .min(1, "Select a state")
    .refine((v) => NIGERIAN_STATES.includes(v), "Select a valid state"),
  notes: z.string().trim().optional(),
});

export type CheckoutFormValues = z.infer<typeof checkoutSchema>;
