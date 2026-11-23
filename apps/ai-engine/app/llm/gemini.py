from typing import Optional
from .base import BaseLLMClient, ModelResponse
from ..core.logging import logger


class GoogleGenAIClient(BaseLLMClient):
    """
    Client adapter for the Google Gemini API (google-genai SDK).
    """

    def __init__(self, api_key: str, default_model: str = "gemini-2.5-flash"):
        self.api_key = api_key
        self.default_model = default_model
        self._client = None

        if self.api_key:
            try:
                from google import genai
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                logger.warn(f"Could not initialize Google GenAI SDK client: {e}")

    async def generate(
        self,
        prompt: str,
        system_instruction: Optional[str] = None,
        model: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 2048,
    ) -> ModelResponse:
        active_model = model or self.default_model

        if not self._client:
            raise ValueError(
                "GoogleGenAIClient is not initialized with a valid GEMINI_API_KEY. "
                "Set GEMINI_API_KEY in .env or switch DEFAULT_LLM_PROVIDER=mock."
            )

        try:
            from google.genai import types
            config = types.GenerateContentConfig(
                temperature=temperature,
                max_output_tokens=max_tokens,
                system_instruction=system_instruction if system_instruction else None,
            )
            response = self._client.models.generate_content(
                model=active_model,
                contents=prompt,
                config=config,
            )

            text_output = response.text or ""
            return ModelResponse(
                content=text_output,
                model=active_model,
                provider="google",
                prompt_tokens=response.usage_metadata.prompt_token_count if response.usage_metadata else 0,
                completion_tokens=response.usage_metadata.candidates_token_count if response.usage_metadata else 0,
                raw_response={"status": "success"},
            )
        except Exception as e:
            logger.error(f"Gemini API generation failed for model {active_model}: {e}")
            raise

    def get_provider_name(self) -> str:
        return "google"
