const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const STORE_DISPLAY_NAME = 'ai-knowledge-base-store';
const FILE_DISPLAY_NAME = 'ai-knowledge-base';
const CACHE_FILE = path.join(__dirname, '.file-search-cache.json');

/**
 * Get cached store name from file
 */
function getCachedStoreName() {
    if (fs.existsSync(CACHE_FILE)) {
        try {
            const cacheData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
            return cacheData.fileSearchStoreName || null;
        } catch (error) {
            console.log('⚠️  Cache file corrupted, will create new one');
            return null;
        }
    }
    return null;
}

/**
 * Save store name to cache file
 */
function saveCachedStoreName(storeName) {
    fs.writeFileSync(CACHE_FILE, JSON.stringify({ fileSearchStoreName: storeName }, null, 2));
}

/**
 * Wait for operation to complete
 */
async function waitForOperation(operation) {
    while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.get({ operation });
        process.stdout.write('.');
    }
    return operation;
}

/**
 * Get or create file search store and ensure file is indexed
 * Uses cached store name from file to skip indexing on subsequent runs
 */
async function getOrCreateFileSearchStore() {
    const sampleFilePath = path.join(__dirname, 'sample.txt');

    if (!fs.existsSync(sampleFilePath)) {
        throw new Error(`Sample file not found at ${sampleFilePath}`);
    }

    // Check if we have cached store name
    const cachedStoreName = getCachedStoreName();
    if (cachedStoreName) {
        console.log('✅ Using cached file search store');
        console.log(`📦 Store: ${cachedStoreName}\n`);
        return cachedStoreName;
    }

    // First time - create store and index
    console.log('📦 Creating file search store...');
    const fileSearchStore = await ai.fileSearchStores.create({
        config: { displayName: STORE_DISPLAY_NAME }
    });
    console.log(`✅ File search store created: ${fileSearchStore.name}\n`);

    console.log('📤 Uploading sample.txt to file search store...');
    let operation = await ai.fileSearchStores.uploadToFileSearchStore({
        file: sampleFilePath,
        fileSearchStoreName: fileSearchStore.name,
        config: {
            displayName: FILE_DISPLAY_NAME,
        }
    });

    console.log('⏳ Waiting for file indexing to complete...');
    await waitForOperation(operation);
    console.log('\n✅ File indexed successfully!\n');

    // Cache the store name to file
    saveCachedStoreName(fileSearchStore.name);

    return fileSearchStore.name;
}

async function run() {
    try {
        console.log('🚀 Starting Gemini File Search RAG implementation...\n');

        // Get or create file search store (uses cached store name if available)
        const fileSearchStoreName = await getOrCreateFileSearchStore();

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
                                fileSearchStoreNames: [fileSearchStoreName]
                            }
                        }
                    ]
                }
            });

            console.log(`💡 Answer:\n${response.text}\n`);

            // Display citations if available (as per documentation)
            if (response.candidates?.[0]?.groundingMetadata) {
                console.log('📚 Citations available in groundingMetadata');
                const citations = response.candidates[0].groundingMetadata;
                if (citations.groundingChunks && citations.groundingChunks.length > 0) {
                    console.log(`   Found ${citations.groundingChunks.length} relevant chunk(s)\n`);
                }
            }

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