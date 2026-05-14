import os
from dotenv import load_dotenv
load_dotenv()
from app.core.security import create_access_token
import httpx
import asyncio

async def test():
    token = create_access_token('1')
    print(f"Testing with Token: {token}")
    async with httpx.AsyncClient() as client:
        r = await client.get('http://localhost:8000/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
        print(f"Status: {r.status_code}")
        print(f"Response: {r.text}")

asyncio.run(test())