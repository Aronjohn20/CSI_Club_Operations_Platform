"""
CSI Club Operations Platform - Certificate Validation Engine
Complies with CERTIFICATE_VALIDATION.md specification.
Performs data-driven, rule-based validation on uploaded PDF certificates.
"""

from dataclasses import dataclass, field, asdict
from typing import List, Dict, Any, Optional
import hashlib
import io
import re
import csv

try:
    import pypdf
except ImportError:
    pypdf = None


@dataclass
class RuleResult:
    rule_id: str
    rule_name: str
    status: str  # "PASSED", "FAILED", "MANUAL_REVIEW"
    expected: str
    actual: str
    explanation: str
    confidence: float = 1.0


@dataclass
class CertificateFileValidation:
    file_id: str
    filename: str
    checksum: str
    status: str  # "PASSED", "FAILED", "ERROR"
    total_rules: int
    passed_rules: int
    failed_rules: int
    manual_review_rules: int
    results: List[RuleResult] = field(default_factory=list)
    error_message: Optional[str] = None
    processed_at: Optional[str] = None


class CertificateTemplateRules:
    """Certificate rule configurations complying with BUSINESS_RULES.md Sections 13–33."""

    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or self.get_default_rules()

    @staticmethod
    def get_participation_rules() -> Dict[str, Any]:
        """Rules for Certificate of Participation (BUSINESS_RULES.md Section 15-26)."""
        return {
            "template_name": "Certificate of Participation",
            "certificate_type": "participation",
            "version": "2.0",
            "page_count": 1,
            "required_heading": "CERTIFICATE OF PARTICIPATION",
            "certification_statement": "THIS IS TO CERTIFY THAT",
            "required_phrases": [
                "CERTIFICATE OF PARTICIPATION",
                "THIS IS TO CERTIFY THAT",
                "has participated in",
                "Computer Society of India",
                "Rajagiri School of Engineering and Technology",
                "DR. TRIPTIC",
                "MS. BENCY WILSON",
                "FACULTY COORDINATOR",
            ],
            "prohibited_phrases": [
                "Lorem Ipsum",
                "SAMPLE CERTIFICATE",
                "DRAFT",
                "has secured first place",
                "has secured second place",
                "has secured third place",
            ],
            "date_pattern": r"(?:\b\d{1,2}(?:st|nd|rd|th)?[\s\/\-\.](?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s\/\-\.]\d{2,4}\b|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4}\b|\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b|\b202[4-9]\b)",
            "min_words": 15,
            "max_words": 200,
            "require_logo_image": True,
            "body_font_family": "Times New Roman",
            "participant_font_family": "Palace Script MT",
        }

    @staticmethod
    def get_appreciation_rules() -> Dict[str, Any]:
        """Rules for Certificate of Appreciation (BUSINESS_RULES.md Section 27-30)."""
        return {
            "template_name": "Certificate of Appreciation",
            "certificate_type": "appreciation",
            "version": "2.0",
            "page_count": 1,
            "required_heading": "CERTIFICATE OF APPRECIATION",
            "certification_statement": "THIS IS TO CERTIFY THAT",
            "required_phrases": [
                "CERTIFICATE OF APPRECIATION",
                "THIS IS TO CERTIFY THAT",
                "has secured",
                "Computer Society of India",
                "Rajagiri School of Engineering and Technology",
                "DR. TRIPTIC",
                "MS. BENCY WILSON",
                "FACULTY COORDINATOR",
            ],
            "prohibited_phrases": [
                "Lorem Ipsum",
                "SAMPLE CERTIFICATE",
                "DRAFT",
                "has participated in",
            ],
            "date_pattern": r"(?:\b\d{1,2}(?:st|nd|rd|th)?[\s\/\-\.](?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s\/\-\.]\d{2,4}\b|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4}\b|\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b|\b202[4-9]\b)",
            "min_words": 15,
            "max_words": 200,
            "require_logo_image": True,
            "body_font_family": "Times New Roman",
            "participant_font_family": "Palace Script MT",
        }

    @classmethod
    def get_default_rules(cls) -> Dict[str, Any]:
        """General official CSI event certificate validation rules."""
        return {
            "template_name": "CSI Official Event Certificate 2026",
            "certificate_type": "general",
            "version": "2.0",
            "page_count": 1,
            "required_phrases": [
                "THIS IS TO CERTIFY THAT",
                "Computer Society of India",
                "Rajagiri School of Engineering and Technology",
                "FACULTY COORDINATOR",
            ],
            "prohibited_phrases": [
                "Lorem Ipsum",
                "SAMPLE CERTIFICATE",
                "DRAFT",
            ],
            "date_pattern": r"(?:\b\d{1,2}(?:st|nd|rd|th)?[\s\/\-\.](?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)[\s\/\-\.]\d{2,4}\b|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{2,4}\b|\b\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}\b|\b\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2}\b|\b202[4-9]\b)",
            "min_words": 15,
            "max_words": 200,
            "require_logo_image": True,
        }


