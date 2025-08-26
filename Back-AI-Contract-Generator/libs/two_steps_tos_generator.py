import os
import logging
import asyncio
import json
from pydantic import BaseModel

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage

logger = logging.getLogger(__name__)
logger.setLevel(os.getenv("LOG_LEVEL", "DEBUG"))


GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is not set.")

class Prompt(BaseModel):
    prompt: str

class TermsOfServiceGenerator:
    def __init__(self, prompt: Prompt):
        self.user_prompt = prompt.prompt
        
        
        # LLM for generating titles - can be a faster model
        self.title_llm = ChatGoogleGenerativeAI(
            model="gemini-2.0-flash", # Use a faster model for titles
            google_api_key=GEMINI_API_KEY,
            temperature=0.0
        )
        # LLM for generating content - use a more powerful model
        self.content_llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=GEMINI_API_KEY,
            temperature=0.2
        )

    async def _get_section_titles(self) -> list[str]:
        """Makes a quick, lightweight call to get the document's section titles."""
        logger.info("Generating section titles...")
        prompt = f"""
            Based on the business description: '{self.user_prompt}', generate a list of 10-12 relevant section titles for a Terms of Service document.
            Return this as a simple comma-separated text list and nothing else.
            Example: Introduction, User Accounts, Intellectual Property, Termination
        """
        messages = [HumanMessage(content=prompt)]
        response = await self.title_llm.ainvoke(messages)
        titles = [title.strip() for title in response.content.split(',') if title.strip()]
        logger.info(f"Generated titles: {titles}")
        return titles

    async def _generate_section_content_stream(self, title: str, all_titles: list[str], section_index: int):
        """Generates and streams the content for a single section."""
        logger.info(f"Starting content generation for section: {title}")
        prompt = f"""
            You are writing one part of a larger Terms of Service document for the business: '{self.user_prompt}'.
            The complete document structure is: {all_titles}.

            Your task is to write **only the content** for the section titled: **'{title}'**.

            Ensure your writing is contextually aware of the other sections.
            The output must be well-structured HTML using <p>, <h3>, etc. Do not repeat the section title in your response.
        """
        messages = [HumanMessage(content=prompt)]
        
        async for chunk in self.content_llm.astream(messages):
            # Stream the content as a JSON object with the section identifier
            yield json.dumps({
                "id": f"section-{section_index}",
                "content": chunk.content
            }) + "\n" # Newline delimiter for the stream

    async def generate_text_stream_two_steps(self):
        """Orchestrates the two-step streaming process."""
        # Step 1: Get titles
        try:
            titles = await self._get_section_titles()
        except Exception as e:
            logger.error(f"Failed to generate titles: {e}")
            yield json.dumps({"error": "Failed to generate document structure."}) + "\n"
            return
            
        # Immediately yield the skeleton structure
        skeleton = [{"id": f"section-{i+1}", "title": title, "content": ""} for i, title in enumerate(titles)]
        yield json.dumps({"skeleton": skeleton}) + "\n"

        # Step 2: Concurrently generate and stream content for all sections
        content_generation_tasks = [
            self._generate_section_content_stream(title, titles, i + 1)
            for i, title in enumerate(titles)
        ]

        # Use a queue to yield results as they complete, not in a fixed order
        q = asyncio.Queue()

        async def producer(stream, queue:asyncio.Queue):
            async for item in stream:
                await queue.put(item)

        async def consume(queue:asyncio.Queue):
            while not (all(task.done() for task in producer_tasks) and queue.empty()):
                try:
                    item = await asyncio.wait_for(queue.get(), timeout=1)
                    yield item
                    queue.task_done()
                except asyncio.TimeoutError:
                    continue

        producer_tasks = [asyncio.create_task(producer(stream, q)) for stream in content_generation_tasks]
        
        async for content_chunk in consume(q):
             yield content_chunk

        logger.info("Finished streaming all sections.")