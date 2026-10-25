"""
CSI Club Operations Platform - FastAPI Backend Service
Exposes REST APIs for Certificate Batch Validation and Coordinator Allocation.
"""

from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException, Query, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Set
import io

from certificate_validator import CertificateValidator, CertificateTemplateRules
from allocation_engine import CoordinatorAllocationEngine, MemberCandidate
from worker import CertificateBatchWorker

app = FastAPI(
    title="CSI Club Operations Platform API",
    description="Backend services for Certificate Batch Validation and Coordinator Allocation",
    version="1.0.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

batch_worker = CertificateBatchWorker()
allocation_engine = CoordinatorAllocationEngine()


# ------------------------------------------------------------------------------
# Health Check
# ------------------------------------------------------------------------------
@app.get("/health")
def health_check():
    return {"status": "ok", "service": "CSI Operations Platform Backend"}


# ------------------------------------------------------------------------------
# Certificate Batch Validation APIs
# ------------------------------------------------------------------------------
@app.post("/api/certificates/upload-batch")
async def upload_certificate_batch(
    background_tasks: BackgroundTasks,
    template_name: str = Query("CSI Official Event Certificate 2026"),
    files: List[UploadFile] = File(...),
):
    """
    Accepts up to 400 certificate files, creates an async batch, and returns immediately with a batch ID.
    Processing happens in the background to avoid blocking HTTP requests.
    """
    if len(files) > 400:
        raise HTTPException(status_code=400, detail="Maximum 400 files allowed per batch.")

    if len(files) == 0:
        raise HTTPException(status_code=400, detail="At least 1 certificate file must be provided.")

    file_payloads: List[tuple[str, bytes]] = []
    for f in files:
        content = await f.read()
        file_payloads.append((f.filename or "unknown.pdf", content))

    job = batch_worker.create_batch(total_files=len(file_payloads), template_name=template_name)

    # Enqueue background processing
    background_tasks.add_task(batch_worker.process_batch_files, job.batch_id, file_payloads)

    return {
        "batch_id": job.batch_id,
        "status": job.status,
        "total_files": job.total_files,
        "message": f"Batch {job.batch_id} enqueued successfully. Monitor progress at /api/certificates/batch/{job.batch_id}",
    }


@app.get("/api/certificates/batch/{batch_id}")
def get_batch_status(batch_id: str):
    """Returns current progress and per-file validation results of a certificate batch."""
    job = batch_worker.get_batch(batch_id)
    if not job:
        raise HTTPException(status_code=404, detail="Batch not found.")

    return {
        "batch_id": job.batch_id,
        "status": job.status,
        "total_files": job.total_files,
        "processed_files": job.processed_files,
        "passed_files": job.passed_files,
        "failed_files": job.failed_files,
        "error_files": job.error_files,
        "created_at": job.created_at,
        "completed_at": job.completed_at,
        "results": [
            {
                "file_id": r.file_id,
                "filename": r.filename,
                "status": r.status,
                "passed_rules": r.passed_rules,
                "failed_rules": r.failed_rules,
                "rules": [
                    {
                        "rule_id": rule.rule_id,
                        "rule_name": rule.rule_name,
                        "status": rule.status,
                        "expected": rule.expected,
                        "actual": rule.actual,
                        "explanation": rule.explanation,
                    }
                    for rule in r.results
                ],
            }
            for r in job.file_results
        ],
    }


@app.get("/api/certificates/batch/{batch_id}/export")
def export_batch_csv(batch_id: str):
    """Exports batch results to CSV format."""
    job = batch_worker.get_batch(batch_id)
    if not job:
        raise HTTPException(status_code=404, detail="Batch not found.")

    csv_data = CertificateValidator.export_results_to_csv(job.file_results)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={batch_id}_results.csv"},
    )


# ------------------------------------------------------------------------------
# Coordinator Allocation APIs
# ------------------------------------------------------------------------------
class CandidatePayload(BaseModel):
    id: str
    name: str
    member_type: str
    active: bool = True
    assignment_count: int = 0


class AllocationRequest(BaseModel):
    event_id: str
    event_name: str
    required_count: int = 2
    candidates: List[CandidatePayload]
    excluded_member_ids: Optional[List[str]] = None
    pair_history: Optional[List[List[str]]] = None
    require_new_old_balance: bool = True


@app.post("/api/allocation/generate")
def generate_allocation(payload: AllocationRequest):
    """Executes constraint-based coordinator allocation."""
    candidates = [
        MemberCandidate(
            id=c.id,
            name=c.name,
            member_type=c.member_type,
            active=c.active,
            assignment_count=c.assignment_count,
        )
        for c in payload.candidates
    ]

    excluded = set(payload.excluded_member_ids or [])
    pairs: Set[tuple[str, str]] = set()
    if payload.pair_history:
        for p in payload.pair_history:
            if len(p) == 2:
                pairs.add((p[0], p[1]) if p[0] < p[1] else (p[1], p[0]))

    result = allocation_engine.allocate(
        event_id=payload.event_id,
        event_name=payload.event_name,
        required_count=payload.required_count,
        candidates=candidates,
        excluded_member_ids=excluded,
        pair_history=pairs,
        require_new_old_balance=payload.require_new_old_balance,
    )

    return {
        "success": result.success,
        "event_id": result.event_id,
        "event_name": result.event_name,
        "required_count": result.required_count,
        "selected_members": [
            {
                "id": m.id,
                "name": m.name,
                "member_type": m.member_type,
                "assignment_count": m.assignment_count,
            }
            for m in result.selected_members
        ],
        "constraint_evaluations": [
            {
                "name": e.name,
                "satisfied": e.satisfied,
                "description": e.description,
            }
            for e in result.constraint_evaluations
        ],
        "diagnostic_message": result.diagnostic_message,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
