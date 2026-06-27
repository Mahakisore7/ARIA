// lib/gemini/tools.ts
// All function calling tool declarations — Gemini decides when to invoke these

export const ariaTools = [
  {
    functionDeclarations: [
      {
        name: 'decompose_task',
        description: 'Break a task into executable subtasks with time estimates, dependencies, and risk flags. Use this when the user wants to plan a new task.',
        parameters: {
          type: 'OBJECT',
          properties: {
            task_description: { type: 'STRING', description: 'Full task description' },
            deadline_iso: { type: 'STRING', description: 'Deadline in ISO 8601 format' },
            available_minutes: { type: 'NUMBER', description: 'Available working minutes before deadline' },
            task_category: {
              type: 'STRING',
              enum: ['coding', 'writing', 'research', 'design', 'administrative', 'other'],
              description: 'Category of work required',
            },
          },
          required: ['task_description', 'deadline_iso', 'available_minutes'],
        },
      },
      {
        name: 'generate_sprint_plan',
        description: 'Generate a time-boxed emergency sprint plan for an imminent deadline. Use when available_minutes is less than 6 hours equivalent (360 minutes) or user declares a crisis.',
        parameters: {
          type: 'OBJECT',
          properties: {
            task_description: { type: 'STRING', description: 'Full task description' },
            available_minutes: { type: 'NUMBER', description: 'Total minutes available before deadline' },
            sections: {
              type: 'ARRAY',
              items: { type: 'STRING' },
              description: 'Known sections or components of the deliverable',
            },
            deliverable_type: { type: 'STRING', description: 'Type of deliverable (report, code, presentation, etc.)' },
          },
          required: ['task_description', 'available_minutes'],
        },
      },
      {
        name: 'draft_communication',
        description: 'Draft a professional stakeholder communication for a deadline change or partial delivery. Always call this after generate_sprint_plan in Rescue Mode.',
        parameters: {
          type: 'OBJECT',
          properties: {
            context: { type: 'STRING', description: 'Task context and what is being delivered vs. cut' },
            recipient_type: {
              type: 'STRING',
              enum: ['professor', 'manager', 'client', 'colleague', 'investor'],
              description: 'Type of recipient to calibrate tone',
            },
            deliverable_status: { type: 'STRING', description: 'What will be delivered and what will not' },
            revised_timeline: { type: 'STRING', description: 'New timeline for remaining work if applicable' },
          },
          required: ['context', 'recipient_type'],
        },
      },
      {
        name: 'calculate_risk',
        description: 'Calculate deadline risk level for a task based on effort vs. available time.',
        parameters: {
          type: 'OBJECT',
          properties: {
            deadline_iso: { type: 'STRING', description: 'Task deadline in ISO 8601' },
            estimated_effort_hours: { type: 'NUMBER', description: 'Estimated hours of work remaining' },
            progress_percentage: { type: 'NUMBER', description: 'Percentage of task already completed (0-100)' },
            has_dependencies: { type: 'BOOLEAN', description: 'Whether task depends on external inputs' },
          },
          required: ['deadline_iso', 'estimated_effort_hours'],
        },
      },
    ],
  },
]
