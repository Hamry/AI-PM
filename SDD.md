# SOFTWARE DESIGN DOCUMENT

## **Unmet Needs**
*Why are we doing this? What does the user expect to accomplish that they can't? Why is it important that we fix it for them?*

The aim is to help people better prioritize their tasks and offer a time expectation with little overhead. This allows users to spend more time working instead of planning their next task. People often turn to procrastination when their next step is unclear. 

## **Objectives**
*What do we want to accomplish with this project?*
I want to provide a tool which allows people to go from task to task more quickly.

## **User Persona**
A person who wants to increase productivity. 

## **Jobs we want to cover**
When I \<context>

I want to \<describe user need>

So I can \<describe the reason for the need>

When I have a new task, I want to have it broken down into smaller tasks so I can know what work needs to be done.

When I have a new task, I want a time estimate for the task, so I can work under a time goal. 

When I decide to start a task, I want to have a task recommended to me, so I can focus more energy on the task than the decision for which task to do.

When I finish a task, I want to record how long that task took, so that I can get better predictions on future tasks.



## **Explorations + Decisions**
Start with web app. Main ui should have a todo list, some sort of task selection and task starting. The description of the task should be factored and given a time estimate. The user may also enter a time estimate. All data should be stored somewhere. This will be the basis of the time prediction. I think we should start with API calls to gemini or something before we move to local slm.

### **1. Prioritization & Recommendation Engine**
* **Decision:** Implement a tiered deterministic sorting logic for task recommendations.
* **Logic Flow:** Filter by **Dependencies** (Is it unblocked?) → Sort by **Deadline** (Is it urgent?) → Sort by **Estimated Effort** (Does it fit the current window?).
* **Future Iteration:** Incorporate "Peak Productivity Windows" by analyzing historical velocity data against time-of-day timestamps.

### **2. Estimation & Measurement (The Feedback Loop)**
* **Decision:** Use **Absolute Time (Minutes/Hours)** instead of relative sizing (Story Points).
* **Rationale:** Absolute time facilitates immediate "time-boxing," a proven productivity technique that creates a tangible reference point for the user.
* **Handling Deviations:** * If `Actual Time >> Estimated Time`, the system triggers a "Post-Mortem" prompt. 
    * Options: Categorize as a "Complex Task" (triggering future LLM breakdown), account for "Untracked Breaks," or adjust the user’s "Global Bias Multiplier" for specific task categories.

### **3. Human-in-the-Loop (HITL) Interface**
* **Decision:** The system suggests a "Daily Sprint," but the user retains "Veto Power."
* **Implementation:** Low-friction UI for swapping, removing, or re-ordering tasks. High-visibility "Confirmation" steps for LLM-generated time estimates to ensure user trust and accuracy.

### **4. Technical Architecture & Latency**
* **State Management:** Prioritize **Persistence over Minimal I/O**. Use a database-backed state for the active task timer to ensure data integrity if the session is interrupted.
* **LLM Integration:** Utilize high-speed LLM APIs (e.g., Gemini) for:
    * **Task Factoring:** Breaking "Epic" tasks into sub-tasks.
    * **Categorization:** Labeling tasks (e.g., "Deep Work," "Administrative") to refine future predictions based on historical performance in those categories.
    * **Task Predition:** Embedding and predicting task length based on description and previous tasks.


### **5. The "Pacer" Mechanism (Behavioral Optimization)**
* **Decision:** Implement a dynamic "Push & Backoff" algorithm for task estimates to incrementally improve user velocity.
* **The Push:** The system serves an "Optimistic Estimate" (e.g., $Adjusted Estimate \times 0.97$) to the UI to encourage focus.
* **The Backoff:** * If the user fails to meet the estimate, the system triggers a **"Hard Backoff"** ($1.05 \times$ multiplier) to prevent discouragement.
    * The system analyzes "Failure Clusters"—if a user fails three tasks in a row, the pacer enters a "Recovery Mode" (neutral estimates) for the remainder of the day.
* **The Vector Update:** The system stores the *Actual Time* in the vector database. This ensures the "Push" is always relative to reality, not a recursive loop of shrinking estimates that eventually become impossible.


## **Technical Overview**
Frontend:
S3 + Cloudfront serving compiled typescript react \
Backend:
Lambda functions \
Database: PostgreSQL RDS 

