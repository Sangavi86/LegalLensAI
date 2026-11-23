from typing import Optional
from .base import BaseLLMClient, ModelResponse


class MockLLMClient(BaseLLMClient):
    """
    Mock LLM Client for offline local development and deterministic unit testing.
    Requires no external network or API keys.
    """
    
    def __init__(self, default_model: str = "mock-legal-v1"):
        self.default_model = default_model

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 2048,
    ) -> ModelResponse:
        active_model = model or self.default_model
        simulated_response = f"[MockLLMResponse from {active_model}] Processed legal prompt length: {len(prompt)} chars."
        
        return ModelResponse(
            content=simulated_response,
            model=active_model,
            provider="mock",
            prompt_tokens=len(prompt) // 4,
            completion_tokens=len(simulated_response) // 4,
            raw_response={"status": "mock_success", "model": active_model}
        )

    def get_provider_name(self) -> str:
        return "mock"
