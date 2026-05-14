from app.services.groq_service import GroqService
from typing import Dict

class ResumeService:
    def __init__(self, groq_service: GroqService):
        self.groq = groq_service

    async def analyze_resume(self, resume_text: str) -> Dict:
        messages = [
            {
                "role": "system", 
                "content": """You are an expert HR recruiter and career coach. Analyze the provided resume text.
                Respond strictly in JSON format with the following keys:
                - 'score' (int 0-100)
                - 'skills' (list of objects with 'subject' (str), 'A' (int score), 'fullMark' (int 150))
                - 'strengths' (list of strings)
                - 'improvements' (list of strings)
                Be critical but constructive."""
            },
            {
                "role": "user", 
                "content": f"Resume Text:\n\n{resume_text}"
            }
        ]
        
        return await self.groq.get_json_response(messages)