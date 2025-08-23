import time

# Example using FastAPI
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

import llm_request_call_2

# support options requestsfrom fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
    
    
@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/stream_text")
async def stream_text(prompt: llm_request_call_2.Prompt):
    tos = llm_request_call_2.TermsOfService(prompt)
    return StreamingResponse(
        tos.generate_text_stream(), 
        media_type="text/html"
    )