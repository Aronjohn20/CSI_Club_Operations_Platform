"""
CSI Club Operations Platform - Coordinator Allocation Engine
Complies strictly with BUSINESS_RULES.md specifications.
Generates balanced, availability-aware, history-aware allocations with fair randomization.
"""

from dataclasses import dataclass, field
from typing import List, Dict, Set, Optional, Tuple
import itertools
import random


@dataclass
class MemberCandidate:
    id: str
    name: str
    member_type: str  # "new_coordinator", "old_coordinator", "executive", "other"
    active: bool = True
    assignment_count: int = 0
    last_assigned_date: Optional[str] = None
    role_difficulty_weight: float = 0.0


@dataclass
class AllocationConstraintEvaluation:
    name: str
    satisfied: bool
    description: str


@dataclass
class AllocationResult:
    success: bool
    event_id: str
    event_name: str
    required_count: int
    selected_members: List[MemberCandidate] = field(default_factory=list)
    constraint_evaluations: List[AllocationConstraintEvaluation] = field(default_factory=list)
    diagnostic_message: Optional[str] = None
    rule_version: str = "2.0"


class CoordinatorAllocationEngine:
    """
    Constraint-based allocation engine for assigning club coordinators.
    Adheres strictly to BUSINESS_RULES.md:
      - Allowed coordinator counts: 2 or 3
      - 2 Coordinators: Exactly 1 New + 1 Old
      - 3 Coordinators: Preferred 2 New + 1 Old (Fallback: 1 New + 2 Old)
      - Repeated pair avoidance across cycles
      - Workload balancing with fair randomization among suitable candidates
    """

    def __init__(self, rule_version: str = "2.0"):
        self.rule_version = rule_version

    @staticmethod
    def _make_pair_key(id_a: str, id_b: str) -> Tuple[str, str]:
        """Returns sorted tuple for symmetric pair tracking."""
        return (id_a, id_b) if id_a < id_b else (id_b, id_a)

    def _extract_pairs_from_group(self, members: List[MemberCandidate]) -> List[Tuple[str, str]]:
        """Extracts all symmetric pairs for a coordinator group."""
        pairs = []
        for i in range(len(members)):
            for j in range(i + 1, len(members)):
                pairs.append(self._make_pair_key(members[i].id, members[j].id))
        return pairs

    def allocate(
        self,
        event_id: str,
        event_name: str,
        required_count: int,
        candidates: List[MemberCandidate],
        excluded_member_ids: Optional[Set[str]] = None,
        pair_history: Optional[Set[Tuple[str, str]]] = None,
        require_new_old_balance: bool = True,
        event_difficulty: float = 1.0,
        random_seed: Optional[int] = None,
    ) -> AllocationResult:
        """
        Executes constraint satisfaction and workload optimization according to BUSINESS_RULES.md.
        """
        excluded = excluded_member_ids or set()
        history_pairs = pair_history or set()
        rng = random.Random(random_seed)

        # Rule 2.1: The user must select either 2 or 3 coordinators. No other number is allowed.
        if required_count not in (2, 3):
            return AllocationResult(
                success=False,
                event_id=event_id,
                event_name=event_name,
                required_count=required_count,
                diagnostic_message=(
                    f"Invalid coordinator count '{required_count}'. "
                    "BUSINESS_RULES.md Section 2.1 strictly requires either 2 or 3 coordinators."
                ),
                rule_version=self.rule_version,
            )

        # Rule 1 & Rule 5.4: Filter active, non-excluded candidates eligible for coordinator role
        available = [m for m in candidates if m.active and m.id not in excluded and m.member_type != "other"]

        if len(available) < required_count:
            return AllocationResult(
                success=False,
                event_id=event_id,
                event_name=event_name,
                required_count=required_count,
                diagnostic_message=(
                    f"Insufficient active members available. Required: {required_count}, "
                    f"Available after exclusions: {len(available)} (Excluded: {len(excluded)})."
                ),
                rule_version=self.rule_version,
            )

        new_coordinators = [m for m in available if m.member_type == "new_coordinator"]
        old_coordinators = [m for m in available if m.member_type in ("old_coordinator", "executive")]

        evaluations: List[AllocationConstraintEvaluation] = []

        # ----------------------------------------------------------------------
        # Case A: 2 Coordinators (Section 2.2: Exactly 1 New + 1 Old)
        # ----------------------------------------------------------------------
        if required_count == 2:
            if require_new_old_balance:
                if len(new_coordinators) == 0:
                    return AllocationResult(
                        success=False,
                        event_id=event_id,
                        event_name=event_name,
                        required_count=2,
                        diagnostic_message=(
                            "Composition constraint failed: No active New Coordinator available in the pool. "
                            "2-Coordinator events strictly require 1 New + 1 Old."
                        ),
                        rule_version=self.rule_version,
                    )
                if len(old_coordinators) == 0:
                    return AllocationResult(
                        success=False,
                        event_id=event_id,
                        event_name=event_name,
                        required_count=2,
                        diagnostic_message=(
                            "Composition constraint failed: No active Old Coordinator available in the pool. "
                            "2-Coordinator events strictly require 1 New + 1 Old."
                        ),
                        rule_version=self.rule_version,
                    )

            # Rule 3 & 6: Eligibility & workload first, then random tie-breaking among candidates of equal workload
            def candidate_sort_key(m: MemberCandidate):
                # Primary: assignment count + difficulty weight
                # Secondary: random jitter for fair random selection among equal workload
                return (m.assignment_count + m.role_difficulty_weight, rng.random(), m.id)

            sorted_new = sorted(new_coordinators, key=candidate_sort_key)
            sorted_old = sorted(old_coordinators, key=candidate_sort_key)

            # Evaluate all possible 1 New + 1 Old combinations
            # Rank combinations by:
            # 1. Repeated pair penalty (prefer 0 repeats)
            # 2. Total combined assignment count
            # 3. Random tie-breaker
            best_pair = None
            fallback_pair = None
            best_workload = float("inf")
            fallback_workload = float("inf")

            for new_m in sorted_new:
                for old_m in sorted_old:
                    pair_key = self._make_pair_key(new_m.id, old_m.id)
                    total_workload = new_m.assignment_count + old_m.assignment_count

                    if pair_key not in history_pairs:
                        if total_workload < best_workload:
                            best_workload = total_workload
                            best_pair = (new_m, old_m)
                    else:
                        if total_workload < fallback_workload:
                            fallback_workload = total_workload
                            fallback_pair = (new_m, old_m)

            chosen = best_pair or fallback_pair
            is_repeated_pair = best_pair is None and fallback_pair is not None

            if not chosen:
                return AllocationResult(
                    success=False,
                    event_id=event_id,
                    event_name=event_name,
                    required_count=2,
                    diagnostic_message="No viable 1 New + 1 Old coordinator combination could be formed.",
                    rule_version=self.rule_version,
                )

            selected_list = [chosen[0], chosen[1]]

            evaluations.append(
                AllocationConstraintEvaluation(
                    name="Composition (1 New + 1 Old)",
                    satisfied=True,
                    description=f"Satisfied: {chosen[0].name} (New Coordinator) + {chosen[1].name} (Old Coordinator)",
                )
            )
            evaluations.append(
                AllocationConstraintEvaluation(
                    name="Repeated Pair Avoidance",
                    satisfied=not is_repeated_pair,
                    description=(
                        "Unique pairing: These members have not coordinated together in this or past cycles ✓"
                        if not is_repeated_pair
                        else "Notice: All available combinations repeat past pairings; selected lowest-workload repeat as fallback."
                    ),
                )
            )
            evaluations.append(
                AllocationConstraintEvaluation(
                    name="Workload Balancing & Fair Randomness",
                    satisfied=True,
                    description=f"Selected lowest-workload candidates ({chosen[0].assignment_count} & {chosen[1].assignment_count} prior events).",
                )
            )

            return AllocationResult(
                success=True,
                event_id=event_id,
                event_name=event_name,
                required_count=2,
                selected_members=selected_list,
                constraint_evaluations=evaluations,
                rule_version=self.rule_version,
            )

        # ----------------------------------------------------------------------
        # Case B: 3 Coordinators (Section 2.3: Preferred 2 New + 1 Old; Fallback 1 New + 2 Old)
        # ----------------------------------------------------------------------
        if required_count == 3:
            # Rule 2.4: Reject pure 3 New + 0 Old or 3 Old + 0 New
            if len(new_coordinators) == 0:
                return AllocationResult(
                    success=False,
                    event_id=event_id,
                    event_name=event_name,
                    required_count=3,
                    diagnostic_message="Composition constraint failed: At least 1 New Coordinator is required for a 3-person allocation.",
                    rule_version=self.rule_version,
                )
            if len(old_coordinators) == 0:
                return AllocationResult(
                    success=False,
                    event_id=event_id,
                    event_name=event_name,
                    required_count=3,
                    diagnostic_message="Composition constraint failed: At least 1 Old Coordinator is required for a 3-person allocation.",
                    rule_version=self.rule_version,
                )

            # Sort pools by workload + random tie breaker
            def candidate_sort_key(m: MemberCandidate):
                return (m.assignment_count + m.role_difficulty_weight, rng.random(), m.id)

            sorted_new = sorted(new_coordinators, key=candidate_sort_key)
            sorted_old = sorted(old_coordinators, key=candidate_sort_key)

            candidate_combos = []

            # Option 1 (Preferred): 2 New + 1 Old
            if len(sorted_new) >= 2 and len(sorted_old) >= 1:
                for new_pair in itertools.combinations(sorted_new, 2):
                    for old_m in sorted_old:
                        group = [new_pair[0], new_pair[1], old_m]
                        pairs = self._extract_pairs_from_group(group)
                        repeated_count = sum(1 for p in pairs if p in history_pairs)
                        total_workload = sum(m.assignment_count for m in group)
                        candidate_combos.append({
                            "composition_type": "2 New + 1 Old (Preferred)",
                            "is_preferred": True,
                            "group": group,
                            "repeated_pairs_count": repeated_count,
                            "total_workload": total_workload,
                        })

            # Option 2 (Fallback): 1 New + 2 Old
            # Generated if needed or if option 1 cannot be formed
            if len(sorted_new) >= 1 and len(sorted_old) >= 2:
                for new_m in sorted_new:
                    for old_pair in itertools.combinations(sorted_old, 2):
                        group = [new_m, old_pair[0], old_pair[1]]
                        pairs = self._extract_pairs_from_group(group)
                        repeated_count = sum(1 for p in pairs if p in history_pairs)
                        total_workload = sum(m.assignment_count for m in group)
                        candidate_combos.append({
                            "composition_type": "1 New + 2 Old (Fallback)",
                            "is_preferred": False,
                            "group": group,
                            "repeated_pairs_count": repeated_count,
                            "total_workload": total_workload,
                        })

            if not candidate_combos:
                return AllocationResult(
                    success=False,
                    event_id=event_id,
                    event_name=event_name,
                    required_count=3,
                    diagnostic_message="Composition constraint failed: Cannot form valid 2 New + 1 Old or 1 New + 2 Old combination.",
                    rule_version=self.rule_version,
                )

            # Sort combos by:
            # 1. Preferred composition first (2 New + 1 Old over 1 New + 2 Old)
            # 2. Fewest repeated pairs (0 repeated pairs first)
            # 3. Lowest total workload
            # 4. Deterministic / random tie-breaker
            candidate_combos.sort(
                key=lambda c: (
                    0 if c["is_preferred"] else 1,
                    c["repeated_pairs_count"],
                    c["total_workload"],
                    rng.random(),
                )
            )

            chosen_combo = candidate_combos[0]
            chosen_members = chosen_combo["group"]

            evaluations.append(
                AllocationConstraintEvaluation(
                    name="Composition (3 Coordinators)",
                    satisfied=True,
                    description=f"{chosen_combo['composition_type']} satisfied.",
                )
            )
            evaluations.append(
                AllocationConstraintEvaluation(
                    name="Repeated Pair Avoidance",
                    satisfied=chosen_combo["repeated_pairs_count"] == 0,
                    description=(
                        "Zero repeated pairs among the 3 members ✓"
                        if chosen_combo["repeated_pairs_count"] == 0
                        else f"Notice: Contains {chosen_combo['repeated_pairs_count']} previously paired combination(s) as fallback."
                    ),
                )
            )
            evaluations.append(
                AllocationConstraintEvaluation(
                    name="Workload Balancing & Fair Randomness",
                    satisfied=True,
                    description=f"Combined coordinator workload: {chosen_combo['total_workload']} prior assignments.",
                )
            )

            return AllocationResult(
                success=True,
                event_id=event_id,
                event_name=event_name,
                required_count=3,
                selected_members=chosen_members,
                constraint_evaluations=evaluations,
                rule_version=self.rule_version,
            )
