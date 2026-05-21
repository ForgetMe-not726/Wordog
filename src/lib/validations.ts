import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dogName: z.string().min(1, "Dog name is required"),
});

export const learnAnswerSchema = z.object({
  wordId: z.string().min(1),
  round: z.number().int().min(1).max(3),
  correct: z.boolean(),
});

export const reviewAnswerSchema = z.object({
  wordId: z.string().min(1),
  correct: z.boolean(),
});

export const dogActionSchema = z.object({
  action: z.enum(["feed", "buy_accessory", "unlock_breed", "switch_breed", "equip"]),
  accessoryId: z.string().optional(),
  breedId: z.string().optional(),
});
