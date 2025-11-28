import { z } from 'zod';

export const generateDialogueSchema = z.object({
  topic: z.string().min(3, "Topic must be at least 3 characters long"),
  level: z.enum(["beginner", "intermediate", "advanced"]).optional().default("intermediate"),
});

export const ttsSchema = z.object({
  text: z.string().min(1, "Text is required"),
  language: z.string().optional().default("es"),
  options: z.object({
    gender: z.enum(["male", "female"]).optional(),
    speed: z.number().optional(),
  }).optional(),
});

export const grammarAnalysisSchema = z.object({
  text: z.string().min(1, "Text is required"),
  context: z.string().optional().default("General conversation"),
});
