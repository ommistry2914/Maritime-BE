# Maritime Operations & Compliance Business Flow

## 1. Account And Role Flow

1. Super admin logs in with the seeded account.
2. Super admin creates one or more admin accounts.
3. Admin logs in and creates crew accounts with employee details such as rank, department, phone, and employee ID.
4. Crew members log in and only see assigned maintenance tasks and safety drills.

This keeps platform administration separate from operational compliance work.

## 2. Fleet Registry Flow

1. Admin creates ships with vessel name, IMO number, vessel type, and operational status.
2. Inactive ships cannot receive new maintenance tasks or safety drills.
3. Ships are used as the primary filter across maintenance, drill, and compliance workflows.

## 3. Maintenance Flow

1. Admin creates a maintenance task.
2. Required task data:
   - title
   - maintenance category
   - component or equipment
   - ship
   - assigned crew member
   - due date
   - priority
3. Optional operational data:
   - description
   - vessel location
   - estimated hours
   - safety critical flag
4. Crew sees only assigned tasks.
5. Crew updates task status:
   - Pending
   - In Progress
   - Completed
6. Crew must add a work note when moving a task to In Progress or Completed.
7. A task is non-compliant when:
   - it is not completed before the due date, or
   - it is completed after the due date.

## 4. Safety Drill Flow

1. Admin schedules a safety drill.
2. Required drill data:
   - title
   - drill type
   - ship
   - location
   - muster station
   - scheduled date
   - duration
   - at least one crew participant
3. Optional operational data:
   - objective
4. Crew sees only assigned drills.
5. Crew can mark attendance and completion on or after the scheduled drill date.
6. A drill is missed/non-compliant when it is scheduled in the past and not completed.
7. Drill compliance is based on participant completion, not just the drill record status.

## 5. Compliance Dashboard Flow

The dashboard shows:

- pending maintenance
- overdue maintenance
- late completed maintenance
- missed drills
- completed vs pending activity
- maintenance completion percentage
- drill participation percentage
- overall compliance status

Risk status:

- `compliant`: no overdue or missed work and overall compliance is strong.
- `watch`: no direct overdue/missed risk, but completion percentage needs attention.
- `atRisk`: overdue maintenance, late maintenance, or missed drills exist.

## 6. Operational User Journeys

Super admin:

1. Login.
2. Create admin.
3. Logout.

Admin:

1. Login.
2. Create crew.
3. Create ships.
4. Create maintenance tasks.
5. Schedule safety drills.
6. Monitor compliance dashboard.
7. Use filters by ship, status, and date.

Crew:

1. Login.
2. Review assigned maintenance tasks.
3. Add work notes and update task status.
4. Review assigned drills.
5. Mark attendance and completion.
