# BUSINESS RULES

This document is the single source of truth for the club coordinator allocation system and certificate generation/validation system.

---

# 1. MEMBER CLASSIFICATION RULES

## 1.1 New Coordinator

A member is classified as a **New Coordinator** if the member joined the Executive Committee in the **2026–2027 academic year**.

- Join year: **2026**
- Classification: **New Coordinator**

## 1.2 Old Coordinator

A member is classified as an **Old Coordinator** if the member joined the club during either of the previous two academic years.

- Join year: **2024** → Old Coordinator
- Join year: **2025** → Old Coordinator

## 1.3 Other / Excluded

Members who do not belong to the 2024, 2025, or 2026 batches are classified as:

**Other / Excluded**

They should not normally participate in the automatic coordinator allocation process.

## 1.4 Classification Table

| Join Year | Classification |
|---|---|
| 2024 | Old Coordinator |
| 2025 | Old Coordinator |
| 2026 | New Coordinator |
| Other | Other / Excluded |

---

# 2. COORDINATOR ALLOCATION RULES

## 2.1 Number of Coordinators

The number of coordinators is **input-driven**.

The user must select either:

- **2 coordinators**
- **3 coordinators**

No other number is allowed unless the business rules are explicitly changed.

## 2.2 Two-Coordinator Allocation

When the user selects **2 coordinators**, the preferred composition is:

**1 New + 1 Old**

The system should select one eligible New Coordinator and one eligible Old Coordinator.

## 2.3 Three-Coordinator Allocation

When the user selects **3 coordinators**, the preferred composition is:

**2 New + 1 Old**

If this combination cannot reasonably be achieved because of availability, workload, previous pairings, or other allocation constraints, the system may use:

**1 New + 2 Old**

The 1 New + 2 Old combination should be treated as a fallback/rare case.

## 2.4 Invalid Combinations

The system should avoid:

- 2 New + 0 Old for a 3-person allocation
- 3 Old + 0 New for a 3-person allocation
- 2 New for a 2-person allocation
- 2 Old for a 2-person allocation

when a valid required composition can be formed.

---

# 3. RANDOM ALLOCATION RULES

The allocation should have a degree of randomness.

However, randomness must only occur **after the business constraints have been applied**.

The system must NOT randomly select from every member without considering:

- Member classification
- Workload
- Recent participation
- Role difficulty
- Availability
- Previous pairings

Therefore:

**Eligibility and balancing first → Random selection among suitable candidates second.**

This prevents the random allocator from repeatedly selecting the same heavily-used members.

---

# 4. REPEATED PAIR RULES

## 4.1 Pair History

The system must maintain historical information about coordinator combinations.

Example:

> Round 1 → A + B

The system should avoid assigning:

> Round 2 → A + B

when another valid combination is available.

## 4.2 Different Pair Preference

The allocation engine should prioritize creating **new combinations**.

Example:

Round 1:

- A + B
- C + D

Round 2 should preferably create:

- A + C
- B + D

rather than repeating:

- A + B
- C + D

## 4.3 Pair History Across Cycles

Starting a new allocation cycle does **not** erase pair history.

Previous pairs should continue to be considered when generating future allocations.

---

# 5. WORKLOAD BALANCING RULES

The allocation engine must balance coordinator workload.

The following factors must be considered.

## 5.1 Total Event Count

The system should prioritize members who have completed fewer coordinator events.

Example:

- Member A → 5 completed events
- Member B → 2 completed events

Member B should generally receive priority.

## 5.2 Recent Event Count

Recent participation should also affect selection.

A member who has recently coordinated several events should generally have lower priority than someone who has not recently participated.

## 5.3 Role Difficulty

Different events may have different levels of coordinator responsibility.

The system must support an event/role difficulty value.

Higher-difficulty roles should contribute appropriately to workload balancing.

The exact difficulty value/scale will be defined by the project owner or event configuration.

## 5.4 Availability

A member must be available to actually perform the coordinator role.

Availability should therefore be considered during allocation.

