# Requirements Document

## Introduction

The Routine Schedule Management feature adds fixed, recurring vehicle schedules to the HU-VMS (Haramaya University Vehicle Management System). Two schedule types are supported:

- **EMPLOYEE_SHUTTLE**: A fixed daily route that transports university employees on morning and afternoon shifts. The system automates driver reminders, vehicle status transitions, and trip log creation.
- **ADMIN_ASSIGNED**: A vehicle permanently reserved for a specific administrator. The vehicle is hidden from general allocation and is automatically prioritised when that administrator submits a vehicle request.

The feature is managed exclusively by the Transport Officer and integrates with the existing vehicle, driver, user, and notification infrastructure without modifying any existing APIs or UI.

---

## Glossary

- **Routine_Schedule**: A persistent, recurring vehicle assignment record of type `EMPLOYEE_SHUTTLE` or `ADMIN_ASSIGNED`.
- **Routine_Trip_Log**: An immutable record of a single shuttle trip execution (start time, end time, driver, vehicle, shift).
- **Routine_Scheduler**: The server-side cron service that fires reminders and triggers automatic vehicle status transitions.
- **Transport_Officer**: The system user with role `TRANSPORT` who creates and manages routine schedules.
- **Driver**: A system user with role `DRIVER` who is assigned to a routine schedule and executes shuttle trips.
- **Administrator**: A system user with role `USER` who may be assigned as the beneficiary of an `ADMIN_ASSIGNED` schedule.
- **Shift**: Either `morning` or `afternoon`, each with a configured departure time (HH:MM, Africa/Addis_Ababa timezone).
- **Overlap**: Two active routine schedules that reference the same vehicle at the same time.
- **Reminder_Window**: The configurable number of minutes before a shift departure at which the Driver receives a notification.

---

## Requirements

### Requirement 1: Create Routine Schedule

**User Story:** As a Transport Officer, I want to create a routine schedule for a vehicle and driver, so that recurring transportation needs are handled automatically without manual daily intervention.

#### Acceptance Criteria

1. WHEN the Transport Officer submits a new routine schedule, THE Routine_Schedule SHALL be persisted with fields: `scheduleType` (`EMPLOYEE_SHUTTLE` | `ADMIN_ASSIGNED`), `vehicle` (ObjectId ref), `driver` (ObjectId ref), `status` (`active` | `inactive`), `routeName`, `createdBy`, and audit timestamps (`createdAt`, `updatedAt`).
2. WHEN `scheduleType` is `EMPLOYEE_SHUTTLE`, THE Routine_Schedule SHALL require both `morningDepartureTime` and `afternoonDepartureTime` in HH:MM format where HH is 00–23 and MM is 00–59; any value outside these bounds SHALL be rejected with a 400 validation error.
3. WHEN `scheduleType` is `ADMIN_ASSIGNED`, THE Routine_Schedule SHALL require `assignedAdministrator` to be a valid ObjectId referencing an existing User with role `USER`; if the referenced user does not exist or has a different role, THE System SHALL reject the request with a 400 validation error.
4. IF the referenced driver does not exist in the system, THEN THE System SHALL reject the request with a 400 error indicating the driver was not found.
5. IF the referenced driver exists but their role is not `DRIVER`, THEN THE System SHALL reject the request with a 400 validation error identifying the role mismatch.
6. IF the referenced vehicle does not exist in the system, THEN THE System SHALL reject the request with a 400 error indicating the vehicle was not found.
7. IF a vehicle already belongs to another active routine schedule, THEN THE System SHALL reject the request with a 409 conflict error that includes the ID and name of the conflicting schedule.
8. IF `routeName` is absent or empty, or if `scheduleType` is not one of `EMPLOYEE_SHUTTLE` or `ADMIN_ASSIGNED`, THEN THE System SHALL reject the request with a 400 validation error identifying the invalid field.
9. THE Routine_Schedule SHALL be created with `status` set to `active` by default.
10. WHEN a routine schedule is successfully created, THE System SHALL return a 201 response populated with the full vehicle reference (plate, model), driver reference (name, employeeId), and `assignedAdministrator` reference (name, email) if present; absent optional references SHALL be returned as `null`.

---

### Requirement 2: Retrieve Routine Schedules

**User Story:** As a Transport Officer, I want to view all routine schedules, so that I can monitor and manage recurring vehicle assignments.

#### Acceptance Criteria

