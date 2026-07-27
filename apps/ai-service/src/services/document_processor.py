"""
Document Processor Service — Extracts text, detects language, and calculates metrics.
Supports PDF (pdfplumber / pypdf), DOCX (python-docx), and TXT files.
"""
import os
import time
import logging
from typing import Dict, Any, List, Tuple

logger = logging.getLogger("jurismind.ai.processor")


class DocumentProcessor:
    @staticmethod
    def extract_text(file_path: str, mime_type: str, extension: str) -> Dict[str, Any]:
        """
        Main extraction entry point.
        Returns extracted text, metrics, parser diagnostics, and execution duration.
        """
        start_time = time.time()
        warnings: List[str] = []

        if not os.path.exists(file_path):
            raise FileNotFoundError(f"File not found on disk: {file_path}")

        ext = extension.lower().lstrip(".")
        text = ""
        page_count = 1
        parser_used = "unknown"

        if ext == "pdf":
            text, page_count, parser_used, pdf_warnings = DocumentProcessor._parse_pdf(file_path)
            warnings.extend(pdf_warnings)
        elif ext == "docx":
            text, page_count, parser_used, docx_warnings = DocumentProcessor._parse_docx(file_path)
            warnings.extend(docx_warnings)
        elif ext == "txt":
            text, page_count, parser_used, txt_warnings = DocumentProcessor._parse_txt(file_path)
            warnings.extend(txt_warnings)
        else:
            raise ValueError(f"Unsupported file extension: .{ext}")

        text = text.strip()
        word_count = DocumentProcessor.count_words(text)
        character_count = DocumentProcessor.count_characters(text)
        language = DocumentProcessor.detect_language(text)
        processing_time_ms = int((time.time() - start_time) * 1000)

        return {
            "text": text,
            "language": language,
            "pageCount": page_count,
            "wordCount": word_count,
            "characterCount": character_count,
            "parserUsed": parser_used,
            "processingTime": processing_time_ms,
            "warnings": warnings,
        }

    @staticmethod
    def _parse_pdf(file_path: str) -> Tuple[str, int, str, List[str]]:
        text_parts = []
        warnings = []
        page_count = 0
        parser_used = "pdfplumber"

        try:
            import pdfplumber
            with pdfplumber.open(file_path) as pdf:
                page_count = len(pdf.pages)
                for idx, page in enumerate(pdf.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
                    else:
                        warnings.append(f"Page {idx + 1} contained no extractable text.")
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}. Falling back to pypdf...")
            try:
                import pypdf
                reader = pypdf.PdfReader(file_path)
                page_count = len(reader.pages)
                parser_used = "pypdf"
                for idx, page in enumerate(reader.pages):
                    page_text = page.extract_text()
                    if page_text:
                        text_parts.append(page_text)
            except Exception as fallback_err:
                logger.error(f"pypdf fallback also failed: {fallback_err}")
                raise RuntimeError(f"PDF extraction failed: {e}")

        extracted = "\n\n".join(text_parts)
        if not extracted:
            warnings.append("Document extracted 0 characters. It may be scanned or empty.")

        return extracted, max(page_count, 1), parser_used, warnings

    @staticmethod
    def _parse_docx(file_path: str) -> Tuple[str, int, str, List[str]]:
        warnings = []
        try:
            import docx
            doc = docx.Document(file_path)
            paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
            full_text = "\n\n".join(paragraphs)
            # Estimate page count for DOCX (~350 words per page)
            words = len(full_text.split())
            estimated_pages = max(1, (words // 350) + (1 if words % 350 > 0 else 0))
            return full_text, estimated_pages, "python-docx", warnings
        except Exception as e:
            logger.error(f"DOCX extraction error: {e}")
            raise RuntimeError(f"DOCX extraction failed: {e}")

    @staticmethod
    def _parse_txt(file_path: str) -> Tuple[str, int, str, List[str]]:
        warnings = []
        encodings = ["utf-8", "latin-1", "cp1252"]
        content = ""
        for enc in encodings:
            try:
                with open(file_path, "r", encoding=enc) as f:
                    content = f.read()
                break
            except UnicodeDecodeError:
                continue

        if not content:
            warnings.append("Text file empty or unreadable with standard encodings.")

        words = len(content.split())
        estimated_pages = max(1, (words // 350) + (1 if words % 350 > 0 else 0))
        return content, estimated_pages, "txt_reader", warnings

    @staticmethod
    def detect_language(text: str) -> str:
        if not text or len(text.strip()) < 10:
            return "en"
        try:
            from langdetect import detect
            lang = detect(text[:2000])
            return str(lang)
        except Exception:
            return "en"

    @staticmethod
    def count_words(text: str) -> int:
        if not text:
            return 0
        return len(text.split())

    @staticmethod
    def count_characters(text: str) -> int:
        if not text:
            return 0
        return len(text)
