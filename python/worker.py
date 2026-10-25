"""
CSI Club Operations Platform - Asynchronous Batch Certificate Processing Worker
Complies with CERTIFICATE_VALIDATION.md & ARCHITECTURE.md specifications.
Guarantees resilient per-file isolation for up to 400 certificates without blocking the server.
"""

import asyncio
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Dict, List, Optional
import uuid

from certificate_validator import CertificateValidator, CertificateFileValidation, CertificateTemplateRules


@dataclass
class CertificateBatchJob:
    batch_id: str
    template_name: str
    status: str  # "CREATED", "QUEUED", "PROCESSING", "COMPLETED", "PARTIAL_FAILURE", "FAILED"
    total_files: int
    processed_files: int = 0
    passed_files: int = 0
    failed_files: int = 0
    error_files: int = 0
    created_at: str = field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    completed_at: Optional[str] = None
    file_results: List[CertificateFileValidation] = field(default_factory=list)
    errors: List[str] = field(default_factory=list)


class CertificateBatchWorker:
    """Manages asynchronous batch processing of certificate PDF uploads."""

    def __init__(self, max_concurrent_workers: int = 4):
        self.validator = CertificateValidator()
        self.executor = ThreadPoolExecutor(max_workers=max_concurrent_workers)
        self.batches: Dict[str, CertificateBatchJob] = {}

    def create_batch(self, total_files: int, template_name: str = "Standard") -> CertificateBatchJob:
        batch_id = f"batch_{uuid.uuid4().hex[:10]}"
        job = CertificateBatchJob(
            batch_id=batch_id,
            template_name=template_name,
            status="QUEUED",
            total_files=total_files,
        )
        self.batches[batch_id] = job
        return job

    def get_batch(self, batch_id: str) -> Optional[CertificateBatchJob]:
        return self.batches.get(batch_id)

    async def process_batch_files(
        self,
        batch_id: str,
        files: List[tuple[str, bytes]],  # List of (filename, file_bytes)
    ) -> CertificateBatchJob:
        """
        Processes a batch of up to 400 certificate files asynchronously.
        Each file is validated in an isolated task: a failure in one file does not fail the batch.
        """
        job = self.batches.get(batch_id)
        if not job:
            raise ValueError(f"Batch {batch_id} not found.")

        job.status = "PROCESSING"
        loop = asyncio.get_running_loop()

        for filename, file_bytes in files:
            try:
                # Run synchronous PDF rule checks in the thread pool executor
                validation_result: CertificateFileValidation = await loop.run_in_executor(
                    self.executor,
                    self.validator.validate_file,
                    filename,
                    file_bytes,
                )

                job.file_results.append(validation_result)
                job.processed_files += 1

                if validation_result.status == "PASSED":
                    job.passed_files += 1
                elif validation_result.status == "FAILED":
                    job.failed_files += 1
                else:
                    job.error_files += 1

            except Exception as e:
                # Per-file failure isolation
                job.processed_files += 1
                job.error_files += 1
                job.errors.append(f"Unexpected error processing {filename}: {str(e)}")

        job.completed_at = datetime.now(timezone.utc).isoformat()
        if job.error_files > 0 or job.failed_files > 0:
            job.status = "PARTIAL_FAILURE" if job.passed_files > 0 else "FAILED"
        else:
            job.status = "COMPLETED"

        return job
