"""Unit tests for Certificate Validator adhering to BUSINESS_RULES.md."""

from certificate_validator import CertificateValidator, CertificateTemplateRules, RuleResult


def test_participation_certificate_rules():
    """Rules 15-26: Participation Certificate must have specific headings and phrases."""
    part_rules = CertificateTemplateRules(CertificateTemplateRules.get_participation_rules())
    validator = CertificateValidator(template=part_rules)

    mock_pdf = (
        b"%PDF-1.4\n"
        b"CERTIFICATE OF PARTICIPATION\n"
        b"THIS IS TO CERTIFY THAT Laura John has participated in the Coding Competition\n"
        b"held on 19th September 2026 organized by Computer Society of India at\n"
        b"Rajagiri School of Engineering and Technology.\n"
        b"DR. TRIPTIC FACULTY COORDINATOR MS. BENCY WILSON FACULTY COORDINATOR\n"
    )

    res = validator.validate_file("participation.pdf", mock_pdf)
    assert res.file_id is not None
    assert res.status == "PASSED"


def test_appreciation_certificate_rules():
    """Rules 27-31: Appreciation Certificate must state achievement and reject participation phrasing."""
    apprec_rules = CertificateTemplateRules(CertificateTemplateRules.get_appreciation_rules())
    validator = CertificateValidator(template=apprec_rules)

    mock_pdf = (
        b"%PDF-1.4\n"
        b"CERTIFICATE OF APPRECIATION\n"
        b"THIS IS TO CERTIFY THAT Laura John has secured first place in Web Dev Hackathon\n"
        b"held on 19th September 2026 organized by Computer Society of India at\n"
        b"Rajagiri School of Engineering and Technology.\n"
        b"DR. TRIPTIC FACULTY COORDINATOR MS. BENCY WILSON FACULTY COORDINATOR\n"
    )

    res = validator.validate_file("appreciation.pdf", mock_pdf)
    assert res.status == "PASSED"


def test_certificate_csv_export():
    validator = CertificateValidator()
    mock_res = validator.validate_file("cert1.pdf", b"%PDF-1.4 valid test stream")
    csv_str = validator.export_results_to_csv([mock_res])

    assert "Filename" in csv_str
    assert "cert1.pdf" in csv_str
