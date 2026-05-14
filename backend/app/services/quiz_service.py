from app.services.groq_service import GroqService
from typing import List, Dict

class QuizService:
    def __init__(self, groq_service: GroqService):
        self.groq = groq_service

    async def generate_quiz(self, context: str, num_questions: int = 5, difficulty: str = "Intermediate") -> List[Dict]:
        messages = [
            {
                "role": "system", 
                "content": f"""You are an expert educator. Generate a multiple-choice quiz based on the provided context.
                The difficulty level should be: {difficulty}.
                Respond strictly in JSON format with a key 'questions' containing a list of objects.
                Each object must have: 'id' (int), 'question' (str), 'options' (list of 4 strings), 'correct' (int index 0-3), and 'explanation' (str).
                Keep the tone academic but engaging."""
            },
            {
                "role": "user", 
                "content": f"Context: {context}\n\nGenerate {num_questions} {difficulty}-level questions."
            }
        ]
        
        response = await self.groq.get_json_response(messages)
        return response.get("questions", [])