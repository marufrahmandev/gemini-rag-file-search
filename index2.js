const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function run() {
    try {
        console.log('🚀 Starting Gemini File Search RAG implementation...\n');

        // Step 1: Create a file search store
        console.log('📦 Creating file search store...');
        const fileSearchStore = await ai.fileSearchStores.create({
            config: { displayName: 'ai-knowledge-base-store' }
        });
        console.log(`✅ File search store created: ${fileSearchStore.name}\n`);

        // Step 2: Upload sample.txt to the file search store
        const sampleFilePath = path.join(__dirname, 'sample.txt');

        if (!fs.existsSync(sampleFilePath)) {
            throw new Error(`Sample file not found at ${sampleFilePath}`);
        }

        console.log('📤 Uploading sample.txt to file search store...');
        let operation = await ai.fileSearchStores.uploadToFileSearchStore({
            file: sampleFilePath,
            fileSearchStoreName: fileSearchStore.name,
            config: {
                displayName: 'ai-knowledge-base',
            }
        });

        // Step 3: Wait for the upload and indexing operation to complete
        console.log('⏳ Waiting for file indexing to complete...');
        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 5000));
            operation = await ai.operations.get({ operation });
            process.stdout.write('.');
        }
        console.log('\n✅ File indexed successfully!\n');

        // Step 4: Ask questions based on the sample.txt content
        const questions = [
            "What are the three main types of machine learning?",
            "Explain the difference between CNNs and RNNs.",
            "What are some key ethical considerations in AI development?",
            "What frameworks are commonly used for deep learning?"
        ];

        console.log('🤖 Asking questions using gemini-2.5-flash model:\n');
        console.log('='.repeat(80));

        for (const question of questions) {
            console.log(`\n❓ Question: ${question}\n`);

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: question,
                config: {
                    tools: [
                        {
                            fileSearch: {
                                fileSearchStoreNames: [fileSearchStore.name]
                            }
                        }
                    ]
                }
            });

            console.log(`💡 Answer:\n${response.text}\n`);
            console.log('-'.repeat(80));
        }

        console.log('\n✨ All questions answered successfully!');

    } catch (error) {
        console.error('❌ Error:', error.message);
        if (error.stack) {
            console.error('Stack trace:', error.stack);
        }
        process.exit(1);
    }
}

run();