1. WHEN the Transport Officer requests the list of routine schedules, THE System SHALL return all Routine_Schedule records sorted by `createdAt` descending, each populated with vehicle (plate, model), driver (name, employeeId), and assignedAdministrator (name, email) details.
2. WHEN the Transport Officer requests a single routine schedule by a valid ObjectId, THE System SHALL return the full populated Routine_Schedule.
3. IF a single routine schedule is requested by a valid ObjectId that does not match any record, THEN THE System SHALL return a 404 error.
4. IF a single routine schedule is requested by a value that is not a valid ObjectId, THEN THE System SHALL return a 400 error.
5. WHEN the Transport Officer filters the schedule list by `scheduleType` or `status` query parameters, THE System SHALL return only records matching all supplied filter values.
6. IF a `scheduleType` or `status` filter value is not one of the defined enum values, THEN THE System SHALL return a 400 error identifying the invalid parameter.

---

### Requirement 3: Update and Deactivate Routine Schedule

**User Story:** As a Transport Officer, I want to update or deactivate a routine schedule, so that I can respond to operational changes without deleting historical data.

#### Acceptance Criteria

1. WHEN the Transport Officer updates a routine schedule, THE System SHALL apply changes only to the allowed fields: `routeName`, `vehicle`, `driver`, `morningDepartureTime`, `afternoonDepartureTime`, `assignedAdministrator`, and `status`; any other fields in the request body SHALL be ignored.
2. IF the routine schedule ID does not exist, THEN THE System SHALL return a 404 error.
3. IF the updated driver's role is not `DRIVER`, THEN THE System SHALL reject the update with a 400 validation error.
4. IF the updated vehicle would create an overlap with another active routine schedule (excluding the current schedule), THEN THE System SHALL reject the update with a 409 conflict error.
5. WHEN a routine schedule's `status` is set to `inactive`, THE Routine_Scheduler SHALL stop firing reminders and automatic status transitions for that schedule on subsequent cron evaluations.
6. WHEN a routine schedule's `status` is set back to `active`, THE Routine_Scheduler SHALL resume firing reminders and automatic status transitions for that schedule on subsequent cron evaluations.
7. WHEN a routine schedule is deactivated, THE System SHALL preserve all existing Routine_Trip_Log records associated with that schedule without modification.

---

### Requirement 4: Delete Routine Schedule

**User Story:** As a Transport Officer, I want to delete a routine schedule that is no longer needed, so that the schedule list remains clean and accurate.

#### Acceptance Criteria

1. WHEN the Transport Officer deletes a routine schedule, THE System SHALL remove the Routine_Schedule record and return a 200 response confirming deletion.
2. WHEN a routine schedule is deleted, THE System SHALL preserve all associated Routine_Trip_Log records; their `schedule` reference field SHALL be retained as-is for historical reference.
3. IF the routine schedule ID does not exist, THEN THE System SHALL return a 404 error.
4. IF a routine schedule has an associated Routine_Trip_Log with `status` of `in_progress`, THEN THE System SHALL reject the deletion with a 409 conflict error indicating an active trip is in progress.
5. WHEN a routine schedule is deleted, THE Routine_Scheduler SHALL stop processing that schedule on subsequent cron evaluations.

---

### Requirement 5: Automated Driver Reminders

**User Story:** As a Driver assigned to an EMPLOYEE_SHUTTLE schedule, I want to receive automated reminders before each shift departure, so that I am prepared and on time.

#### Acceptance Criteria

1. WHEN the Routine_Scheduler evaluates an active `EMPLOYEE_SHUTTLE` schedule and the scheduled departure time is ≤30 minutes and >0 minutes away (Africa/Addis_Ababa), AND no reminder of type `routine_reminder` for the same schedule and shift has been sent on the current calendar day, THEN THE System SHALL create a Notification record for the assigned Driver containing the scheduled departure time (HH:MM), vehicle plate number, and route name.
2. THE Notification record created for a driver reminder SHALL have `type` set to `routine_reminder` as defined in Requirement 12.4.
3. THE Routine_Scheduler SHALL evaluate reminder conditions for both `morning` and `afternoon` shifts of every active `EMPLOYEE_SHUTTLE` schedule.
4. IF a reminder notification for the same schedule and shift has already been sent on the current calendar day (Africa/Addis_Ababa), THEN THE System SHALL not create a duplicate Notification record.
5. IF an active `EMPLOYEE_SHUTTLE` schedule has no assigned Driver at the time of reminder evaluation, THEN THE System SHALL log a warning and skip reminder creation for that schedule without throwing an error.
6. THE Routine_Scheduler SHALL evaluate reminder conditions every minute using a cron job.

