from typing import Dict, Tuple
from .base import BaseLLMClient, TaskType
from .mock import MockLLMClient
from .gemini import GoogleGenAIClient
from ..core.config import settings
from ..core.logging import logger


class ModelRouter:
    """
    Task-Specific Model Router.
    Routes cognitive tasks (EXTRACTION, RESEARCH, VERIFICATION, REASONING) to configured
    models and provider adapters dynamically based on environment variables.
    """

    def __init__(self):
        self._clients: Dict[str, BaseLLMClient] = {}
        self._init_clients()

    def _init_clients(self):
        # Always register mock client for offline tests
        self._clients["mock"] = MockLLMClient()

        # Register Google GenAI client
        if settings.GEMINI_API_KEY:
            self._clients["google"] = GoogleGenAIClient(
                api_key=settings.GEMINI_API_KEY,
                default_model=settings.LLM_MODEL_EXTRACTION,
            )
        else:
            logger.info("No GEMINI_API_KEY detected. Mock client will serve as fallback.")

    def get_client(self, provider: str = None) -> BaseLLMClient:
        active_provider = provider or settings.DEFAULT_LLM_PROVIDER
        if active_provider in self._clients:
            return self._clients[active_provider]
        
        # Fallback to mock client
        logger.warn(f"Provider '{active_provider}' not configured. Falling back to MockLLMClient.")
        return self._clients["mock"]

    def get_model_for_task(self, task: TaskType) -> str:
        """Retrieve the configured model name for a specific cognitive task."""
        if task == TaskType.EXTRACTION:
            return settings.LLM_MODEL_EXTRACTION
        elif task == TaskType.RESEARCH:
            return settings.LLM_MODEL_RESEARCH
        elif task == TaskType.VERIFICATION:
            return settings.LLM_MODEL_VERIFICATION
        elif task == TaskType.REASONING:
            return settings.LLM_MODEL_REASONING
        return settings.LLM_MODEL_REASONING

    def route(self, task: TaskType) -> Tuple[BaseLLMClient, str]:
        """Convenience method returning both client and target model identifier."""
        client = self.get_client()
        model = self.get_model_for_task(task)
        return client, model


# Global router singleton
router = ModelRouter()
