# Gemini File Search API - RAG Implementation

A Node.js application that implements Retrieval Augmented Generation (RAG) using Google's Gemini AI File Search API. This project enables you to upload documents, index them, and ask questions based on the content with AI-powered responses and citations.

## 🚀 Features

### Core Features
- **File Search Store Management**: Automatically creates and manages file search stores using Google Gemini API
- **Document Indexing**: Uploads and indexes documents for semantic search
- **RAG (Retrieval Augmented Generation)**: Combines document retrieval with AI generation for accurate, context-aware responses
- **Smart Caching**: Caches file search store names to skip re-indexing on subsequent runs
- **Citation Support**: Provides grounding metadata and citations for all answers
- **Question Answering**: Ask multiple questions and get AI-powered answers based on your indexed documents

### Technical Features
- **Persistent Cache**: File-based caching system that persists between runs
- **Operation Monitoring**: Real-time progress tracking for indexing operations
- **Error Handling**: Comprehensive error handling with detailed stack traces
- **Environment Configuration**: Secure API key management using `.env` files

## 📋 Prerequisites

- **Node.js**: Version 14.x or higher
- **npm**: Version 6.x or higher
- **Google Gemini API Key**: Get your API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

## 🔧 Installation

1. **Clone or download this repository**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Prepare your document**:
   - Place your document file as `sample.txt` in the root directory
   - Or modify the `sampleFilePath` in `index.js` to point to your file

## 📖 Usage

### Basic Usage

Run the application:
```bash
node index.js
```

The application will:
1. Check for a cached file search store
2. If not found, create a new store and index your document
3. Ask predefined questions based on your document
4. Display answers with citations

### First Run

On the first run, you'll see:
```
🚀 Starting Gemini File Search RAG implementation...

📦 Creating file search store...
✅ File search store created: [store-name]

📤 Uploading sample.txt to file search store...
⏳ Waiting for file indexing to complete...
✅ File indexed successfully!

🤖 Asking questions using gemini-2.5-flash model:
...
```

### Subsequent Runs

On subsequent runs, the cached store will be used:
```
🚀 Starting Gemini File Search RAG implementation...

✅ Using cached file search store
📦 Store: [cached-store-name]

🤖 Asking questions using gemini-2.5-flash model:
...
```

## 🏗️ Architecture

### How It Works

1. **File Search Store Creation**
   - Creates a file search store using Google Gemini API
   - Stores the store name in `.file-search-cache.json` for future use

2. **Document Indexing**
   - Uploads your document (`sample.txt`) to the file search store
   - Waits for indexing to complete (this may take a few minutes)
   - The indexed document is stored in Google's infrastructure

3. **Question Answering**
   - Uses the `gemini-2.5-flash` model for fast responses
   - Enables file search tool to retrieve relevant content from your indexed document
   - Generates answers based on the retrieved context
   - Provides citations showing which parts of the document were used

### File Structure

```
gemini-file-search-api-rag/
├── index.js                 # Main application file
├── sample.txt              # Your knowledge base document
├── .env                    # Environment variables (not in git)
├── .file-search-cache.json # Cache file (auto-generated, not in git)
├── package.json            # Dependencies
└── README.md              # This file
```

## 🔑 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GEMINI_API_KEY` | Your Google Gemini API key | Yes |

### Customization Options

You can modify these constants in `index.js`:

```javascript
const STORE_DISPLAY_NAME = 'ai-knowledge-base-store';  // Display name for the store
const FILE_DISPLAY_NAME = 'ai-knowledge-base';         // Display name for the file
```

### Changing the Document

To use a different document:

1. Update the file path in `getOrCreateFileSearchStore()`:
   ```javascript
   const sampleFilePath = path.join(__dirname, 'your-file.txt');
   ```

2. Delete `.file-search-cache.json` to force re-indexing with the new file

### Customizing Questions

Modify the `questions` array in the `run()` function:

```javascript
const questions = [
    "Your question here?",
    "Another question?",
    // Add more questions...
];
```

## 📚 API Reference

### Functions

#### `getCachedStoreName()`
Retrieves the cached file search store name from the cache file.

