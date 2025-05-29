var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var _a, e_1, _b, _c;
import { vectorStore } from "./vectorStore.js";
import { Annotation } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { END } from "@langchain/langgraph";
import { pull } from "langchain/hub";
import { z } from "zod";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StateGraph } from "@langchain/langgraph";
import { START } from "@langchain/langgraph";
import { HumanMessage } from "@langchain/core/messages";
import { DynamicTool } from "langchain/tools";
import { ChatOllama } from "@langchain/ollama";
export const llm = new ChatOllama({ model: "llama3.1:8b", temperature: 0, });
const GraphState = Annotation.Root({
    messages: Annotation({
        reducer: (x, y) => x.concat(y),
        default: () => [],
    }),
    inputToken: Annotation({
        reducer: (x, y) => x + y,
        default: () => 0
    }),
    outputToken: Annotation({
        reducer: (x, y) => x + y,
        default: () => 0
    })
});
// const tool = createRetrieverTool(
//   retriever,
//   {
//     name: "retrieve_past_incident",
//     description:
//       "Search and return information about past Similar incident related to user's given incident.",
//   },
// );
// const tools = [tool];
// const toolNode = new ToolNode<typeof GraphState.State>(tools);
const retrievePastIncidentTool = new DynamicTool({
    name: "retrieve_past_incident",
    description: "Search and return top 3 past incidents most similar to the given incident report. Includes score, short description, resolution, work notes, and metadata.",
    func: async (input) => {
        const topK = 1;
        const results = await vectorStore.similaritySearchWithScore(input, topK);
        // console.log("results=================================",results)
        const structured = results.map(([doc, score], idx) => ({
            rank: idx + 1,
            score: score.toFixed(3),
            content: doc.pageContent || "N/A",
            assignmentGroup: doc.metadata.assignmentGroup || "N/A",
            vendor: doc.metadata.vendor || "N/A",
            problem: doc.metadata.problem || "N/A",
            resolvedBy: doc.metadata.resolvedBy || "N/A",
            assignedTo: doc.metadata.assignedTo || "N/A",
        }));
        return JSON.stringify(structured, null, 2); // Send structured results
    }
});
const tools = [retrievePastIncidentTool];
const toolNode = new ToolNode(tools);
/**
 * Decides whether the agent should retrieve more information or end the process.
 * This function checks the last message in the state for a function call. If a tool call is
 * present, the process continues to retrieve information. Otherwise, it ends the process.
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {string} - A decision to either "continue" the retrieval process or "end" it.
 */
function shouldRetrieve(state) {
    const { messages } = state;
    console.log("---DECIDE TO RETRIEVE---");
    const lastMessage = messages[messages.length - 1];
    if ("tool_calls" in lastMessage && Array.isArray(lastMessage.tool_calls) && lastMessage.tool_calls.length) {
        console.log("---DECISION: RETRIEVE---");
        return "retrieve";
    }
    // If there are no tool calls then we finish.
    return END;
}
/**
 * Determines whether the Agent should continue based on the relevance of retrieved documents.
 * This function checks if the last message in the conversation is of type FunctionMessage, indicating
 * that document retrieval has been performed. It then evaluates the relevance of these documents to the user's
 * initial question using a predefined model and output parser. If the documents are relevant, the conversation
 * is considered complete. Otherwise, the retrieval process is continued.
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {Promise<Partial<typeof GraphState.State>>} - The updated state with the new message added to the list of messages.
 */
async function gradeDocuments(state) {
    var _a, _b;
    console.log("---GET RELEVANCE---");
    const { messages } = state;
    const tool = {
        name: "give_relevance_score",
        description: "Give a relevance score to the retrieved documents.",
        schema: z.object({
            binaryScore: z.enum(['yes', 'no']).describe("Answer 'yes' if relevant, 'no' otherwise"),
        })
    };
    // Slight prompt tweak to encourage tool usage
    const prompt = ChatPromptTemplate.fromTemplate(`
You are a tool-using grader assessing relevance of retrieved documents to a user's question.

You MUST return your answer by calling the tool "give_relevance_score" with the appropriate 'yes' or 'no' binaryScore value.

Here are the retrieved docs:
\n ------- \n
{context}
\n ------- \n

Here is the user question: {question}

Call the "give_relevance_score" tool with:
- 'yes' if the docs are relevant to the question.
- 'no' if the docs are not relevant.
`);
    //   const model = llm.bindTools([tool], {
    //     tool_choice: tool.name,
    //   });
    const model = llm.bindTools([tool]);
    const chain = prompt.pipe(model);
    const lastMessage = messages[messages.length - 1];
    const score = await chain.invoke({
        question: messages[0].content,
        context: lastMessage.content,
    });
    // console.log("score output at grade documet================================================",score.usage_metadata?.input_tokens)
    return {
        messages: [score],
        inputToken: (_a = score.usage_metadata) === null || _a === void 0 ? void 0 : _a.input_tokens,
        outputToken: (_b = score.usage_metadata) === null || _b === void 0 ? void 0 : _b.output_tokens
    };
}
/**
 * Check the relevance of the previous LLM tool call.
 *
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {string} - A directive to either "yes" or "no" based on the relevance of the documents.
 */
