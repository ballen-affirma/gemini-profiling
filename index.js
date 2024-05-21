const { VertexAI } = require('@google-cloud/vertexai')
const fs = require("fs")
const arrayShuffle = require('array-shuffle');

const projectId = 'alorica-iq-labs';
const regionId = 'us-central1';
const model = 'gemini-1.5-flash-preview-0514';
const vertexai = new VertexAI({project: projectId, location: regionId});
const gemini = vertexai.getGenerativeModel({model});

var corpus = []

async function testGemini() {
    for (let i = 50; i < 100; i += 5) {
        console.log(`========= ${i} documents =========`)
        for (let j = 0; j < 5; j++) {
            await timeGeminiPromptText(i);
            console.log("----------------")
        }
    }
}

async function getGeminiResponseStream(promptObj) {
    const streamResult = await gemini.generateContentStream(promptObj);
    return streamResult;
}

async function countTokens(text) {
    return await gemini.countTokens(text)
}


async function timeGeminiPromptText(num_docs) {
    arrayShuffle(corpus)   
    var documents = new Map();

    let matches = 0;
    corpus.forEach((d) => {
        if (matches == num_docs) {
            return;
        }
        documents.set(d.path, d);
        matches += 1;
    })

    const base = "Please tell me what these documents are about."
    let docs = ""
    corpus.slice(0, num_docs).forEach((entry) => {
        docs += "\n";
        docs += "TITLE: " + entry.title + "\n";
        docs += "BEGIN TEXT\n";
        docs += entry.text; 
        docs += "END TEXT\n"
    })

    const prompt = `${base}
    ${docs}`
    
    const promptObj = {
        contents: [
            {
                role: 'user',
                parts: [{text: prompt}]
            }
        ]
    }

    const numTokens = await countTokens(promptObj)

    const openingStreamTimestamp = Date.now();
    const stream = await getGeminiResponseStream(promptObj);

    let firstChunk = true;
    let firstChunkTimestamp = 0;
    try {
        for await (const chunk of stream.stream) {
            if (firstChunk) {
                firstChunk = false;
                firstChunkTimestamp = Date.now();
            }
            // const text = chunk.candidates[0]?.content?.parts[0]?.text || "";
        }
    } catch (err) {
        console.error(err);
    }
    const streamCompleteTimestamp = Date.now();

    console.log(`Token count         ${numTokens.totalTokens}`)
    console.log(`Opening stream at   ${openingStreamTimestamp}`)
    console.log(`First chunk at      ${firstChunkTimestamp}`)
    console.log(`Last chunk at       ${streamCompleteTimestamp}`)
    console.log(`First chunk Latency ${firstChunkTimestamp - openingStreamTimestamp}`)
}

async function loadCorpus() {
    const text = fs.readFileSync("vector-search-feb12_alorica.com_corpus.jsonl", "utf-8");
    const lines = text.split("\n").slice(0, -1);
    lines.forEach((line) => {
        const entry = JSON.parse(line);
        corpus.push(entry)
    })
    console.log("Loaded " + corpus.size + " documents");
}

loadCorpus().then(() => {
    testGemini()
})