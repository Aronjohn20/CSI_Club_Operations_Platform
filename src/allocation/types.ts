// ==============================================================================
// CSI Club Operations Platform - Allocation Engine Types
// ==============================================================================

import { MemberType } from '../types/index.js';

export interface MemberCandidate {
  id: string;
  name: string;
  member_type: MemberType;
  active: boolean;
  assignment_count: number;
  last_assigned_date?: string;
}

export interface AllocationConstraintEvaluation {
  name: string;
  satisfied: boolean;
  description: string;
}

export interface AllocationResult {
  success: boolean;
  eventId: string;
  eventName: string;
  requiredCount: number;
  selectedMembers: MemberCandidate[];
  constraintEvaluations: AllocationConstraintEvaluation[];
  diagnosticMessage?: string;
  ruleVersion: string;
}
