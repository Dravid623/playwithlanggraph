var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _a, e_1, _b, _c;
import { ChatOllama } from '@langchain/ollama';
import { Annotation, MessagesAnnotation } from "@langchain/langgraph";
import { StateGraph } from "@langchain/langgraph";
import { MemorySaver } from "@langchain/langgraph";
import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { NodeInterrupt } from "@langchain/langgraph";
const model = new ChatOllama({
    model: "llama3.1:8b",
    temperature: 0,
    // other params...
});
const StateAnnotation = Annotation.Root(Object.assign(Object.assign({}, MessagesAnnotation.spec), { nextRepresentative: (Annotation), refundAuthorized: (Annotation) }));
const initialSupport = async (state) => {
    const SYSTEM_TEMPLATE = `You are frontline support staff for LangCorp, a company that sells computers.
Be concise in your responses.
You can chat with customers and help them with basic questions, but if the customer is having a billing or technical problem,
do not try to answer the question directly or gather information.
Instead, immediately transfer them to the billing or technical team by asking the user to hold for a moment.
Otherwise, just respond conversationally.`;
    const supportResponse = await model.invoke([
        { role: "system", content: SYSTEM_TEMPLATE },
        ...state.messages,
    ]);
    console.log("supportResponse:::::::::", supportResponse.content);
    const CATEGORIZATION_SYSTEM_TEMPLATE = `You are an expert customer support routing system.
Your job is to detect whether a customer support representative is routing a user to a billing team or a technical team, or if they are just responding conversationally.`;
    const CATEGORIZATION_HUMAN_TEMPLATE = `The previous conversation is an interaction between a customer support representative and a user.
Extract whether the representative is routing the user to a billing or technical team, or whether they are just responding conversationally.
Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:

If they want to route the user to the billing team, respond only with the word "BILLING".
If they want to route the user to the technical team, respond only with the word "TECHNICAL".
Otherwise, respond only with the word "RESPOND".`;
    const categorizationResponse = await model.invoke([{
            role: "system",
            content: CATEGORIZATION_SYSTEM_TEMPLATE,
        },
        ...state.messages,
        {
            role: "user",
            content: CATEGORIZATION_HUMAN_TEMPLATE,
        }], {
        //@ts-ignore
        response_format: {
            type: "json_object",
            schema: zodToJsonSchema(z.object({
                nextRepresentative: z.enum(["BILLING", "TECHNICAL", "RESPOND"]),
            }))
        }
    });
    console.log("categorizationResponse:::::::::", categorizationResponse.content);
    // Some chat models can return complex content, but Together will not
    const categorizationOutput = JSON.parse(categorizationResponse.content);
    // Will append the response message to the current interaction state
    return { messages: [supportResponse], nextRepresentative: categorizationOutput.nextRepresentative };
    // return {message: [supportResponse]}
};
const billingSupport = async (state) => {
    const SYSTEM_TEMPLATE = `You are an expert billing support specialist for LangCorp, a company that sells computers.
Help the user to the best of your ability, but be concise in your responses.
You have the ability to authorize refunds, which you can do by transferring the user to another agent who will collect the required information.
If you do, assume the other agent has all necessary information about the customer and their order.
You do not need to ask the user for more information.

Help the user to the best of your ability, but be concise in your responses.`;
    let trimmedHistory = state.messages;
    console.log("STATE:::::::::", state);
    // Make the user's question the most recent message in the history.
    // This helps small models stay focused.
    //@ts-ignore
    if (trimmedHistory.at(-1)._getType() === "ai") {
        trimmedHistory = trimmedHistory.slice(0, -1);
    }
    const billingRepResponse = await model.invoke([
        {
            role: "system",
            content: SYSTEM_TEMPLATE,
        },
        ...trimmedHistory,
    ]);
    console.log("billingRepResponse:::::::::", billingRepResponse.content);
    const CATEGORIZATION_SYSTEM_TEMPLATE = `Your job is to detect whether a billing support representative wants to refund the user.`;
    const CATEGORIZATION_HUMAN_TEMPLATE = `The following text is a response from a customer support representative.
Extract whether they want to refund the user or not.
Respond with a JSON object containing a single key called "nextRepresentative" with one of the following values:

If they want to refund the user, respond only with the word "REFUND".
Otherwise, respond only with the word "RESPOND".

here is the desired output form your side:
{
  "nextRepresentative": "REFUND"
}
we need this json further in chian so do not include any text other then valid json becuse it lead an error

Here is the text:

<text>
${billingRepResponse.content}
</text>.`;
    const categorizationResponse = await model.invoke([
        {
            role: "system",
            content: CATEGORIZATION_SYSTEM_TEMPLATE,
        },
        {
            role: "user",
            content: CATEGORIZATION_HUMAN_TEMPLATE,
        }
    ], {
        //@ts-ignore
        response_format: {
            type: "json_object",
            schema: zodToJsonSchema(z.object({
                nextRepresentative: z.enum(["REFUND", "RESPOND"]),
            }))
        }
    });
    console.log("BillingcategorizationResponse:::::::::", categorizationResponse.content);
    const categorizationOutput = JSON.parse(categorizationResponse.content);
    return {
        messages: billingRepResponse,
        nextRepresentative: categorizationOutput.nextRepresentative,
    };
};
const technicalSupport = async (state) => {
    const SYSTEM_TEMPLATE = `You are an expert at diagnosing technical computer issues. You work for a company called LangCorp that sells computers.
Help the user to the best of your ability, but be concise in your responses.`;
    let trimmedHistory = state.messages;
    // Make the user's question the most recent message in the history.
    // This helps small models stay focused.
    //@ts-ignore
    if (trimmedHistory.at(-1)._getType() === "ai") {
        trimmedHistory = trimmedHistory.slice(0, -1);
    }
    const response = await model.invoke([
        {
            role: "system",
            content: SYSTEM_TEMPLATE,
        },
        ...trimmedHistory,
    ]);
    console.log("TechincalcategorizationResponse:::::::::", response.content);
    return {
        messages: response,
    };
};
const handleRefund = async (state) => {
    if (!state.refundAuthorized) {
        console.log("--- HUMAN AUTHORIZATION REQUIRED FOR REFUND ---");
        throw new NodeInterrupt("Human authorization required.");
    }
    return {
        messages: {
            role: "assistant",
            content: "Refund processed!",
        },
    };
};
let builder = new StateGraph(StateAnnotation)
    .addNode("initial_support", initialSupport)
    .addNode("billing_support", billingSupport)
    .addNode("technical_support", technicalSupport)
    .addNode("handle_refund", handleRefund)
    .addEdge("__start__", "initial_support");
