import fitz
import os

class PDFService:
    def extract_text(self, file_path):
        try:
            doc = fitz.open(file_path)
            text = ""
            for page in doc:
                text += page.get_text()
            return text
        except Exception as e:
            print(f"Error extracting text from PDF: {e}")
            return None

    def extract_metadata(self, file_path):
        try:
            doc = fitz.open(file_path)
            return doc.metadata
        except Exception as e:
            print(f"Error extracting metadata: {e}")
            return {}