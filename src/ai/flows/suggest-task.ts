// src/ai/flows/suggest-task.ts
'use server';

/**
 * @fileOverview Suggests logical tasks that can be added to any of the lanes, and determines in which lane it should be located.
 *
 * - suggestTask - A function that suggests a task and its lane.
 * - SuggestTaskInput - The input type for the suggestTask function.
 * - SuggestTaskOutput - The return type for the suggestTask function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTaskInputSchema = z.object({
  lanes: z
    .array(
      z.object({
        name: z.string().describe('The name of the lane.'),
        tasks: z.array(z.string()).describe('The tasks currently in the lane.'),
      })
    )
    .describe('The current lanes and tasks in the roadmap.'),
  currentTask: z.string().optional().describe('The current task being considered, if any.'),
});

export type SuggestTaskInput = z.infer<typeof SuggestTaskInputSchema>;

const SuggestTaskOutputSchema = z.object({
  task: z.string().describe('The suggested task.'),
  lane: z.string().describe('The lane the task should be added to.'),
});

export type SuggestTaskOutput = z.infer<typeof SuggestTaskOutputSchema>;

export async function suggestTask(input: SuggestTaskInput): Promise<SuggestTaskOutput> {
  return suggestTaskFlow(input);
}

const suggestTaskPrompt = ai.definePrompt({
  name: 'suggestTaskPrompt',
  input: {schema: SuggestTaskInputSchema},
  output: {schema: SuggestTaskOutputSchema},
  prompt: `Given the following lanes and tasks in a roadmap, suggest a logical next task and the lane it should be added to. Consider the current task, if provided.

Lanes:
{{#each lanes}}
  Lane Name: {{this.name}}
  Tasks:
  {{#each this.tasks}}
    - {{this}}
  {{/each}}
{{/each}}

Current Task: {{currentTask}}

Suggest a task that would be a logical next step and the lane it belongs in.

Task: {{task}}
Lane: {{lane}}`,
});

const suggestTaskFlow = ai.defineFlow(
  {
    name: 'suggestTaskFlow',
    inputSchema: SuggestTaskInputSchema,
    outputSchema: SuggestTaskOutputSchema,
  },
  async input => {
    const {output} = await suggestTaskPrompt(input);
    return output!;
  }
);
