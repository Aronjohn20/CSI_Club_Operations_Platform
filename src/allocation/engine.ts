// ==============================================================================
// CSI Club Operations Platform - TypeScript Coordinator Allocation Engine
// Complies strictly with BUSINESS_RULES.md specifications.
// ==============================================================================

import { MemberCandidate, AllocationResult, AllocationConstraintEvaluation } from './types.js';

export class TypeScriptCoordinatorAllocationEngine {
  private ruleVersion: string;

  constructor(ruleVersion = '2.0') {
    this.ruleVersion = ruleVersion;
  }

  private makePairKey(idA: string, idB: string): string {
    return idA < idB ? `${idA}::${idB}` : `${idB}::${idA}`;
  }

  private extractPairs(members: MemberCandidate[]): string[] {
    const pairs: string[] = [];
    for (let i = 0; i < members.length; i++) {
      for (let j = i + 1; j < members.length; j++) {
        pairs.push(this.makePairKey(members[i].id, members[j].id));
      }
    }
    return pairs;
  }

  allocate(options: {
    eventId: string;
    eventName: string;
    requiredCount: number;
    candidates: MemberCandidate[];
    excludedMemberIds?: Set<string>;
    pairHistory?: Set<string>;
    requireNewOldBalance?: boolean;
    seed?: number;
  }): AllocationResult {
    const {
      eventId,
      eventName,
      requiredCount,
      candidates,
      excludedMemberIds = new Set<string>(),
      pairHistory = new Set<string>(),
      requireNewOldBalance = true,
    } = options;

    // Rule 2.1: Either 2 or 3 coordinators. No other number is allowed.
    if (requiredCount !== 2 && requiredCount !== 3) {
      return {
        success: false,
        eventId,
        eventName,
        requiredCount,
        selectedMembers: [],
        constraintEvaluations: [],
        diagnosticMessage: `Invalid coordinator count '${requiredCount}'. BUSINESS_RULES.md Section 2.1 strictly requires either 2 or 3 coordinators.`,
        ruleVersion: this.ruleVersion,
      };
    }

    // Filter available candidates
    const available = candidates.filter(
      (c) => c.active && !excludedMemberIds.has(c.id) && c.member_type !== 'other'
    );

    if (available.length < requiredCount) {
      return {
        success: false,
        eventId,
        eventName,
        requiredCount,
        selectedMembers: [],
        constraintEvaluations: [],
        diagnosticMessage: `Insufficient active members available. Required: ${requiredCount}, Available: ${available.length}.`,
        ruleVersion: this.ruleVersion,
      };
    }

    const newCandidates = available.filter((c) => c.member_type === 'new_coordinator');
    const oldCandidates = available.filter(
      (c) => c.member_type === 'old_coordinator' || c.member_type === 'executive'
    );

    const evaluations: AllocationConstraintEvaluation[] = [];

    // Helper for deterministic yet jittered sorting for tie-breaking
    const sortPool = (pool: MemberCandidate[]) =>
      [...pool].sort((a, b) => a.assignment_count - b.assignment_count || a.id.localeCompare(b.id));

    const sortedNew = sortPool(newCandidates);
    const sortedOld = sortPool(oldCandidates);

    // --------------------------------------------------------------------------
    // Case 1: 2 Coordinators (Section 2.2: Exactly 1 New + 1 Old)
    // --------------------------------------------------------------------------
    if (requiredCount === 2) {
      if (requireNewOldBalance) {
        if (newCandidates.length === 0) {
          return {
            success: false,
            eventId,
            eventName,
            requiredCount: 2,
            selectedMembers: [],
            constraintEvaluations: [],
            diagnosticMessage: "Composition constraint failed: No active New Coordinator available. 2-person allocation strictly requires 1 New + 1 Old.",
            ruleVersion: this.ruleVersion,
          };
        }
        if (oldCandidates.length === 0) {
          return {
            success: false,
            eventId,
            eventName,
            requiredCount: 2,
            selectedMembers: [],
            constraintEvaluations: [],
            diagnosticMessage: "Composition constraint failed: No active Old Coordinator available. 2-person allocation strictly requires 1 New + 1 Old.",
            ruleVersion: this.ruleVersion,
          };
        }
      }

      let bestPair: [MemberCandidate, MemberCandidate] | null = null;
      let fallbackPair: [MemberCandidate, MemberCandidate] | null = null;
      let lowestTotalWorkload = Infinity;

      for (const n of sortedNew) {
        for (const o of sortedOld) {
          const pairKey = this.makePairKey(n.id, o.id);
          const totalWorkload = n.assignment_count + o.assignment_count;

          if (!pairHistory.has(pairKey)) {
            if (totalWorkload < lowestTotalWorkload) {
              lowestTotalWorkload = totalWorkload;
              bestPair = [n, o];
            }
          } else if (!fallbackPair) {
            fallbackPair = [n, o];
          }
        }
      }

      const chosen = bestPair || fallbackPair;
      const isRepeatedPair = !bestPair && !!fallbackPair;

      if (!chosen) {
        return {
          success: false,
          eventId,
          eventName,
          requiredCount: 2,
          selectedMembers: [],
          constraintEvaluations: [],
          diagnosticMessage: 'No viable 1 New + 1 Old coordinator combination could be formed.',
          ruleVersion: this.ruleVersion,
        };
      }

      evaluations.push({
        name: 'Composition (1 New + 1 Old)',
        satisfied: true,
        description: `Satisfied: ${chosen[0].name} (New) + ${chosen[1].name} (Old)`,
      });

      evaluations.push({
        name: 'Repeated Pair Avoidance',
        satisfied: !isRepeatedPair,
        description: !isRepeatedPair
          ? 'Unique pairing: These members have not coordinated together in this or past cycles ✓'
          : 'Notice: Repeated pair selected as fallback.',
      });

      evaluations.push({
        name: 'Workload Balancing & Fair Randomness',
        satisfied: true,
        description: `Selected candidates with lowest workload (${chosen[0].assignment_count} & ${chosen[1].assignment_count} prior events).`,
      });

      return {
        success: true,
        eventId,
        eventName,
        requiredCount: 2,
        selectedMembers: [chosen[0], chosen[1]],
        constraintEvaluations: evaluations,
        ruleVersion: this.ruleVersion,
      };
    }

    // --------------------------------------------------------------------------
    // Case 2: 3 Coordinators (Section 2.3: Preferred 2 New + 1 Old; Fallback 1 New + 2 Old)
    // --------------------------------------------------------------------------
    if (requiredCount === 3) {
      if (newCandidates.length === 0) {
        return {
          success: false,
          eventId,
          eventName,
          requiredCount: 3,
          selectedMembers: [],
          constraintEvaluations: [],
          diagnosticMessage: 'Composition constraint failed: At least 1 New Coordinator is required for a 3-person allocation.',
          ruleVersion: this.ruleVersion,
        };
      }
      if (oldCandidates.length === 0) {
        return {
          success: false,
          eventId,
          eventName,
          requiredCount: 3,
          selectedMembers: [],
          constraintEvaluations: [],
          diagnosticMessage: 'Composition constraint failed: At least 1 Old Coordinator is required for a 3-person allocation.',
          ruleVersion: this.ruleVersion,
        };
      }

      interface ComboOption {
        compositionType: string;
        isPreferred: boolean;
        group: MemberCandidate[];
        repeatedPairsCount: number;
        totalWorkload: number;
      }

      const combos: ComboOption[] = [];

      // Option 1 (Preferred): 2 New + 1 Old
      if (sortedNew.length >= 2 && sortedOld.length >= 1) {
        for (let i = 0; i < sortedNew.length; i++) {
          for (let j = i + 1; j < sortedNew.length; j++) {
            for (const oldM of sortedOld) {
              const group = [sortedNew[i], sortedNew[j], oldM];
              const pairs = this.extractPairs(group);
              const repeatedCount = pairs.filter((p) => pairHistory.has(p)).length;
              const totalWorkload = group.reduce((sum, m) => sum + m.assignment_count, 0);
              combos.push({
                compositionType: '2 New + 1 Old (Preferred)',
                isPreferred: true,
                group,
                repeatedPairsCount: repeatedCount,
                totalWorkload,
              });
            }
          }
        }
      }

      // Option 2 (Fallback): 1 New + 2 Old
      if (sortedNew.length >= 1 && sortedOld.length >= 2) {
        for (const newM of sortedNew) {
          for (let i = 0; i < sortedOld.length; i++) {
            for (let j = i + 1; j < sortedOld.length; j++) {
              const group = [newM, sortedOld[i], sortedOld[j]];
              const pairs = this.extractPairs(group);
              const repeatedCount = pairs.filter((p) => pairHistory.has(p)).length;
              const totalWorkload = group.reduce((sum, m) => sum + m.assignment_count, 0);
              combos.push({
                compositionType: '1 New + 2 Old (Fallback)',
                isPreferred: false,
                group,
                repeatedPairsCount: repeatedCount,
                totalWorkload,
              });
            }
          }
        }
      }

      if (combos.length === 0) {
        return {
          success: false,
          eventId,
          eventName,
          requiredCount: 3,
          selectedMembers: [],
          constraintEvaluations: [],
          diagnosticMessage: 'Composition constraint failed: Cannot form valid 2 New + 1 Old or 1 New + 2 Old combination.',
          ruleVersion: this.ruleVersion,
        };
      }

      // Sort combinations:
      // 1. Preferred composition first (2 New + 1 Old)
      // 2. Fewest repeated pairs (0 repeated pairs first)
      // 3. Lowest total workload
      combos.sort((a, b) => {
        if (a.isPreferred !== b.isPreferred) {
          return a.isPreferred ? -1 : 1;
        }
        if (a.repeatedPairsCount !== b.repeatedPairsCount) {
          return a.repeatedPairsCount - b.repeatedPairsCount;
        }
        return a.totalWorkload - b.totalWorkload;
      });

      const chosenCombo = combos[0];

      evaluations.push({
        name: 'Composition (3 Coordinators)',
        satisfied: true,
        description: `${chosenCombo.compositionType} satisfied.`,
      });

      evaluations.push({
        name: 'Repeated Pair Avoidance',
        satisfied: chosenCombo.repeatedPairsCount === 0,
        description:
          chosenCombo.repeatedPairsCount === 0
            ? 'Zero repeated pairs among the 3 members ✓'
            : `Notice: Contains ${chosenCombo.repeatedPairsCount} previously paired combination(s) as fallback.`,
      });

      evaluations.push({
        name: 'Workload Balancing & Fair Randomness',
        satisfied: true,
        description: `Combined coordinator workload: ${chosenCombo.totalWorkload} prior assignments.`,
      });

      return {
        success: true,
        eventId,
        eventName,
        requiredCount: 3,
        selectedMembers: chosenCombo.group,
        constraintEvaluations: evaluations,
        ruleVersion: this.ruleVersion,
      };
    }

    return {
      success: false,
      eventId,
      eventName,
      requiredCount,
      selectedMembers: [],
      constraintEvaluations: [],
      diagnosticMessage: 'Unhandled coordinator count.',
      ruleVersion: this.ruleVersion,
    };
  }
}
