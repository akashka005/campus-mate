from app.services.groq_service import GroqService
from typing import List, Dict

class StudyService:
    def __init__(self, groq_service: GroqService):
        self.groq = groq_service

    async def generate_plan(self, goal: str, timeframe: str = "1 week", background: str = "") -> List[Dict]:
        messages = [
            {
                "role": "system", 
                "content": """You are an expert academic advisor. Create a detailed study plan based on the goal and timeframe.
                Respond strictly in JSON format with a key 'plan' containing a list of objects.
                Each object must have: 'time' (str, e.g., '09:00 AM'), 'title' (str), and 'status' (string, one of 'Upcoming', 'In Progress', 'Done').
                Organize the plan logically for a student."""
            },
            {
                "role": "user", 
                "content": f"Goal: {goal}\nTimeframe: {timeframe}\nBackground Context: {background}"
            }
        ]
        
        response = await self.groq.get_json_response(messages)
        return response.get("plan", [])