---

# 6. WORKLOAD PRIORITY

The general selection priority should be:

1. Meet required New/Old composition.
2. Remove unavailable candidates.
3. Prefer candidates with lower completed-event counts.
4. Consider recent participation.
5. Consider role difficulty/workload.
6. Avoid previously repeated pairs.
7. Randomly select among suitable candidates with comparable eligibility.

The exact implementation may use a scoring system, but the business objective is:

> **Give opportunities to members with lower workload while maintaining the required composition, avoiding repeated pairs, and respecting availability.**

---

# 7. ALLOCATION CONFIRMATION RULES

An allocation initially generated by the system is considered a **proposed allocation** until confirmed.

Example:

> Proposed allocation → A + B

The system should allow the assigned members to confirm their availability.

If a member says they are unavailable:

1. Their assignment is cancelled.
2. The system searches for an eligible replacement.
3. The replacement must satisfy the allocation rules.
4. The new allocation must be confirmed.
5. Only the final confirmed allocation is treated as the event's actual coordinator assignment.

---

# 8. EVENT COUNT UPDATE RULE

A coordinator's event count must **not** increase when they are merely selected.

The event count is updated only after the event has actually happened.

Correct lifecycle:

**Proposed → Confirmed → Event Happens → Completed → Event Count Updated**

If an allocation is cancelled before the event:

- Do not increase the member's completed-event count.

If a member is replaced:

- Only the person who actually completed the coordinator role receives the completed-event count.

---

# 9. POST-EVENT ALLOCATION RULE

After completing an event, a member should generally not be immediately selected again if other eligible members have lower participation counts.

The purpose is to distribute opportunities fairly.

A member can become eligible again once workload becomes sufficiently balanced.

---

# 10. AVAILABILITY RULES

Availability is relevant to the current event allocation.

The system must allow the coordinator to indicate whether they can perform the assignment.

If they cannot:

- The assignment can be reallocated.
- The replacement must be selected using the same allocation rules.
- The replacement must confirm availability.

There is no requirement for a permanent exclusion list.

---

# 11. MEMBER EXCLUSION RULES

A separate manual **per-event exclusion system is not required**.

The system should rely on:

- Availability
- Workload balancing
- Previous pair history
- Member classification
- Completed-event history

to determine suitable candidates.

---

# 12. ALLOCATION RESET RULES

## 12.1 Meaning of Reset

Reset means starting a **new allocation cycle**.

Reset does NOT mean deleting all historical information.

## 12.2 Historical Data Must Be Retained

The system must retain:

- Previous event assignments
- Completed-event counts
- Event history
- Previous coordinator combinations
- Pair history
- Previous cycles

## 12.3 Cycle Completion

A cycle can be considered complete when all eligible members have received an opportunity to act as coordinators.

Example:

If there are six eligible members:

- A
- B
- C
- D
- E
- F

and all six have participated during the cycle, the system can begin a new cycle.

## 12.4 New Cycle

When a new cycle begins:

- Cycle participation status can be reset.
- Historical event counts remain.
- Historical pairings remain.
- Previous allocations remain.
- The system should continue avoiding repeated pairs where possible.

## 12.5 Reset Principle

> **Reset the cycle, not the history.**

---

# 13. CERTIFICATE TYPES

The system supports two certificate types:

1. **Certificate of Participation**
2. **Certificate of Appreciation**

---

# 14. CERTIFICATE SOURCE OF TRUTH

The supplied official certificate image/template is the visual source of truth.

The system must preserve the official template's:

- Background
- Borders
- Decorative elements
- Logos
- Signature sections
- Heading structure
- General visual structure

Dynamic information should be inserted into the designated areas.

---

# 15. CERTIFICATE OF PARTICIPATION RULES

## 15.1 Heading

The heading must be:

**CERTIFICATE OF PARTICIPATION**

This is fixed.

## 15.2 Certification Statement

The certificate must contain:

**THIS IS TO CERTIFY THAT**

This is fixed.

