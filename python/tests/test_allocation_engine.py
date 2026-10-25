"""Unit tests for Coordinator Allocation Engine adhering to BUSINESS_RULES.md."""

from allocation_engine import CoordinatorAllocationEngine, MemberCandidate


def test_standard_two_coordinator_allocation():
    """Rule 2.2: Exactly 1 New + 1 Old coordinator."""
    engine = CoordinatorAllocationEngine()

    candidates = [
        MemberCandidate(id="m1", name="Aarav Sharma", member_type="new_coordinator", assignment_count=0),
        MemberCandidate(id="m2", name="Priya Patel", member_type="old_coordinator", assignment_count=0),
        MemberCandidate(id="m3", name="Rohan Gupta", member_type="new_coordinator", assignment_count=2),
    ]

    result = engine.allocate(
        event_id="evt-1",
        event_name="Web Dev Hackathon",
        required_count=2,
        candidates=candidates,
    )

    assert result.success is True
    assert len(result.selected_members) == 2
    types = {m.member_type for m in result.selected_members}
    assert "new_coordinator" in types
    assert "old_coordinator" in types
    # Must pick Aarav (count 0) over Rohan (count 2)
    selected_ids = {m.id for m in result.selected_members}
    assert "m1" in selected_ids
    assert "m2" in selected_ids


def test_three_coordinator_preferred_allocation():
    """Rule 2.3: Preferred composition is 2 New + 1 Old."""
    engine = CoordinatorAllocationEngine()

    candidates = [
        MemberCandidate(id="n1", name="New A", member_type="new_coordinator", assignment_count=0),
        MemberCandidate(id="n2", name="New B", member_type="new_coordinator", assignment_count=1),
        MemberCandidate(id="o1", name="Old X", member_type="old_coordinator", assignment_count=0),
        MemberCandidate(id="o2", name="Old Y", member_type="old_coordinator", assignment_count=2),
    ]

    result = engine.allocate(
        event_id="evt-3a",
        event_name="AI Workshop",
        required_count=3,
        candidates=candidates,
    )

    assert result.success is True
    assert len(result.selected_members) == 3
    new_count = sum(1 for m in result.selected_members if m.member_type == "new_coordinator")
    old_count = sum(1 for m in result.selected_members if m.member_type in ("old_coordinator", "executive"))
    assert new_count == 2
    assert old_count == 1


def test_three_coordinator_fallback_allocation():
    """Rule 2.3: If 2 New is impossible, fallback to 1 New + 2 Old."""
    engine = CoordinatorAllocationEngine()

    candidates = [
        MemberCandidate(id="n1", name="Only New", member_type="new_coordinator", assignment_count=0),
        MemberCandidate(id="o1", name="Old A", member_type="old_coordinator", assignment_count=0),
        MemberCandidate(id="o2", name="Old B", member_type="old_coordinator", assignment_count=1),
    ]

    result = engine.allocate(
        event_id="evt-3b",
        event_name="Robotics Challenge",
        required_count=3,
        candidates=candidates,
    )

    assert result.success is True
    assert len(result.selected_members) == 3
    new_count = sum(1 for m in result.selected_members if m.member_type == "new_coordinator")
    old_count = sum(1 for m in result.selected_members if m.member_type in ("old_coordinator", "executive"))
    assert new_count == 1
    assert old_count == 2


def test_invalid_coordinator_count_rejection():
    """Rule 2.1: Only 2 or 3 coordinators are allowed."""
    engine = CoordinatorAllocationEngine()

    candidates = [
        MemberCandidate(id="m1", name="M1", member_type="new_coordinator"),
        MemberCandidate(id="m2", name="M2", member_type="old_coordinator"),
        MemberCandidate(id="m3", name="M3", member_type="new_coordinator"),
        MemberCandidate(id="m4", name="M4", member_type="old_coordinator"),
    ]

    # Test count = 4
    result4 = engine.allocate(
        event_id="evt-4",
        event_name="Summit",
        required_count=4,
        candidates=candidates,
    )
    assert result4.success is False
    assert "either 2 or 3" in (result4.diagnostic_message or "")

    # Test count = 1
    result1 = engine.allocate(
        event_id="evt-1",
        event_name="Meetup",
        required_count=1,
        candidates=candidates,
    )
    assert result1.success is False
    assert "either 2 or 3" in (result1.diagnostic_message or "")


def test_three_coordinator_pure_new_rejection():
    """Rule 2.4: 3 New + 0 Old is prohibited."""
    engine = CoordinatorAllocationEngine()

    candidates = [
        MemberCandidate(id="n1", name="New 1", member_type="new_coordinator"),
        MemberCandidate(id="n2", name="New 2", member_type="new_coordinator"),
        MemberCandidate(id="n3", name="New 3", member_type="new_coordinator"),
    ]

    result = engine.allocate(
        event_id="evt-pure",
        event_name="Workshop",
        required_count=3,
        candidates=candidates,
    )

    assert result.success is False
    assert "Composition constraint failed" in (result.diagnostic_message or "")


def test_repeated_pair_avoidance():
    """Rule 4: Avoid repeating previously paired combinations."""
    engine = CoordinatorAllocationEngine()

    candidates = [
        MemberCandidate(id="new1", name="New A", member_type="new_coordinator", assignment_count=0),
        MemberCandidate(id="new2", name="New B", member_type="new_coordinator", assignment_count=1),
        MemberCandidate(id="old1", name="Old X", member_type="old_coordinator", assignment_count=0),
    ]

    prior_pairs = {("new1", "old1")}

    result = engine.allocate(
        event_id="evt-3",
        event_name="Tech Fest",
        required_count=2,
        candidates=candidates,
        pair_history=prior_pairs,
    )

    assert result.success is True
    # Should pair (new2, old1) to avoid repeated pair
    selected_ids = {m.id for m in result.selected_members}
    assert "new2" in selected_ids
    assert "old1" in selected_ids