---

### Requirement 6: Automatic Vehicle Status Transitions

**User Story:** As a Transport Officer, I want vehicle statuses to update automatically at shift departure times, so that the fleet status always reflects real-world operations.

#### Acceptance Criteria

1. WHEN the Routine_Scheduler evaluates an active `EMPLOYEE_SHUTTLE` schedule and the current time (Africa/Addis_Ababa) matches the shift departure time within the same minute, AND the vehicle status transition for that schedule and shift has not already been applied on the current calendar day, THEN THE System SHALL update the associated Vehicle's `status` from `available` to `in-use`.
2. WHEN the assigned Driver marks a routine trip as completed, THE System SHALL update the associated Vehicle's `status` from `in-use` to `available`.
3. IF the Vehicle's current `status` is not `available` at the scheduled departure time, THEN THE System SHALL create a Notification for the Transport Officer identifying the vehicle and schedule, and SHALL leave the vehicle `status` unchanged.

---

### Requirement 7: Driver Trip Start and Completion

**User Story:** As a Driver assigned to an EMPLOYEE_SHUTTLE schedule, I want to start and complete my routine trips, so that accurate trip logs are maintained.

#### Acceptance Criteria

1. WHEN the assigned Driver starts a routine trip, AND no Routine_Trip_Log with `status` `in_progress` already exists for the same schedule, shift, and current calendar day (Africa/Addis_Ababa), THEN THE System SHALL create a Routine_Trip_Log record with fields: `schedule` (ref), `vehicle` (ref), `driver` (ref), `shift` (`morning` | `afternoon`), `scheduledDepartureTime`, `actualStartTime` (current UTC timestamp), and `status` set to `in_progress`.
2. IF a Routine_Trip_Log with `status` `in_progress` already exists for the same schedule, shift, and current calendar day, THEN THE System SHALL reject the start request with a 409 conflict error.
3. WHEN the assigned Driver completes a routine trip, AND the Routine_Trip_Log's current `status` is `in_progress`, THEN THE System SHALL update the record with `actualEndTime` (current UTC timestamp) and set `status` to `completed`.
4. IF the Driver attempts to complete a Routine_Trip_Log whose `status` is not `in_progress`, THEN THE System SHALL reject the request with a 409 conflict error.
5. IF a user other than the assigned Driver attempts to start or complete a routine trip, THEN THE System SHALL reject the action with a 403 error.
6. IF the Driver attempts to start a trip on a routine schedule whose `status` is `inactive`, THEN THE System SHALL reject the request with a 400 error.
7. WHEN a routine trip is completed, THE System SHALL update the Vehicle's `status` to `available` as specified in Requirement 6.2.
8. THE System SHALL allow the Driver to retrieve their own Routine_Trip_Log records with `status` `in_progress` or `completed` within the last 7 days, capped at 50 records sorted by `actualStartTime` descending.

---

### Requirement 8: Trip Log History

**User Story:** As a Transport Officer, I want to view the trip log history for any routine schedule, so that I can audit shuttle operations and driver performance.

#### Acceptance Criteria

1. WHEN the Transport Officer requests trip logs for a specific routine schedule, THE System SHALL return all Routine_Trip_Log records for that schedule sorted by `actualStartTime` descending; records with a null `actualStartTime` (i.e., `in_progress` trips not yet started) SHALL sort after all completed records.
2. IF the routine schedule ID does not exist, THEN THE System SHALL return a 404 error.
3. THE System SHALL populate each Routine_Trip_Log with vehicle (plate, model) and driver (name, employeeId) details.
4. WHEN the Transport Officer filters trip logs by `shift` or `status` query parameters, THE System SHALL return only records matching all supplied filter values; valid values for `shift` are `morning` and `afternoon`, and valid values for `status` are `in_progress` and `completed`.
5. IF a `shift` or `status` filter value is not one of the defined valid values, THEN THE System SHALL return a 400 error identifying the invalid parameter.

---

### Requirement 9: ADMIN_ASSIGNED Vehicle Reservation

**User Story:** As a Transport Officer, I want vehicles assigned to administrators to be protected from general allocation, so that administrators always have their reserved vehicle available.

#### Acceptance Criteria

