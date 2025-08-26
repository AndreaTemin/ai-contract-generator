from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from libs.two_steps_tos_generator import TermsOfServiceGenerator, Prompt

import logging

logger = logging.getLogger(__name__)
logger.setLevel("DEBUG")


app = FastAPI()

origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "https://ai-contract-generator-bice.vercel.app",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["POST","OPTIONS","GET"],
    allow_headers=["*"],
)
    
    
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "2.0.0"
        }


@app.post("/api/generate_tos_points")
async def stream_text(prompt: Prompt):
    logger.debug("/stream_text (Two-Step) has started")
    tos = TermsOfServiceGenerator(prompt)
    
    # Use the new two-step generator
    return StreamingResponse(
        tos.generate_text_stream_two_steps(), 
        media_type="application/x-ndjson" # Use newline-delimited JSON
    )
    
