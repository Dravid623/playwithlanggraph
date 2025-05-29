import { readFile } from "fs/promises";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { Document } from "@langchain/core/documents";
import { OllamaEmbeddings } from "@langchain/ollama";

const embeddings = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

async function buildRetriever() {
  const raw = await readFile("src/data/data.json", "utf-8");
  const incidents = JSON.parse(raw);

  // Compose structured Document objects
  const documents: Document[] = incidents.map((incident:any, i:any) => {
    const content = `
      Short Description: ${incident.shortDescription}
      Resolution Notes: ${incident.resolutionNotes}
      Work Notes: ${incident.workNotes || ""}
    `.trim();

    return new Document({
      pageContent: content,
      metadata: {
        number: incident.number,
        state: incident.state,
        priority: incident.priority,
        assignmentGroup: incident.assignmentGroup,
        assignedTo: incident.assignedTo,
        openedBy: incident.openedBy,
        resolvedBy: incident.resolvedBy,
        updatedBy: incident.updatedBy,
        majorIncident: incident.majorIncident,
        problem: incident.problem,
        affectedUser: incident.affectedUser,
        category: incident.category,
        service: incident.service,
        serviceOffering: incident.serviceOffering,
        subCategory: incident.subCategory,
        vendor: incident.vendor,
        index: i
      }
    });
  });

  // Split into chunks (if needed)
//   const textSplitter = new RecursiveCharacterTextSplitter({
//     chunkSize: 500,
//     chunkOverlap: 50,
//   });

//   const docSplits = await textSplitter.splitDocuments(documents);

// console.log("DOCUMENTS=================================================================================",documents)

  // Build vector DB
  const vectorStore = await MemoryVectorStore.fromDocuments(
    // docSplits,
    documents, // no splitting
    embeddings
  );

  const retriever = vectorStore.asRetriever();
  return {retriever, vectorStore};
}

const {retriever, vectorStore} = await buildRetriever();
export {retriever, vectorStore};


// import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
// import { JSONLoader } from "langchain/document_loaders/fs/json";
// import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
// import { MemoryVectorStore } from "langchain/vectorstores/memory";

// import { OllamaEmbeddings } from "@langchain/ollama";
// // ollamaEmbedding
// const embeddings = new OllamaEmbeddings({
//     model: "nomic-embed-text", // Default value
//     baseUrl: "http://localhost:11434", // Default value
//   });

// // export default embeddings;

// // const loader = new DirectoryLoader("./data.json", {
// //     ".json": (path) => new JSONLoader(path, "/texts"),
// // });
// // const docs = await loader.load();
// // console.log({ docs });
// const loader2 = new JSONLoader("src/data/data.json")
// const docs2 =await loader2.load();
// const docsList = docs2.flat();
// const textSplitter = new RecursiveCharacterTextSplitter({
//   chunkSize: 500,
//   chunkOverlap: 50,
// });
// const docSplits = await textSplitter.splitDocuments(docsList);
// // Add to vectorDB
// const vectorStore = await MemoryVectorStore.fromDocuments(
//   docSplits,
//   embeddings,
// );

// const retriever = vectorStore.asRetriever();
// export default retriever;

// console.log({vectorStore}) 
