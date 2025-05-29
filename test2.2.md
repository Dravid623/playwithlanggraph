"user complainant about sms notification is not recived after order placemnt in abc app"
-------------------------------------------------------------------------------------------------------------

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
      args: {
        input: 'sms notification not received after order placement in abc app'
      },
      id: '843c6570-619d-4c54-a480-520f5346e79f',
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
    '    "score": "0.842",\n' +
    '    "content": "Short Description: SMS notifications not sent after order placement in ABC app\\n      Resolution Notes: SMS gateway config not migrated. Updated credentials and endpoint for messaging service.\\n      Work Notes: 05/03/2025 13:10:30 - amit.kulkarni \\n Found missing SMS gateway config.\\n Added credentials and verified with test order.",\n' +
    '    "assignmentGroup": "Customer Engagement",\n' +
    '    "vendor": "TCS",\n' +
    '    "problem": "PRB0001378",\n' +
    '    "resolvedBy": "amit.kulkarni",\n' +
    '    "assignedTo": "amit.kulkarni"\n' +
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
      id: 'ee168f9d-a628-4249-9c0f-84af47b0ea43',
      type: 'tool_call'
    }
  ]
}
---

---GENERATE---
Output from node: 'generate'
{
  type: 'ai',
  content: 'The assignment group is Customer Engagement.',
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
        "content": "The assignment group is Customer Engagement.",
        "tool_calls": [],
        "response_metadata": {
          "model": "llama3.1:8b",
          "created_at": "2025-05-29T06:53:35.117859Z",
          "done_reason": "stop",
          "done": true,
          "total_duration": 2504750250,
          "load_duration": 30776708,
          "prompt_eval_count": 280,
          "prompt_eval_duration": 1961835625,
          "eval_count": 8,
          "eval_duration": 511421792
        },
        "usage_metadata": {
          "input_tokens": 280,
          "output_tokens": 8,
          "total_tokens": 288
        },
        "invalid_tool_calls": [],
        "additional_kwargs": {}
      }
    }
  ],
  "inputToken": 280,
  "outputToken": 8
}