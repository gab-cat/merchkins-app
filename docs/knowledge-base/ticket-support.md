---
title: Ticket & Support System
description: Creating tickets, priority levels, response guidelines, and resolution workflows.
category: communication
icon: MessageSquare
lastUpdated: 2025-12-12
---

# Ticket & Support System Guide

## Overview

The ticket system helps you manage customer support requests, track issues, and ensure timely responses. Learn how to create, manage, and resolve support tickets.

---

## Quick Reference

| Aspect              | Details                                             |
| ------------------- | --------------------------------------------------- |
| **Ticket Statuses** | OPEN → IN_PROGRESS → RESOLVED → CLOSED              |
| **Priority Levels** | LOW, MEDIUM, HIGH                                   |
| **Update Types**    | Status change, comment, assignment, priority change |
| **Assignment**      | Assign tickets to team members                      |
| **Due Dates**       | Set deadlines for ticket resolution                 |

---

## Ticket Statuses

### Status Flow

Tickets progress through these statuses:

1. **OPEN** - New ticket, awaiting response
2. **IN_PROGRESS** - Ticket is being worked on
3. **RESOLVED** - Issue resolved, awaiting confirmation
4. **CLOSED** - Ticket closed (archived)

### Status Transitions

| Current Status | Allowed Next Statuses            |
| -------------- | -------------------------------- |
| OPEN           | IN_PROGRESS, CLOSED              |
| IN_PROGRESS    | RESOLVED, CLOSED                 |
| RESOLVED       | CLOSED, OPEN (if issue persists) |
| CLOSED         | OPEN (reopen if needed)          |

---

## Priority Levels

### Priority Definitions

**LOW:**

- Non-urgent issues
- General inquiries
- Can be handled when time permits
- No immediate impact

**MEDIUM:**

- Standard support requests
- Moderate urgency
- Should be addressed within business hours
- Some impact on customer

**HIGH:**

- Urgent issues
- Critical problems
- Requires immediate attention
- Significant impact on customer

### Priority Guidelines

**Use HIGH for:**

- Payment issues
- Order problems
- Account access issues
- Critical bugs

**Use MEDIUM for:**

- Product questions
- Feature requests
- General support
- Non-critical issues

**Use LOW for:**

- General inquiries
- Feedback
- Non-urgent questions
- Informational requests

---

## Creating Tickets

### Step 1: Navigate to Tickets

1. Go to Admin → Tickets
2. Click "Create New Ticket"

### Step 2: Ticket Information

**Required Fields:**

- **Title** - Brief description of issue
- **Category** - Ticket category
- **Priority** - LOW, MEDIUM, or HIGH
- **Description** - Detailed issue description

**Optional Fields:**

- **Assignee** - Team member to handle ticket
- **Due Date** - Deadline for resolution
- **Tags** - Tags for organization
- **Related Order** - Link to order (if applicable)

### Step 3: Save Ticket

1. Review ticket information
2. Click "Create Ticket"
3. Ticket created with OPEN status
4. Assignee notified (if assigned)

---

## Managing Tickets

### Viewing Tickets

**Ticket List:**

- View all tickets
- Filter by status, priority, assignee
- Search by title, description
- Sort by date, priority

**Ticket Details:**

- Full ticket information
- Status and priority
- Assignment details
- Update history
- Comments and notes

### Updating Ticket Status

**Change Status:**

1. Open ticket details
2. Click "Update Status"
3. Select new status
4. Add optional comment
5. Save changes

**Status Change Tracking:**

- All status changes are logged
- Includes who changed it and when
- Comments recorded with changes

---

## Ticket Updates

### Update Types

**Status Change:**

- Change ticket status
- Add reason for change
- Logged in ticket history

**Comment:**

- Add comment or note
- Visible to team members
- Can include attachments
- Timestamped

**Assignment:**

- Assign ticket to team member
- Reassign if needed
- Notify assignee

**Priority Change:**

- Change priority level
- Add reason for change
- Logged in history

**Escalation:**

- Escalate to higher priority
- Notify supervisors
- Track escalation reason

---

## Ticket Assignment

### Assigning Tickets

**Manual Assignment:**

1. Open ticket details
2. Click "Assign To"
3. Select team member
4. Save assignment

**Auto-Assignment:**

- Can be assigned during creation
- Based on ticket category
- Round-robin assignment (if configured)

### Reassigning Tickets

**Reassignment:**

1. Open ticket details
2. Click "Reassign"
3. Select new assignee
4. Add reason (optional)
5. Save changes

**Reassignment Reasons:**

- Original assignee unavailable
- Requires different expertise
- Workload balancing
- Escalation

---