**Returns**: `string | null` - The cached store name or null if not found

#### `saveCachedStoreName(storeName)`
Saves the file search store name to the cache file.

**Parameters**:
- `storeName` (string): The file search store name to cache

#### `waitForOperation(operation)`
Waits for an asynchronous operation to complete.

**Parameters**:
- `operation` (object): The operation object from the API

**Returns**: `Promise<object>` - The completed operation

#### `getOrCreateFileSearchStore()`
Gets an existing file search store from cache or creates a new one and indexes the document.

**Returns**: `Promise<string>` - The file search store name

#### `run()`
Main function that orchestrates the entire RAG workflow.

## 🎯 Use Cases

- **Document Q&A**: Ask questions about technical documentation, research papers, or any text document
- **Knowledge Base**: Create a searchable knowledge base from your documents
- **Research Assistant**: Quickly find information from large documents
- **Educational Tool**: Help students understand complex documents through Q&A
- **Content Analysis**: Analyze and extract insights from documents

## 🔍 Example Output

```
❓ Question: What are the three main types of machine learning?

💡 Answer:
The three main types of machine learning are:

1. Supervised Learning: Uses labeled training data to learn a mapping from inputs to outputs...
2. Unsupervised Learning: Finds patterns in data without labeled examples...
3. Reinforcement Learning: An agent learns to make decisions by interacting with an environment...

📚 Citations available in groundingMetadata
   Found 3 relevant chunk(s)
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. API Key Error
**Error**: `API key not found` or authentication errors

**Solution**:
- Ensure `.env` file exists in the root directory
- Verify `GEMINI_API_KEY` is set correctly
- Check that there are no extra spaces or quotes in the API key

#### 2. File Not Found
**Error**: `Sample file not found at [path]`

**Solution**:
- Ensure `sample.txt` exists in the root directory
- Or update the file path in `getOrCreateFileSearchStore()`

#### 3. Indexing Takes Too Long
**Issue**: Indexing operation seems to hang

**Solution**:
- This is normal for large files; indexing can take several minutes
- The script shows progress dots (`.`) while waiting
- Check your internet connection

#### 4. Cache File Issues
**Error**: `Cache file corrupted`

**Solution**:
- Delete `.file-search-cache.json` and run again
- The application will automatically create a new cache file

#### 5. Store Not Found
**Error**: Store name in cache but store doesn't exist

**Solution**:
- Delete `.file-search-cache.json` to force recreation
- The store may have been deleted from Google's servers

## 🔒 Security

- **Never commit** `.env` file to version control
- **Never commit** `.file-search-cache.json` (already in `.gitignore`)
- Keep your API key secure and rotate it if compromised
- Review Google's API usage limits and pricing

## 📦 Dependencies

- **@google/genai** (^1.38.0): Google Gemini AI SDK
- **dotenv** (^17.2.3): Environment variable management

## 🗑️ Cleanup

To reset everything and start fresh:

1. Delete `.file-search-cache.json`
2. The next run will create a new store and re-index your document

**Note**: Old stores in Google's system will remain but won't be used. You may want to manually delete them from Google AI Studio if needed.

## 🚧 Limitations

- **File Size**: Large files may take significant time to index
- **API Limits**: Subject to Google Gemini API rate limits and quotas
- **Cache Persistence**: Cache is file-based and local to your machine
- **Single File**: Currently supports one file at a time (can be extended)

## 🔮 Future Enhancements

Potential improvements:
- Support for multiple files
- File change detection to auto-reindex
- Interactive CLI for asking custom questions
- Web interface for Q&A
- Support for different file formats (PDF, DOCX, etc.)
- Batch question processing from file
- Export answers to file

## 📝 License

ISC

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues related to:
- **Google Gemini API**: Check [Google AI Studio Documentation](https://ai.google.dev/docs)
- **This Project**: Open an issue in the repository

## 🙏 Acknowledgments

- Built with [Google Gemini AI](https://ai.google.dev/)
- Uses the File Search API for RAG implementation

---

**Happy Question Answering! 🎉**
