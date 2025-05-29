❯ tsc -b
❯ node dist/graphTestVDB.js
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
        query: 'barcode scanner technical glitch assignment group vendor'
      },
      id: '2cf7907c-e172-4414-bbc1-aeee2fc8c100',
      type: 'tool_call'
    }
  ]
}
---

Output from node: 'retrieve'
{
  type: 'tool',
  content: 'Short Description: Barcode scanner not working post migration\n' +
    '      Resolution Notes: Scanner driver conflict with ABC drivers. Rolled back to compatible version.\n' +
    '      Work Notes: 05/02/2025 08:30:11 - ravi.yadav \n' +
    ' Identified driver version mismatch.\n' +
    ' 05/02/2025 09:10:43 - ravi.yadav \n' +
    ' Installed previous version. Working now.\n' +
    '\n' +
    'Short Description: Customer invoices showing incorrect tax in migrated system\n' +
    "      Resolution Notes: Tax configuration was still pointing to old region rates. Updated tax mapping in ABC's finance module.\n" +
    '      Work Notes: 05/03/2025 09:22:44 - deepak.jain \n' +
    ' Verified tax rules. Mapping error found.\n' +
    ' Updated region codes in tax config.\n' +
    '\n' +
    'Short Description: Inventory sync failure between warehouse and ABC portal\n' +
    '      Resolution Notes: Root cause was outdated API tokens post migration. Regenerated tokens and restarted the sync service.\n' +
    '      Work Notes: 05/02/2025 14:11:22 - swati.singh \n' +
    ' Auth tokens expired post-migration. Recreated them and restarted sync job.\n' +
    '\n' +
    'Short Description: Payment gateway not responding on migrated ABC site\n' +
    '      Resolution Notes: Replaced endpoint to point to ABC environment. Coordinated with Razorpay.\n' +
    '      Work Notes: 05/01/2025 12:15:12 - arun.patel \n' +
    ' Reached out to Razorpay team.\n' +
    ' 05/01/2025 14:00:01 - arun.patel \n' +
    ' Endpoint updated. Service is now active.',
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
      id: 'cefefc73-13b9-457b-ab89-b95743f28f17',
      type: 'tool_call'
    }
  ]
}
---

---GENERATE---
Output from node: 'generate'
{
  type: 'ai',
  content: 'The assignment group for the barcode scanner issue was not specified in the context, but the vendor mentioned is ABC. The technician who worked on this issue was Ravi Yadav.',
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
        "content": "The assignment group for the barcode scanner issue was not specified in the context, but the vendor mentioned is ABC. The technician who worked on this issue was Ravi Yadav.",
        "tool_calls": [],
        "response_metadata": {
          "model": "llama3.1:8b",
          "created_at": "2025-05-29T03:58:20.775414Z",
          "done_reason": "stop",
          "done": true,
          "total_duration": 4387910541,
          "load_duration": 26747208,
          "prompt_eval_count": 414,
          "prompt_eval_duration": 2344895042,
          "eval_count": 36,
          "eval_duration": 2015715250
        },
        "usage_metadata": {
          "input_tokens": 414,
          "output_tokens": 36,
          "total_tokens": 450
        },
        "invalid_tool_calls": [],
        "additional_kwargs": {}
      }
    }
  ]
}
~/devs/playwithlanggraph ❯ node dist/graphTestVDB.js