## 15.3 Participant Name

The participant's name is dynamic.

Example:

**Laura John**

The name must be:

- Centered
- Displayed prominently
- Placed above the horizontal underline

## 15.4 Participant Name Font

The participant name must use:

- Font: **Palace Script MT**
- Size: **72 pt**

The participant name is not included in the 3–4 line body-text limit.

---

# 16. PARTICIPATION CERTIFICATE BODY

The body must communicate that the participant participated in the event.

The general structure is:

> has participated in the [EVENT DESCRIPTION] titled [EVENT NAME], held on [DATE], organized by the Computer Society of India (CSI) SB at Rajagiri School of Engineering and Technology, Kochi.

The exact event-related information is dynamic.

---

# 17. CERTIFICATE EVENT INFORMATION

The system must support dynamic event information including:

- Event level
- Online / Offline
- Technical / Non-technical
- Event type
- Event description
- Event name
- Event date
- Major event/parent event, if applicable

Examples:

- College-Level
- Intra-College
- Inter-College
- Online
- Offline
- Technical
- Coding Competition
- Quiz Competition
- Digital Treasure Hunt

---

# 18. EVENT NAME RULE

The event name is dynamic.

Example:

**CODER OF THE MONTH - SEPTEMBER**

The event name must be:

- Bold
- Clearly visible
- Preserved as the configured event name

---

# 19. DATE RULE

The event date is dynamic.

Example:

**19th September 2026**

The date must be:

- Inserted from event information
- Bold
- Included in the certificate body

---

# 20. MAJOR EVENT RULE

An event may optionally belong to a larger event.

Example:

> ... held on 16th September 2026, as part of **Homecoming 4.0**, organized by...

If a major event exists:

- Include it.
- Make the major event name bold.

If there is no major event:

- Omit the major-event phrase completely.

Do not leave an empty placeholder.

---

# 21. ORGANIZATION RULE

The organization must appear as:

**Computer Society of India (CSI) SB**

It must be:

- Present in the certificate body
- Bold
- Consistent across certificates

---

# 22. INSTITUTION RULE

The institution must appear as:

**Rajagiri School of Engineering and Technology, Kochi**

It must be:

- Present in the certificate body
- Bold
- Consistent across certificates

---

# 23. CERTIFICATE BODY FONT RULES

The main certificate body must use:

**Times New Roman**

Font size:

**16–17 pt**

The generator may use either 16 pt or 17 pt depending on the amount of text and required layout.

---

# 24. CERTIFICATE BODY ALIGNMENT

The certificate body should be centered within its designated area.

Text wrapping should be controlled so that the body remains visually balanced within the template.

---

# 25. CERTIFICATE BODY LINE LIMIT

The main certificate body must contain:

- Minimum: **3 lines**
- Maximum: **4 lines**

The generator should adjust wrapping and, where necessary, use 16 pt instead of 17 pt to maintain the required line count.

The following are excluded from this line count:

- Certificate heading
- "THIS IS TO CERTIFY THAT"
- Participant name
- Signature labels

---

# 26. REQUIRED BOLD TEXT

The following must be bold in the certificate body:

1. Event name
2. Event date
3. Computer Society of India (CSI) SB
4. Rajagiri School of Engineering and Technology, Kochi
5. Major event name, if applicable

---

# 27. CERTIFICATE OF APPRECIATION RULES

The Appreciation Certificate follows the same general template.

The main difference is the achievement statement.

Instead of:

> has participated in...

the certificate should state the participant's achievement.

Supported positions:

- First Place
- Second Place
- Third Place

---

# 28. APPRECIATION CERTIFICATE ACHIEVEMENT

Examples:

> has secured first place in...

> has secured second place in...

> has secured third place in...

The appropriate position must be dynamically generated based on the participant's result.

The achievement/position must be visually emphasized and bold.

---

# 29. CERTIFICATE LOGO RULES

The official template contains:

### Logo 1

**RSET 25-Year Anniversary Logo**

### Logo 2

