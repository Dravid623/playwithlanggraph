 "facing problem with barcode scanner, i thing it might some techincal glitch.",

-----------------------------------------------------------------------------------

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
      args: { input: 'barcode scanner technical glitch' },
      id: 'fb328e64-ba2f-4b95-a181-396de0cc3522',
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
    '    "score": "0.782",\n' +
    '    "content": "Short Description: Barcode scanner not working post migration\\n      Resolution Notes: Scanner driver conflict with ABC drivers. Rolled back to compatible version.\\n      Work Notes: 05/02/2025 08:30:11 - ravi.yadav \\n Identified driver version mismatch.\\n 05/02/2025 09:10:43 - ravi.yadav \\n Installed previous version. Working now.",\n' +
    '    "assignmentGroup": "Hardware Ops",\n' +
    '    "vendor": "PQR Tech Services",\n' +
    '    "problem": "PRB0001323",\n' +
    '    "resolvedBy": "ravi.yadav",\n' +
    '    "assignedTo": "ravi.yadav"\n' +
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
      id: '09f725f4-e490-485a-a0c9-67505071f326',
      type: 'tool_call'
    }
  ]
}
---

---GENERATE---
Output from node: 'generate'
{
  type: 'ai',
  content: 'The assignment group is Hardware Ops. \n' +
    '\n' +
    'This information was found in the context provided, which describes a problem with a barcode scanner and its resolution. \n' +
    '\n' +
    'The score for this answer is high (0.782), indicating confidence in the accuracy of the response.',
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
        "content": "The assignment group is Hardware Ops. \n\nThis information was found in the context provided, which describes a problem with a barcode scanner and its resolution. \n\nThe score for this answer is high (0.782), indicating confidence in the accuracy of the response.",
        "tool_calls": [],
        "response_metadata": {
          "model": "llama3.1:8b",
          "created_at": "2025-05-29T06:54:47.491998Z",
          "done_reason": "stop",
          "done": true,
          "total_duration": 5714303750,
          "load_duration": 31671292,
          "prompt_eval_count": 290,
          "prompt_eval_duration": 1967027208,
          "eval_count": 52,
          "eval_duration": 3714942792
        },
        "usage_metadata": {
          "input_tokens": 290,
          "output_tokens": 52,
          "total_tokens": 342
        },
        "invalid_tool_calls": [],
        "additional_kwargs": {}
      }
    }
  ],
  "inputToken": 290,
  "outputToken": 52
}