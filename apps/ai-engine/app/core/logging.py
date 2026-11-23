import logging
import json
import sys
from datetime import datetime, timezone
from typing import Any, Dict


class JSONFormatter(logging.Formatter):
    """
    Structured JSON log formatter for LegalLens AI Engine.
    """
    def format(self, record: logging.LogRecord) -> str:
        log_obj: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "service": "ai-engine",
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
        }
        
        # Include correlation or extra metadata if present
        if hasattr(record, "correlation_id"):
            log_obj["correlationId"] = record.correlation_id
        if record.exc_info:
            log_obj["exception"] = self.formatException(record.exc_info)
            
        return json.dumps(log_obj)


def setup_logger(name: str = "legallens_ai") -> logging.Logger:
    logger = logging.getLogger(name)
    logger.setLevel(logging.INFO)
    
    if not logger.handlers:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(JSONFormatter())
        logger.addHandler(handler)
        
    return logger


logger = setup_logger()
