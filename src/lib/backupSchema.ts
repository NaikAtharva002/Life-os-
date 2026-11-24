import { z } from 'zod';

export const backupSchema = z.object({
  version: z.union([z.literal(1), z.literal(2)]),
  exportedAt: z.string().optional(),
  appVersion: z.string().optional(),
  goals: z.array(z.record(z.string(), z.any())).default([]),
  tasks: z.array(z.record(z.string(), z.any())).default([]),
  habits: z.array(z.record(z.string(), z.any())).default([]),
  habitEntries: z.array(z.record(z.string(), z.any())).default([]),
  financeTransactions: z.array(z.record(z.string(), z.any())).default([]),
  financeBudgets: z.array(z.record(z.string(), z.any())).default([]),
  savingsGoals: z.array(z.record(z.string(), z.any())).default([]),
  exercises: z.array(z.record(z.string(), z.any())).default([]),
  workoutSessions: z.array(z.record(z.string(), z.any())).default([]),
  bodyMetrics: z.array(z.record(z.string(), z.any())).default([]),
  fitnessGoals: z.array(z.record(z.string(), z.any())).default([]),
  academicSemesters: z.array(z.record(z.string(), z.any())).default([]),
  academicSubjects: z.array(z.record(z.string(), z.any())).default([]),
  academicAssignments: z.array(z.record(z.string(), z.any())).default([]),
  academicExams: z.array(z.record(z.string(), z.any())).default([]),
  timetableSlots: z.array(z.record(z.string(), z.any())).default([]),
  careerGoals: z.array(z.record(z.string(), z.any())).default([]),
  careerSkills: z.array(z.record(z.string(), z.any())).default([]),
  careerProjects: z.array(z.record(z.string(), z.any())).default([]),
  careerApplications: z.array(z.record(z.string(), z.any())).default([]),
  careerDocuments: z.array(z.record(z.string(), z.any())).default([]),
  eveningReviews: z.array(z.record(z.string(), z.any())).default([]),
  obsidianNotes: z.array(z.record(z.string(), z.any())).default([]),
  settings: z.record(z.string(), z.any()).optional(),
});

export type ValidatedBackup = z.infer<typeof backupSchema>;

export function parseAndValidateBackup(jsonString: string): {
  success: boolean;
  data?: ValidatedBackup;
  error?: string;
} {
  try {
    const raw = JSON.parse(jsonString);
    const result = backupSchema.safeParse(raw);
    if (!result.success) {
      const issueDetails = result.error.issues
        .slice(0, 3)
        .map((iss) => `${iss.path.join('.')}: ${iss.message}`)
        .join('; ');
      return { success: false, error: `Invalid backup schema: ${issueDetails}` };
    }
    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: `Failed to parse JSON: ${err?.message || 'Unknown error'}` };
  }
}