1. WHILE a Vehicle is referenced by an active `ADMIN_ASSIGNED` Routine_Schedule, THE System SHALL exclude that Vehicle from the vehicles endpoint response when the vehicle's `status` is `available` and the caller has not explicitly opted out of routine filtering; the response for all other callers SHALL be identical to pre-feature behavior when `excludeRoutine` is not supplied.
2. WHEN an Administrator submits a vehicle request and the Administrator has an active `ADMIN_ASSIGNED` schedule whose reserved vehicle has `status` `available`, THEN THE System SHALL automatically assign that reserved vehicle to the request, bypassing the normal allocation queue.
3. IF the Administrator's reserved vehicle has a `status` other than `available` at the time of the request, THEN THE System SHALL fall back to the standard allocation process and create a Notification for the Transport Officer identifying the Administrator and indicating that the reserved vehicle was unavailable.
4. WHEN a caller supplies `excludeRoutine=true` as a query parameter on the vehicles endpoint, THE System SHALL exclude all vehicles referenced by active `ADMIN_ASSIGNED` Routine_Schedules from the response, regardless of the caller's role.

---

### Requirement 10: Role-Based Access Control

**User Story:** As a system administrator, I want routine schedule management to be restricted to authorised roles, so that only the Transport Officer can create and manage schedules.

#### Acceptance Criteria

1. THE System SHALL restrict all create, update, and delete operations on Routine_Schedule records to authenticated users with role `TRANSPORT`.
2. THE System SHALL restrict the start and complete trip actions on Routine_Trip_Log records to the Driver whose `_id` matches the `driver` field of the corresponding Routine_Schedule.
3. IF an unauthenticated user attempts any action on routine schedule or trip log endpoints, THEN THE System SHALL return a 401 Unauthorized response.
4. IF an authenticated user with a role other than `TRANSPORT` attempts a create, update, or delete operation on Routine_Schedule records, THEN THE System SHALL return a 403 Forbidden response.
5. THE System SHALL allow authenticated Drivers to read only their own assigned routine schedules and their own Routine_Trip_Log records; attempts to read another Driver's records SHALL return a 403 Forbidden response.
6. THE System SHALL allow authenticated Administrators to read the Routine_Schedule record for which they are the `assignedAdministrator`.
7. THE System SHALL allow authenticated Transport Officers to read all routine schedules and all Routine_Trip_Log records.

---

### Requirement 11: Scheduler Initialisation

**User Story:** As a system operator, I want the routine scheduler to start automatically when the server starts, so that no manual intervention is needed after deployment.

#### Acceptance Criteria

1. WHEN the server successfully connects to MongoDB, THE System SHALL automatically start all routine scheduler cron jobs without requiring manual intervention.
2. WHEN the routine scheduler cron jobs have started successfully, THE System SHALL write a confirmation message to the server console indicating that the scheduler is running.
3. IF the routine scheduler fails to initialise at startup (e.g., due to a configuration error), THEN THE System SHALL log the error to the server console and continue the server startup process; the failure SHALL not prevent the server from accepting other requests.
4. IF the Routine_Scheduler encounters an error during a cron execution, THEN THE System SHALL log the error to the server console and continue running; subsequent scheduled cron executions SHALL still fire as planned.

---

### Requirement 12: Non-Interference with Existing Features

**User Story:** As a system operator, I want the routine schedule feature to integrate cleanly with the existing system, so that no existing functionality is broken.

#### Acceptance Criteria

1. THE System SHALL not modify any existing API route handlers, request models, vehicle models, or user models; the only permitted addition to an existing endpoint is the optional `excludeRoutine` query parameter on the vehicles endpoint, whose absence SHALL leave the endpoint response identical to its pre-feature behavior.
2. THE System SHALL not alter any existing frontend pages, components, or routes; the only permitted frontend additions are: the Routine Schedule list page, the Create/Edit Routine Schedule page, the Driver Routine Trip page, and a single sidebar navigation entry linking to the schedule list.
3. WHEN the routine scheduler updates a Vehicle's `status`, THE System SHALL use only the existing `status` field values (`available`, `in-use`) without introducing new status values.
4. THE System SHALL use the existing Notification model to deliver driver reminders; the existing `type` enum values (`vehicle_request`, `request_approved`, `request_rejected`, `maintenance_alert`, `fuel_alert`) SHALL be preserved, and `routine_reminder` SHALL be added as a new allowed value.