builder = builder.addConditionalEdges("initial_support", async (state) => {
    if (state.nextRepresentative.includes("BILLING")) {
        return "billing";
    }
    else if (state.nextRepresentative.includes("TECHNICAL")) {
        return "technical";
    }
    else {
        return "conversational";
    }
}, {
    billing: "billing_support",
    technical: "technical_support",
    conversational: "__end__",
});
builder = builder
    .addEdge("technical_support", "__end__")
    .addConditionalEdges("billing_support", async (state) => {
    if (state.nextRepresentative.includes("REFUND")) {
        return "refund";
    }
    else {
        return "__end__";
    }
}, {
    refund: "handle_refund",
    __end__: "__end__",
})
    .addEdge("handle_refund", "__end__");
console.log("Added edges!");
const checkpointer = new MemorySaver();
const graph = builder.compile({
    checkpointer,
});
// const stream = await graph.stream({
//   messages: [
//     {
//       role: "user",
//       content: "I've changed my mind and I want a refund for order #182818!",
//     //   content: "hello i am dravid need some help. can you help me",
//       // content: "hello i am dravid need some help. can you help me",
//     }
//   ]
// }, {
//   configurable: {
//     thread_id: "refund_testing_id",
//   }
// });
// for await (const value of stream) {
//   console.log("---STEP---");
//   console.log(value);
//   console.log("---END STEP---");
// }
const technicalStream = await graph.stream({
    messages: [{
            role: "user",
            content: "My LangCorp computer isn't turning on because I dropped it in water.",
        }]
}, {
    configurable: {
        thread_id: "technical_testing_id"
    }
});
try {
    for (var _d = true, technicalStream_1 = __asyncValues(technicalStream), technicalStream_1_1; technicalStream_1_1 = await technicalStream_1.next(), _a = technicalStream_1_1.done, !_a; _d = true) {
        _c = technicalStream_1_1.value;
        _d = false;
        const value = _c;
        console.log(value);
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (!_d && !_a && (_b = technicalStream_1.return)) await _b.call(technicalStream_1);
    }
    finally { if (e_1) throw e_1.error; }
}