**CSI SB RSET Logo**

Both are fixed template assets.

They should not be dynamically replaced during normal certificate generation.

---

# 30. CERTIFICATE SIGNATURE RULES

The official template contains two faculty signatures.

### Left Signature

**DR. TRIPTIC**  
**FACULTY COORDINATOR**

### Right Signature

**MS. BENCY WILSON**  
**FACULTY COORDINATOR**

These are fixed template elements.

They are not participant/event variables.

---

# 31. CERTIFICATE VALIDATION RULES

Every generated certificate must be validated before being considered valid.

## 31.1 Required Fields

The validator must check:

- Certificate type
- Participant name
- Event description
- Event name
- Event date
- Organization
- Institution
- Required logos
- Required signatures

## 31.2 Participation Certificate Validation

The certificate must communicate participation using:

**has participated in**

or the approved equivalent configured for the template.

## 31.3 Appreciation Certificate Validation

The certificate must contain the correct achievement:

- First place
- Second place
- Third place

An Appreciation Certificate must not incorrectly use the Participation wording.

---

# 32. VISUAL CERTIFICATE VALIDATION

The validator should check:

- Correct certificate heading
- Participant name exists
- Participant name uses Palace Script MT
- Participant name uses approximately 72 pt
- Main body uses Times New Roman
- Main body uses 16–17 pt
- Main body contains 3–4 lines
- Event name is bold
- Date is bold
- Organization is bold
- Institution is bold
- Major event is bold when present
- Required logos are present
- Required signatures are present
- Required fixed text is present

---

# 33. FIXED VS VARIABLE DATA

| Element | Type |
|---|---|
| Certificate type | Variable |
| Certificate heading | Fixed by certificate type |
| "THIS IS TO CERTIFY THAT" | Fixed |
| Participant name | Variable |
| Participant name font | Fixed |
| Participant name size | Fixed |
| Event description | Variable |
| Event name | Variable |
| Event date | Variable |
| Major event | Optional variable |
| Organization | Fixed |
| Institution | Fixed |
| RSET Anniversary Logo | Fixed |
| CSI SB RSET Logo | Fixed |
| Dr. Triptic Signature | Fixed |
| Ms. Bency Wilson Signature | Fixed |
| Main body font | Fixed |
| Main body size | 16–17 pt |
| Main body line count | 3–4 lines |

---

# 34. OVERALL ALLOCATION FLOW

The coordinator allocation process should follow this general sequence:

**1. User selects number of coordinators**

↓

**2. System identifies New and Old members**

↓

**3. System removes unavailable members**

↓

**4. System evaluates workload**

↓

**5. System evaluates recent participation**

↓

**6. System considers role difficulty**

↓

**7. System checks previous pairings**

↓

**8. System forms valid New/Old combination**

↓

**9. System randomly selects among suitable candidates**

↓

**10. Proposed allocation is shown**

↓

**11. Coordinators confirm availability**

↓

**12. If someone is unavailable → reallocate**

↓

**13. Final allocation is confirmed**

↓

**14. Event takes place**

↓

**15. Completed-event counts are updated**

↓

**16. Historical pairing information is retained**

---

# 35. CORE PRINCIPLE

The system should not simply select random members.

It should produce a **fair, balanced, availability-aware, history-aware random allocation**.

The primary objectives are:

1. Maintain the required New/Old composition.
2. Give members reasonably balanced opportunities.
3. Avoid repeatedly assigning the same pairs.
4. Respect availability.
5. Consider role difficulty.
6. Preserve historical information.
7. Use randomness among otherwise suitable candidates.
8. Update workload only after an event is actually completed.

---

# 36. CORE RESET PRINCIPLE

> **Reset the allocation cycle, not the historical data.**

Historical event participation and pair history must remain available to the system after a reset.

---

# 37. CORE CERTIFICATE PRINCIPLE

> **The official supplied certificate template is the visual source of truth, while this document defines the dynamic business rules and validation requirements.**

