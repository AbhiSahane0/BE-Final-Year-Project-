import os
import faiss
import numpy as np
import google.generativeai as genai
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# ✅ Load Gemini API Key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyCoZDwqGbCxFB-YY5L426MdaabNOXFbE0w")
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY is not set!")

genai.configure(api_key="AIzaSyCoZDwqGbCxFB-YY5L426MdaabNOXFbE0w")

app = FastAPI()

# ✅ Enable CORS for frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to the documentation file
DOC_PATH = r"D:\final-year-project\frontend\src\components\BlockShare_Documentation.md"

def load_markdown_document():
    """Reads the Markdown file containing BlockShare documentation."""
    if not os.path.exists(DOC_PATH):
        raise FileNotFoundError(f"❌ Documentation file not found at {DOC_PATH}")
    
    with open(DOC_PATH, "r", encoding="utf-8") as file:
        return file.read()

def get_gemini_embedding(text):
    """Generates embeddings using Google Gemini API."""
    try:
        response = genai.embed_content(
            model="models/embedding-001",
            content=text,
            task_type="retrieval_document"
        )
        return np.array(response["embedding"])
    except Exception as e:
        raise RuntimeError(f"❌ Failed to get embedding: {str(e)}")

def chunk_text(text, chunk_size=300):
    """Splits text into smaller chunks for embedding."""
    sentences = text.split("\n")
    chunks, current_chunk = [], ""

    for sentence in sentences:
        if len(current_chunk) + len(sentence) < chunk_size:
            current_chunk += sentence + " "
        else:
            chunks.append(current_chunk.strip())
            current_chunk = sentence + " "

    if current_chunk:
        chunks.append(current_chunk.strip())

    return chunks

def create_faiss_index():
    """Creates a FAISS index from the documentation text."""
    print("📄 Loading documentation...")
    content = load_markdown_document()
    
    print("✂️ Chunking text...")
    chunks = chunk_text(content)
    
    print("🔄 Generating embeddings...")
    embeddings = [get_gemini_embedding(chunk) for chunk in chunks]
    if not embeddings:
        raise RuntimeError("❌ No embeddings were generated.")

    embeddings = np.array(embeddings)
    
    print("🗄️ Building FAISS index...")
    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    return index, chunks

# ✅ Initialize FAISS index
try:
    faiss_index, text_chunks = create_faiss_index()
    print("✅ FAISS index created successfully!")
except Exception as e:
    print(f"❌ Error initializing FAISS: {str(e)}")
    faiss_index, text_chunks = None, None

def search_faiss(query, top_k=3):
    """Searches for the most relevant chunks using FAISS."""
    if faiss_index is None:
        raise RuntimeError("❌ FAISS index is not initialized.")
    
    query_embedding = get_gemini_embedding(query).reshape(1, -1)
    _, closest_idx = faiss_index.search(query_embedding, k=min(top_k, len(text_chunks)))

    retrieved_text = " ".join([text_chunks[i] for i in closest_idx[0]])  # Combine retrieved chunks
    return retrieved_text

# ✅ Pydantic model for request validation
class ChatRequest(BaseModel):
    query: str

@app.post("/chatbot")
async def chatbot_query(request: ChatRequest):
    print(f"📩 Received query: {request.query}")

    user_query = request.query.strip()
    if not user_query:
        raise HTTPException(status_code=400, detail="❌ Query cannot be empty.")

    try:
        retrieved_text = search_faiss(user_query)

        # ✅ Custom prompt for better responses
        prompt = f"""
        You are an AI assistant named **BlockBot**, trained on the BlockShare documentation.
        Your job is to answer user queries based strictly on the provided documentation.If the answer is not in the document, try your knowledge to answer it.

        
        🔹 **User Question:** {user_query}  
        🔹 **Reference Document:**  
        {retrieved_text}  
        
        Ensure bold text appears as `**bold text**`, lists are formatted properly, and responses are concise.
        Now, generate a well-structured and accurate response in Markdown format.
        """

        # ✅ Use the correct Gemini model
        model = genai.GenerativeModel("gemini-1.5-pro")

        # ✅ Ensure response is formatted in HTML for proper display
        response = model.generate_content(prompt)

        

        return {"answer": response.text}
    
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))



# ✅ Run with: uvicorn rag_chatbot:app --reload
