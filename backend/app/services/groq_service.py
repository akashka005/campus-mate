import os
from groq import Groq
from app.core.config import settings
import json

class GroqService:
    def __init__(self):
        import httpx
        self.client = Groq(
            api_key=settings.GROQ_API_KEY,
            http_client=httpx.Client(verify=False)
        )
        self.default_model = "llama-3.3-70b-versatile"

    async def get_chat_response(self, messages, model=None):
        if not model:
            model = self.default_model
            
        try:
            completion = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.7,
                max_tokens=2048,
                top_p=1,
                stream=False,
                stop=None,
            )
            return completion.choices[0].message.content
        except Exception as e:
            error_msg = str(e)
            print(f"Error calling Groq: {error_msg}")
            if "Sophos" in error_msg or "Stop! This website is blocked" in error_msg or "<!DOCTYPE html>" in error_msg:
                raise Exception("Network Firewall Block: Your network (Sophos) is blocking access to Groq AI. Please use a VPN or mobile hotspot to bypass this block.")
                
            raise e

    async def get_json_response(self, messages, model=None):
        if not model:
            model = self.default_model
            
        try:
            completion = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.2,
                max_tokens=4096,
                top_p=1,
                response_format={"type": "json_object"},
                stream=False,
                stop=None,
            )
            return json.loads(completion.choices[0].message.content)
        except Exception as e:
            print(f"Error calling Groq for JSON: {e}")
            raise e

    async def summarize_text(self, text, model=None):
        messages = [
            {"role": "system", "content": "You are an expert academic summarizer. Provide a concise, bulleted summary of the provided text."},
            {"role": "user", "content": f"Summarize the following:\n\n{text}"}
        ]
        return await self.get_chat_response(messages, model)