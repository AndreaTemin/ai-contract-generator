from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

import logging


import llm_request_call_2

logger = logging.getLogger(__name__)
logger.setLevel("DEBUG")


app = FastAPI()

# not used
origins = [
    "http://localhost.tiangolo.com",
    "https://localhost.tiangolo.com",
    "http://localhost",
    "http://localhost:8080",
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], #origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
    
    
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": 0.1
        }


@app.post("/stream_text")
async def stream_text(prompt: llm_request_call_2.Prompt):
    # https://github.com/awslabs/aws-lambda-web-adapter/blob/main/examples/fastapi-response-streaming/app/main.py
    
    # TODO: validate prompt somehow
    logger.debug("/stream_text has started")
    tos = llm_request_call_2.TermsOfService(prompt)
    
    return StreamingResponse(
        tos.generate_text_stream(), 
        media_type="text/html"
    )
    
    