function checkRelevance(state) {
    console.log("---CHECK RELEVANCE---");
    const { messages } = state;
    const lastMessage = messages[messages.length - 1];
    if (!("tool_calls" in lastMessage)) {
        throw new Error("The 'checkRelevance' node requires the most recent message to contain tool calls.");
    }
    const toolCalls = lastMessage.tool_calls;
    if (!toolCalls || !toolCalls.length) {
        throw new Error("Last message was not a function message");
    }
    if (toolCalls[0].args.binaryScore === "yes") {
        console.log("---DECISION: DOCS RELEVANT---");
        return "yes";
    }
    console.log("---DECISION: DOCS NOT RELEVANT---");
    return "no";
}
// Nodes
/**
 * Invokes the agent model to generate a response based on the current state.
 * This function calls the agent model to generate a response to the current conversation state.
 * The response is added to the state's messages.
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {Promise<Partial<typeof GraphState.State>>} - The updated state with the new message added to the list of messages.
 */
async function agent(state) {
    console.log("---CALL AGENT---");
    const { messages } = state;
    // Find the AIMessage which contains the `give_relevance_score` tool call,
    // and remove it if it exists. This is because the agent does not need to know
    // the relevance score.
    const filteredMessages = messages.filter((message) => {
        if ("tool_calls" in message && Array.isArray(message.tool_calls) && message.tool_calls.length > 0) {
            return message.tool_calls[0].name !== "give_relevance_score";
        }
        return true;
    });
    const model = llm.bindTools(tools);
    const response = await model.invoke(filteredMessages);
    return {
        messages: [response],
    };
}
/**
 * Transform the query to produce a better question.
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {Promise<Partial<typeof GraphState.State>>} - The updated state with the new message added to the list of messages.
 */
async function rewrite(state) {
    var _a, _b;
    console.log("---TRANSFORM QUERY---");
    const { messages } = state;
    const question = messages[0].content;
    const prompt = ChatPromptTemplate.fromTemplate(`Look at the input and try to reason about the underlying semantic intent / meaning. \n 
Here is the initial question:
\n ------- \n
{question} 
\n ------- \n
Formulate an improved question:`);
    // Grader
    const model = llm;
    const response = await prompt.pipe(model).invoke({ question });
    //   console.log("response output at rewrite================================================",response.usage_metadata?.input_tokens)
    return {
        messages: [response],
        inputToken: (_a = response.usage_metadata) === null || _a === void 0 ? void 0 : _a.input_tokens,
        outputToken: (_b = response.usage_metadata) === null || _b === void 0 ? void 0 : _b.output_tokens
    };
}
/**
 * Generate answer
 * @param {typeof GraphState.State} state - The current state of the agent, including all messages.
 * @returns {Promise<Partial<typeof GraphState.State>>} - The updated state with the new message added to the list of messages.
 */
async function generate(state) {
    var _a, _b;
    console.log("---GENERATE---");
    const { messages } = state;
    const question = messages[0].content;
    // Extract the most recent ToolMessage
    const lastToolMessage = messages.slice().reverse().find((msg) => msg._getType() === "tool");
    if (!lastToolMessage) {
        throw new Error("No tool message found in the conversation history");
    }
    const docs = lastToolMessage.content;
    const prompt = await pull("rlm/rag-prompt");
    //   const llm = new ChatOpenAI({
    //     model: "gpt-4o",
    //     temperature: 0,
    //     streaming: true,
    //   });
    const ragChain = prompt.pipe(llm);
    const response = await ragChain.invoke({
        context: docs,
        question,
    });
    // console.log("RESPONSE output at genarate================================================",response.usage_metadata?.input_tokens)
    return {
        messages: [response],
        inputToken: (_a = response.usage_metadata) === null || _a === void 0 ? void 0 : _a.input_tokens,
        outputToken: (_b = response.usage_metadata) === null || _b === void 0 ? void 0 : _b.output_tokens
    };
}
// Define the graph
const workflow = new StateGraph(GraphState)
    // Define the nodes which we'll cycle between.
    .addNode("agent", agent)
    .addNode("retrieve", toolNode)
    .addNode("gradeDocuments", gradeDocuments)
    .addNode("rewrite", rewrite)
    .addNode("generate", generate);
// Call agent node to decide to retrieve or not
workflow.addEdge(START, "agent");
// Decide whether to retrieve
workflow.addConditionalEdges("agent", 
// Assess agent decision
shouldRetrieve);
workflow.addEdge("retrieve", "gradeDocuments");
// Edges taken after the `action` node is called.
workflow.addConditionalEdges("gradeDocuments", 
// Assess agent decision
checkRelevance, {
    // Call tool node
    yes: "generate",
    no: "rewrite", // placeholder
});
workflow.addEdge("generate", END);
workflow.addEdge("rewrite", "agent");
// Compile
const app = workflow.compile();
const inputs = {
    messages: [
        new HumanMessage("facing problem with barcode scanner, i thing it might some techincal glitch." +
            " give me one word answer who was the assignmentGroup if problem is seen earlier." +
            "if your are not sure about that or score is below 65% just say that i dont know about this problem"),
    ],
};
let finalState;
try {
    for (var _d = true, _e = __asyncValues(await app.stream(inputs)), _f; _f = await _e.next(), _a = _f.done, !_a; _d = true) {
        _c = _f.value;
        _d = false;
        const output = _c;
        for (const [key, value] of Object.entries(output)) {
            const lastMsg = output[key].messages[output[key].messages.length - 1];
            console.log(`Output from node: '${key}'`);
            console.dir({
                type: lastMsg._getType(),
                content: lastMsg.content,
                tool_calls: lastMsg.tool_calls,
            }, { depth: null });
            console.log("---\n");
            finalState = value;
        }
    }
}
catch (e_1_1) { e_1 = { error: e_1_1 }; }
finally {
    try {
        if (!_d && !_a && (_b = _e.return)) await _b.call(_e);
    }
    finally { if (e_1) throw e_1.error; }
}
console.log(JSON.stringify(finalState, null, 2));
