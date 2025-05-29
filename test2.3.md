" Payment got stuck on migrated ABC site"
-------------------------------------------------------------------------------------
 npm run dev:test

> demo2-incident@1.0.0 dev:test
> npm run build && node dist/graphTestVDB.js


> demo2-incident@1.0.0 build
> tsc -b

---CALL AGENT---
---DECIDE TO RETRIEVE---
---DECISION: RETRIEVE---
Output from node: 'agent'
{
  type: 'ai',
  content: '',
  tool_calls: [
    {
      name: 'retrieve_past_incident',
      args: { input: 'Payment got stuck on migrated ABC site' },
      id: 'b5fde042-b0ae-412d-b600-5e73ca1b0aef',
      type: 'tool_call'
    }
  ]
}
---

Output from node: 'retrieve'
{
  type: 'tool',
  content: '[\n' +
    '  {\n' +
    '    "rank": 1,\n' +
    '    "score": "0.788",\n' +
    '    "content": "Short Description: Payment gateway not responding on migrated ABC site\\n      Resolution Notes: Replaced endpoint to point to ABC environment. Coordinated with Razorpay.\\n      Work Notes: 05/01/2025 12:15:12 - arun.patel \\n Reached out to Razorpay team.\\n 05/01/2025 14:00:01 - arun.patel \\n Endpoint updated. Service is now active.",\n' +
    '    "assignmentGroup": "PQR Infra",\n' +
    '    "vendor": "TCS",\n' +
    '    "problem": "PRB0001288",\n' +
    '    "resolvedBy": "arun.patel",\n' +
    '    "assignedTo": "arun.patel"\n' +
    '  }\n' +
    ']',
  tool_calls: undefined
}
---

---GET RELEVANCE---
---CHECK RELEVANCE---
---DECISION: DOCS RELEVANT---
Output from node: 'gradeDocuments'
{
  type: 'ai',
  content: '',
  tool_calls: [
    {
      name: 'give_relevance_score',
      args: { binaryScore: 'yes' },
      id: '6c06f400-9c8b-483f-8a3e-f7eff567d952',
      type: 'tool_call'
    }
  ]
}
---

---GENERATE---
Output from node: 'generate'
{
  type: 'ai',
  content: 'The assignmentGroup is PQR Infra. \n' +
    '\n' +
    'Note: The score for this context is 78.8%, which is above the threshold of 65%.',
  tool_calls: []
}
---

{
  "messages": [
    {
      "lc": 1,
      "type": "constructor",
      "id": [
        "langchain_core",
        "messages",
        "AIMessage"
      ],
      "kwargs": {
        "content": "The assignmentGroup is PQR Infra. \n\nNote: The score for this context is 78.8%, which is above the threshold of 65%.",
        "tool_calls": [],
        "response_metadata": {
          "model": "llama3.1:8b",
          "created_at": "2025-05-29T06:44:42.43527Z",
          "done_reason": "stop",
          "done": true,
          "total_duration": 3797586959,
          "load_duration": 30933542,
          "prompt_eval_count": 286,
          "prompt_eval_duration": 1747608333,
          "eval_count": 33,
          "eval_duration": 2018324125
        },
        "usage_metadata": {
          "input_tokens": 286,
          "output_tokens": 33,
          "total_tokens": 319
        },
        "invalid_tool_calls": [],
        "additional_kwargs": {}
      }
    }
  ],
  "inputToken": 286,
  "outputToken": 33
}