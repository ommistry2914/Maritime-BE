# Validation And Access Matrix

## Access Control

| Role | Allowed |
| --- | --- |
| superAdmin | Create/list admins |
| admin | Manage ships, crew, maintenance, drills, compliance |
| crew | Assigned maintenance and assigned drills only |

## Ship Validation

| Field | Rule |
| --- | --- |
| name | required, minimum 2 characters |
| IMO number | required, unique |
| vessel type | required |
| status | operational, maintenance, inactive |

## Maintenance Validation

| Field | Rule |
| --- | --- |
| title | required, minimum 3 characters |
| category | required maritime category |
| component | required |
| ship | valid ship ObjectId |
| assignedTo | valid crew/user ObjectId |
| dueDate | today or future on creation |
| priority | low, medium, high, critical |
| estimatedHours | optional, 0.25 to 500 |
| safetyCritical | boolean |
| status note | required for In Progress or Completed |

Business rules:

- inactive ships cannot receive maintenance tasks.
- tasks can only be assigned to crew/user roles.
- crew can update only assigned tasks.
- completed tasks cannot be reopened by crew.
- overdue and late completed tasks count as compliance risk.

## Safety Drill Validation

| Field | Rule |
| --- | --- |
| title | required, minimum 3 characters |
| drillType | fire, evacuation, manOverboard, abandonShip, medical, other |
| ship | valid ship ObjectId |
| location | required |
| musterStation | required |
| scheduledDate | today or future on creation |
| durationMinutes | 5 to 480 |
| participants | at least one valid crew/user |

Business rules:

- inactive ships cannot receive drills.
- crew can only view assigned drills.
- attendance can be marked only on or after the scheduled date.
- completion requires attendance.
- missed scheduled drills count as compliance risk.

## Compliance Calculation

| Metric | Calculation |
| --- | --- |
| maintenance % | completed maintenance / total maintenance |
| drill % | completed participant assignments / total participant assignments |
| overall % | average of maintenance % and drill % |
| at risk | overdue maintenance, late maintenance, or missed drills exist |
