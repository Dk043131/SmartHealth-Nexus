import os
from abc import ABC, abstractmethod
from backend.core.config import settings

class BaseStorageService(ABC):
    """
    Abstract Base Class defining the file storage interface.
    This allows swapping local filesystem storage with S3 or other cloud providers.
    """
    @abstractmethod
    def save_file(self, file_name: str, file_content: bytes, folder: str = None) -> str:
        """Save a file and return its path or URL."""
        pass

    @abstractmethod
    def get_file(self, file_path: str) -> bytes:
        """Retrieve file content by path or URL."""
        pass

    @abstractmethod
    def delete_file(self, file_path: str) -> bool:
        """Delete a file by path or URL."""
        pass

class LocalStorageService(BaseStorageService):
    """
    Concrete implementation of storage service using the local filesystem.
    """
    def __init__(self, base_upload_dir: str = "uploads"):
        self.base_dir = os.path.abspath(base_upload_dir)
        if not os.path.exists(self.base_dir):
            os.makedirs(self.base_dir, exist_ok=True)

    def _get_full_path(self, relative_path: str) -> str:
        # Prevent directory traversal attacks
        full_path = os.path.abspath(os.path.join(self.base_dir, relative_path))
        if not full_path.startswith(self.base_dir):
            raise ValueError("Directory traversal attempt detected.")
        return full_path

    def save_file(self, file_name: str, file_content: bytes, folder: str = None) -> str:
        folder_path = self.base_dir
        rel_folder = ""
        if folder:
            rel_folder = folder.strip("/\\")
            folder_path = os.path.join(self.base_dir, rel_folder)
            os.makedirs(folder_path, exist_ok=True)

        target_path = os.path.join(folder_path, file_name)
        with open(target_path, "wb") as f:
            f.write(file_content)

        return os.path.join(rel_folder, file_name)

    def get_file(self, file_path: str) -> bytes:
        full_path = self._get_full_path(file_path)
        if not os.path.exists(full_path):
            raise FileNotFoundError(f"File not found: {file_path}")
        with open(full_path, "rb") as f:
            return f.read()

    def delete_file(self, file_path: str) -> bool:
        try:
            full_path = self._get_full_path(file_path)
            if os.path.exists(full_path):
                os.remove(full_path)
                return True
            return False
        except Exception:
            return False

# Export initialized storage instance (falls back to local uploads)
storage_service = LocalStorageService()