Any future modification to the official certificate template should result in these rules being updated accordingly.

---

# 38. ORGANIZATIONAL STRUCTURE, DOMAINS & RESPONSIBILITIES

The club hierarchy is partitioned into the **Executive Core Team** and the **Sub-Core Team** across 5 functional operational domains.

## 38.1 Executive Leadership
* **President**: Overall strategic leadership, external representation, institutional liaison with faculty coordinators, and club governance.
* **Vice President**: Assists the President, oversees inter-team operations, and acts in the President's absence.
* **Secretary**: Official club communications, institutional correspondence, meeting agendas, minutes, and administrative compliance.
* **Joint Secretary**: Supports the Secretary, coordinates internal reporting, and tracks execution milestones.
* **Treasurer**: Financial oversight, budget planning, expenditure records, invoicing, and prize disbursement.
* **Executive Coordinator**: Cross-domain coordination, event pipeline scheduling, and resource allocation.

## 38.2 Functional Domains & Lead Responsibilities
1. **Operations (Lead & Co-Lead + Sub-Core)**:
   * Event logistics, venue booking, hardware setup, on-the-day coordination, and schedule enforcement.
2. **Creative (Lead & Co-Lead + Sub-Core)**:
   * Visual identity, event posters, banners, slide decks, social media assets, and certificate visual validation.
3. **Documentation (Lead & Co-Lead + Sub-Core)**:
   * Official event write-ups, participant logs, attendance tracking, post-event reports, and Notion archiving.
4. **Marketing (Lead & Co-Lead + Sub-Core)**:
   * Event outreach, social media campaigns, class announcements, registration drives, and sponsor engagements.
5. **Technical (Lead & Co-Lead + Sub-Core)**:
   * Platforms, coding platforms, website maintenance, software tools, audio/visual tech, and hackathon technical setups.

---

# 39. OFFICIAL MEMBER ROSTER

## 39.1 Core Team

| Sl No. | Name | Role | Class / Batch | Domain |
|:---|:---|:---|:---|:---|
| 1 | Gayathri Binoj | President | S7 CS B | Executive |
| 2 | Abhishek Joby | Vice President | S7 CS A | Executive |
| 3 | Ayyappadas S | Secretary | S7 CS A | Executive |
| 4 | Fathima Naja | Joint Secretary | S7 CSBS | Executive |
| 5 | Suraj S Panickar | Treasurer | S7 CS C | Executive |
| 6 | Vishnu M P | Executive Coordinator | S7 CSBS | Executive |
| 7 | Aron Varghese John | Operations Lead | S7 CS A | Operations |
| 8 | Sneha Phinoo | Operations Co-Lead | S5 CS D | Operations |
| 9 | Sreya Raj | Creative Lead | S7 IT | Creative |
| 10 | Kripa Ann John | Creative Co-Lead | S5 CS C | Creative |
| 11 | Aafiya Shameer | Documentation Lead | S7 CS A | Documentation |
| 12 | June Maria Sudhil | Documentation Co-Lead | S5 AD | Documentation |
| 13 | Alina Mary John | Marketing Lead | S7 IT | Marketing |
| 14 | Ben George Simon | Marketing Co-Lead | S3 IT | Marketing |
| 15 | Soorya Das K S | Technical Lead | S5 IT | Technical |
| 16 | Riyan Raz | Technical Co-Lead | S5 CS D | Technical |

## 39.2 Sub-Core Team

| Sl No. | Name | Class / Batch | Domain / Role |
|:---|:---|:---|:---|
| 1 | Anjali Shaju | S3 CS A | Documentation |
| 2 | Vaishnavi Dev Thekke Veedu | S3 CS D | Creative |
| 3 | Jovit Jerry | S5 CSBS | Creative |
| 4 | Lanet Varghese | S5 CSBS | Operations |
| 5 | Elizabeth Joby | S3 AD | Operations |
| 6 | Avanthika S | S3 AD | Marketing |
| 7 | Krishna Priya K R | S3 AD | Creative |