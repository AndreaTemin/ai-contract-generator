import requests
import os

API_KEY = os.getenv("GEMINI_API_KEY")  # replace with your API key
URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

def generate_content(prompt: str) -> dict:
    headers = {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY,
    }
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    resp = requests.post(URL, headers=headers, json=payload, timeout=30)
    resp.raise_for_status()
    return resp.json()

if __name__ == "__main__":
    out = generate_content("Tell me why Andrea is a great name")
    print(out)
