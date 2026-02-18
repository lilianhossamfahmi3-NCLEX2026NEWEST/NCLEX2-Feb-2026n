---
description: Update the Project Progress Log every 3 steps
---

# Progress Log Update Workflow

This workflow ensures that the `PROGRESS_LOG.md` file is kept up-to-date with the latest developments.

### Steps:
1. **Analyze Recent Work**: Review the last 3 steps of the conversation and identify key features, bugs fixed, or design changes.
2. **Update PROGRESS_LOG.md**:
    - Use `multi_replace_file_content` or `replace_file_content` to update the "Current Status" and "Completed Milestones" sections.
    - Update the "Next Update Due" step count (Current Step + 3).
3. **Verify Compliance**: Ensure the log remains clear, professional, and reflects the current state of the application.

// turbo
4. **Communicate**: Briefly inform the user that the progress log has been updated as per the every-3-steps rule.
