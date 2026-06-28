from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from groq import Groq
import fitz
import os
from typing import List
import tempfile

app = FastAPI(title="Read Documents AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

document_context = ""
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class QuestionRequest(BaseModel):
    question: str

@app.get("/")
def root():
    return {"message": "Backend Running"}

@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    global document_context
    
    uploaded_filenames = []
    
    for file in files:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail=f"File {file.filename} is not a PDF")
        
        content = await file.read()
        
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            doc = fitz.open(temp_file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            doc.close()
            
            document_context += f"\n\n--- Document: {file.filename} ---\n{text}"
            uploaded_filenames.append(file.filename)
            
        finally:
            os.unlink(temp_file_path)
    
    return {"filenames": uploaded_filenames}

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    global document_context
    
    if not document_context.strip():
        return {"answer": "No documents have been uploaded yet. Please upload PDF files first."}
    
    prompt = f"""You are an AI research assistant.
Answer ONLY using the provided document context.
If the answer is unavailable, respond: 'I couldn't find that information in the uploaded documents.'

Document Context:
{document_context}

Question:
{request.question}

Answer:"""
    
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=1024,
        )
        
        answer = response.choices[0].message.content
        return {"answer": answer}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing question: {str(e)}")

@app.post("/clear")
def clear_documents():
    global document_context
    document_context = ""
    return {"message": "Documents cleared successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