## Ticket Comments

### Adding Comments

**Internal Comments:**

- Visible to team members only
- Use for team communication
- Track progress and notes

**Customer Comments:**

- Visible to customer
- Use for customer communication
- Provide updates and solutions

**Comment Guidelines:**

1. **Be Clear** - Write clear, concise comments
2. **Be Professional** - Maintain professional tone
3. **Be Helpful** - Provide useful information
4. **Be Timely** - Respond promptly
5. **Be Complete** - Include all relevant details

---

## Ticket Resolution

### Resolving Tickets

**Resolution Process:**

1. Work on ticket issue
2. Update status to IN_PROGRESS
3. Resolve the issue
4. Update status to RESOLVED
5. Add resolution notes
6. Wait for customer confirmation
7. Close ticket when confirmed

**Resolution Notes:**

- Document solution
- Include steps taken
- Note any follow-up needed
- Helpful for similar future issues

### Closing Tickets

**Closing Process:**

1. Ticket resolved and confirmed
2. Update status to CLOSED
3. Add closing notes
4. Archive ticket

**Reopening Tickets:**

- Can reopen CLOSED tickets
- If issue persists or recurs
- Change status back to OPEN
- Add reason for reopening

---

## Ticket Analytics

### Key Metrics

Track ticket performance:

- **Total Tickets** - Count of all tickets
- **Open Tickets** - Currently open tickets
- **Resolved Tickets** - Successfully resolved
- **Average Resolution Time** - Time to resolve
- **By Priority** - Tickets by priority level
- **By Status** - Tickets by status
- **By Assignee** - Tickets per team member

### Reports

Generate reports for:

- Ticket volume trends
- Resolution time analysis
- Team performance
- Category breakdown
- Priority distribution

---

## Common Scenarios

### Scenario 1: Customer Reports Order Issue

**Flow:**

1. Customer creates ticket
2. Ticket assigned to support team
3. Priority set to HIGH (order issue)
4. Team investigates order
5. Update ticket with findings
6. Resolve issue (refund, replacement, etc.)
7. Mark as RESOLVED
8. Close after confirmation

---

### Scenario 2: General Product Question

**Flow:**

1. Customer creates ticket
2. Priority set to MEDIUM
3. Support team responds
4. Provide product information
5. Mark as RESOLVED
6. Close ticket

---

### Scenario 3: Escalation Needed

**Flow:**

1. Ticket created with MEDIUM priority
2. Issue more complex than expected
3. Escalate to HIGH priority
4. Reassign to senior team member
5. Resolve escalated issue
6. Document resolution

---

### Scenario 4: Reopened Ticket

**Flow:**

1. Ticket previously CLOSED
2. Customer reports issue persists
3. Reopen ticket (OPEN status)
4. Investigate further
5. Resolve underlying issue
6. Close again after confirmation

---

## Best Practices

### Ticket Management

1. **Respond Promptly** - Acknowledge tickets quickly
2. **Set Priorities Correctly** - Use appropriate priority levels
3. **Assign Appropriately** - Assign to right team members
4. **Update Regularly** - Keep tickets updated with progress
5. **Close Properly** - Close tickets only when fully resolved

### Communication

1. **Clear Communication** - Write clear, helpful comments
2. **Professional Tone** - Maintain professional language
3. **Timely Updates** - Provide regular updates to customers
4. **Complete Information** - Include all relevant details
5. **Follow Up** - Follow up on resolved tickets

### Resolution

1. **Document Solutions** - Record how issues were resolved
2. **Learn from Patterns** - Identify common issues
3. **Improve Processes** - Use insights to improve
4. **Train Team** - Share knowledge from resolutions
5. **Prevent Recurrence** - Address root causes

---

## Frequently Asked Questions

### Q: How do I prioritize tickets?

**A:** Use HIGH for urgent issues (payments, orders), MEDIUM for standard requests, LOW for non-urgent inquiries.

### Q: Can I reassign tickets?

**A:** Yes, you can reassign tickets to different team members. Add a reason for reassignment.

### Q: What's the difference between RESOLVED and CLOSED?

**A:** RESOLVED means the issue is fixed but awaiting confirmation. CLOSED means the ticket is archived and complete.

### Q: Can customers create tickets?

**A:** Yes, customers can create tickets through the support system. They appear in your ticket list.

### Q: How do I track ticket performance?

**A:** Use the Analytics section to view metrics like resolution time, ticket volume, and team performance.

### Q: Can I link tickets to orders?

**A:** Yes, you can link tickets to related orders when creating or editing tickets.

---

## Related Articles

- [Order Management](./order-management.md)
- [Announcements](./announcements.md)