class CertificateValidator:
    """Validates single or batch certificate PDFs against rule templates."""

    def __init__(self, template: Optional[CertificateTemplateRules] = None):
        self.template = template or CertificateTemplateRules()

    def calculate_checksum(self, file_bytes: bytes) -> str:
        """Returns SHA-256 checksum of the file bytes for deduplication."""
        return hashlib.sha256(file_bytes).hexdigest()

    def validate_file(self, filename: str, file_bytes: bytes, file_id: str = "") -> CertificateFileValidation:
        """
        Validates an individual certificate PDF file bytes with strict isolation.
        A malformed or corrupted file produces an ERROR/FAILED result without raising unhandled exceptions.
        """
        checksum = self.calculate_checksum(file_bytes)
        f_id = file_id or checksum[:12]

        rules_cfg = self.template.config
        results: List[RuleResult] = []

        # Guard: check if pypdf is installed
        if pypdf is None:
            # Fallback simulator / heuristic text inspection if pypdf is not installed
            return self._fallback_validate(filename, file_bytes, f_id, checksum, rules_cfg)

        try:
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
        except Exception as e:
            return CertificateFileValidation(
                file_id=f_id,
                filename=filename,
                checksum=checksum,
                status="ERROR",
                total_rules=1,
                passed_rules=0,
                failed_rules=1,
                manual_review_rules=0,
                error_message=f"Corrupt or unreadable PDF document: {str(e)}",
                results=[
                    RuleResult(
                        rule_id="pdf_integrity",
                        rule_name="PDF Document Integrity",
                        status="FAILED",
                        expected="Valid, non-corrupted PDF stream",
                        actual=f"Parsing error: {str(e)}",
                        explanation="The file could not be parsed by the PDF engine. Check if the file is encrypted or truncated.",
                    )
                ],
            )

        # 1. Structural Rule: Page Count
        actual_pages = len(reader.pages)
        expected_pages = rules_cfg.get("page_count", 1)
        if actual_pages == expected_pages:
            results.append(
                RuleResult(
                    rule_id="page_count",
                    rule_name="Certificate Page Count",
                    status="PASSED",
                    expected=f"Exactly {expected_pages} page(s)",
                    actual=f"{actual_pages} page(s)",
                    explanation="Certificate conforms to the single-page certificate standard.",
                )
            )
        else:
            results.append(
                RuleResult(
                    rule_id="page_count",
                    rule_name="Certificate Page Count",
                    status="FAILED",
                    expected=f"Exactly {expected_pages} page(s)",
                    actual=f"{actual_pages} page(s)",
                    explanation=f"Certificate has {actual_pages} pages instead of required {expected_pages}.",
                )
            )

        # Extract full document text & count images across pages
        full_text = ""
        total_images = 0
        for page in reader.pages:
            try:
                page_text = page.extract_text() or ""
                full_text += " " + page_text
            except Exception:
                pass
            try:
                total_images += len(page.images)
            except Exception:
                pass

        full_text_clean = " ".join(full_text.split())

        # 2. Content Rule: Required Phrases (Flexible matching for common acronyms & faculty titles)
        for phrase in rules_cfg.get("required_phrases", []):
            found = phrase.lower() in full_text_clean.lower()
            # Recognize common accepted abbreviations
            if not found:
                if phrase.lower() == "computer society of india" and ("csi" in full_text_clean.lower() or "csi" in filename.lower()):
                    found = True
                elif "rajagiri" in phrase.lower() and ("rset" in full_text_clean.lower() or "rajagiri" in full_text_clean.lower()):
                    found = True
                elif "tripti" in phrase.lower() and "tripti" in full_text_clean.lower():
                    found = True
                elif "bency" in phrase.lower() and "bency" in full_text_clean.lower():
                    found = True
                elif "faculty coordinator" in phrase.lower() and ("coordinator" in full_text_clean.lower() or "branch counselor" in full_text_clean.lower()):
                    found = True

            if found:
                results.append(
                    RuleResult(
                        rule_id=f"req_phrase_{phrase[:10]}",
                        rule_name=f"Required Text: '{phrase}'",
                        status="PASSED",
                        expected=f"Must contain '{phrase}'",
                        actual="Found in extracted text or approved equivalent",
                        explanation=f"The required CSI phrase '{phrase}' or official equivalent was detected.",
                    )
                )
            else:
                results.append(
                    RuleResult(
                        rule_id=f"req_phrase_{phrase[:10]}",
                        rule_name=f"Required Text: '{phrase}'",
                        status="FAILED",
                        expected=f"Must contain '{phrase}'",
                        actual="Not found",
                        explanation=f"Missing required text '{phrase}'. Check wording and spelling.",
                    )
                )

        # 3. Content Rule: Prohibited Phrases
        for phrase in rules_cfg.get("prohibited_phrases", []):
            if phrase.lower() in full_text_clean.lower():
                results.append(
                    RuleResult(
                        rule_id=f"proh_phrase_{phrase[:10]}",
                        rule_name=f"Forbidden Text Check: '{phrase}'",
                        status="FAILED",
                        expected=f"Must NOT contain '{phrase}'",
                        actual=f"Found '{phrase}' in document",
                        explanation=f"Draft or placeholder artifact '{phrase}' was detected.",
                    )
                )
            else:
                results.append(
                    RuleResult(
                        rule_id=f"proh_phrase_{phrase[:10]}",
                        rule_name=f"Forbidden Text Check: '{phrase}'",
                        status="PASSED",
                        expected=f"Must NOT contain '{phrase}'",
                        actual="No forbidden text found",
                        explanation=f"No placeholder artifact '{phrase}' was present.",
                    )
                )

        # 4. Content Rule: Date Check
        date_pattern = rules_cfg.get("date_pattern")
        if date_pattern:
            date_matches = re.findall(date_pattern, full_text_clean, flags=re.IGNORECASE)
            if date_matches:
                results.append(
                    RuleResult(
                        rule_id="date_presence",
                        rule_name="Event / Issuance Date",
                        status="PASSED",
                        expected="Valid date matching event format",
                        actual=f"Found: {date_matches[0]}",
                        explanation="A valid event or issuance date format was recognized.",
                    )
                )
            else:
                results.append(
                    RuleResult(
                        rule_id="date_presence",
                        rule_name="Event / Issuance Date",
                        status="FAILED",
                        expected="Valid date matching event format",
                        actual="No recognized date pattern found",
                        explanation="No valid date string was detected in the certificate write-up.",
                    )
                )

        # 5. Structure Rule: Word Count
        word_count = len(full_text_clean.split())
        min_words = rules_cfg.get("min_words", 15)
        max_words = rules_cfg.get("max_words", 200)
        if min_words <= word_count <= max_words:
            results.append(
                RuleResult(
                    rule_id="word_count",
                    rule_name="Write-up Length / Content Volume",
                    status="PASSED",
                    expected=f"Between {min_words} and {max_words} words",
                    actual=f"{word_count} words",
                    explanation="Certificate write-up density is appropriate.",
                )
            )
        else:
            results.append(
                RuleResult(
                    rule_id="word_count",
                    rule_name="Write-up Length / Content Volume",
                    status="FAILED",
                    expected=f"Between {min_words} and {max_words} words",
                    actual=f"{word_count} words",
                    explanation=f"Text content length ({word_count} words) is out of expected bounds ({min_words}-{max_words}).",
                )
            )

        # 6. Visual/Layout Rule: Logo Image Presence (With Confidence flag)
        if rules_cfg.get("require_logo_image"):
            if total_images > 0:
                results.append(
                    RuleResult(
                        rule_id="logo_presence",
                        rule_name="CSI Branch Logo Presence",
                        status="PASSED",
                        expected="At least 1 embedded logo / crest image",
                        actual=f"Detected {total_images} embedded image object(s)",
                        explanation="CSI logo image object was detected in PDF structure.",
                        confidence=0.9,
                    )
                )
            else:
                # Per CERTIFICATE_VALIDATION.md: Label uncertain visual layout rules as needs manual review
                results.append(
                    RuleResult(
                        rule_id="logo_presence",
                        rule_name="CSI Branch Logo Presence",
                        status="MANUAL_REVIEW",
                        expected="Vector or raster logo image",
                        actual="No distinct image stream found (might be vector paths)",
                        explanation="Vector-drawn logos cannot be verified with 100% certainty without raster rendering. Flagged for visual spot-check.",
                        confidence=0.5,
                    )
                )

        passed_count = sum(1 for r in results if r.status == "PASSED")
        failed_count = sum(1 for r in results if r.status == "FAILED")
        manual_count = sum(1 for r in results if r.status == "MANUAL_REVIEW")

        overall_status = "PASSED" if failed_count == 0 else "FAILED"

        return CertificateFileValidation(
            file_id=f_id,
            filename=filename,
            checksum=checksum,
            status=overall_status,
            total_rules=len(results),
            passed_rules=passed_count,
            failed_rules=failed_count,
            manual_review_rules=manual_count,
            results=results,
        )

    def _fallback_validate(
        self, filename: str, file_bytes: bytes, file_id: str, checksum: str, rules_cfg: Dict[str, Any]
    ) -> CertificateFileValidation:
        """Heuristic fallback parser when pypdf is absent."""
        # Simple text scan for strings inside byte stream
        raw_str = file_bytes.decode("latin-1", errors="ignore")
        results: List[RuleResult] = []

        is_pdf = raw_str.startswith("%PDF")
        results.append(
            RuleResult(
                rule_id="pdf_magic",
                rule_name="PDF Header Signature",
                status="PASSED" if is_pdf else "FAILED",
                expected="%PDF header signature",
                actual="Found %PDF header" if is_pdf else "Invalid file header",
                explanation="File starts with legitimate PDF magic bytes." if is_pdf else "File is not a valid PDF.",
            )
        )

        for phrase in rules_cfg.get("required_phrases", []):
            found = phrase.lower() in raw_str.lower()
            results.append(
                RuleResult(
                    rule_id=f"phrase_{phrase[:10]}",
                    rule_name=f"Required Text: '{phrase}'",
                    status="PASSED" if found else "FAILED",
                    expected=f"Contains '{phrase}'",
                    actual="Found in stream" if found else "Not found",
                    explanation=f"Required phrase check for '{phrase}'.",
                )
            )

        passed_count = sum(1 for r in results if r.status == "PASSED")
        failed_count = sum(1 for r in results if r.status == "FAILED")

        return CertificateFileValidation(
            file_id=file_id,
            filename=filename,
            checksum=checksum,
            status="PASSED" if failed_count == 0 else "FAILED",
            total_rules=len(results),
            passed_rules=passed_count,
            failed_rules=failed_count,
            manual_review_rules=0,
            results=results,
        )

    @staticmethod
    def export_results_to_csv(batch_results: List[CertificateFileValidation]) -> str:
        """Generates CSV export string compliant with CERTIFICATE_VALIDATION.md."""
        output = io.StringIO()
        writer = csv.writer(output)
        writer.writerow(["Filename", "Overall Status", "Total Rules", "Passed", "Failed", "Failed Rule Names", "Failure Summary", "Checksum"])

        for item in batch_results:
            failed_names = [r.rule_name for r in item.results if r.status == "FAILED"]
            failure_explanations = [f"{r.rule_name}: {r.explanation}" for r in item.results if r.status == "FAILED"]
            writer.writerow([
                item.filename,
                item.status,
                item.total_rules,
                item.passed_rules,
                item.failed_rules,
                "; ".join(failed_names) if failed_names else "None",
                " | ".join(failure_explanations) if failure_explanations else "All rules satisfied",
                item.checksum[:16],
            ])

        return output.getvalue()
