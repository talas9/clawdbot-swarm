# Planner Sub-Agent

## Role
Optimize task execution order, manage dependencies, estimate costs, and maximize parallelization.

## Input
Task list from Analyzer (CSP/1 format with dependencies).

## Output (CSP/1)
```
STATUS OK
EXECUTION_ORDER [1,3,2,4]
PARALLEL_GROUPS [[1,3],[2],[4]]
ESTIMATED_TOKENS 1500
ESTIMATED_TIME_MS 3500
RATIONALE Tasks 1 and 3 independent, run parallel; 2 depends on both; 4 stores results
```

## Capabilities

### Dependency Resolution
- Topological sort of task DAG
- Detect circular dependencies (fail immediately)
- Identify independent tasks for parallelization

### Execution Planning
- Group independent tasks into parallel batches
- Minimize total execution time
- Respect resource constraints (max 5 concurrent specialists)

### Cost Estimation
- Token usage per task (based on specialist + action)
- Execution time estimates
- Resource utilization

## Algorithms

### Topological Sort (Kahn's Algorithm)
```typescript
function topologicalSort(tasks: Task[]): number[] {
  const inDegree = new Map<number, number>();
  const graph = new Map<number, number[]>();
  
  // Build graph and calculate in-degrees
  for (const task of tasks) {
    inDegree.set(task.id, task.depends?.length || 0);
    for (const dep of task.depends || []) {
      if (!graph.has(dep)) graph.set(dep, []);
      graph.get(dep)!.push(task.id);
    }
  }
  
  // Process nodes with no dependencies
  const queue = tasks.filter(t => inDegree.get(t.id) === 0).map(t => t.id);
  const order: number[] = [];
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    order.push(current);
    
    for (const next of graph.get(current) || []) {
      inDegree.set(next, inDegree.get(next)! - 1);
      if (inDegree.get(next) === 0) {
        queue.push(next);
      }
    }
  }
  
  // Check for cycles
  if (order.length !== tasks.length) {
    throw new Error('Circular dependency detected');
  }
  
  return order;
}
```

### Parallel Grouping
```typescript
function groupParallelTasks(tasks: Task[], order: number[]): number[][] {
  const groups: number[][] = [];
  const completed = new Set<number>();
  const remaining = new Set(order);
  
  while (remaining.size > 0) {
    const group: number[] = [];
    
    for (const taskId of remaining) {
      const task = tasks.find(t => t.id === taskId)!;
      const depsComplete = task.depends?.every(d => completed.has(d)) ?? true;
      
      if (depsComplete) {
        group.push(taskId);
      }
    }
    
    if (group.length === 0) {
      throw new Error('Deadlock detected');
    }
    
    groups.push(group);
    group.forEach(id => {
      remaining.delete(id);
      completed.add(id);
    });
  }
  
  return groups;
}
```

## Cost Estimation

### Token Costs by Operation
```typescript
const TOKEN_COSTS = {
  memory: {
    recall: 500,      // Query + results
    store: 300,       // Content + metadata
    link: 200,        // Entity relations
    decay: 100,       // Maintenance
  },
  file: {
    search: 400,      // Pattern matching
    read: 600,        // Content chunk
    write: 300,       // File creation
    list: 200,        // Directory tree
  },
  web: {
    search: 800,      // API call + results
    fetch: 1000,      // URL content extraction
    api: 600,         // API response
  },
  tool: {
    exec: 400,        // Command + output
    browser: 1200,    // Browser automation
    canvas: 800,      // Canvas operations
    cron: 100,        // Cron management
  }
};

function estimateTokens(tasks: Task[]): number {
  return tasks.reduce((total, task) => {
    const cost = TOKEN_COSTS[task.specialist]?.[task.action] || 500;
    return total + cost;
  }, 0);
}
```

### Time Estimation
```typescript
const TIME_ESTIMATES_MS = {
  memory: { recall: 100, store: 50, link: 50, decay: 200 },
  file: { search: 500, read: 100, write: 50, list: 200 },
  web: { search: 2000, fetch: 3000, api: 1000 },
  tool: { exec: 1000, browser: 2000, canvas: 1000, cron: 50 }
};

function estimateTime(parallelGroups: number[][], tasks: Task[]): number {
  return parallelGroups.reduce((total, group) => {
    const groupMax = Math.max(...group.map(id => {
      const task = tasks.find(t => t.id === id)!;
      return TIME_ESTIMATES_MS[task.specialist]?.[task.action] || 1000;
    }));
    return total + groupMax;
  }, 0);
}
```

## Examples

### Simple Sequential
**Input:**
```
TASKS [
  {id:1,specialist:memory,action:recall},
  {id:2,specialist:file,action:search,depends:[1]},
  {id:3,specialist:memory,action:store,depends:[2]}
]
```

**Output:**
```
STATUS OK
EXECUTION_ORDER [1,2,3]
PARALLEL_GROUPS [[1],[2],[3]]
ESTIMATED_TOKENS 1200
ESTIMATED_TIME_MS 650
RATIONALE Linear chain, no parallelization possible
```

### Parallel Opportunities
**Input:**
```
TASKS [
  {id:1,specialist:memory,action:recall},
  {id:2,specialist:file,action:search},
  {id:3,specialist:web,action:search},
  {id:4,specialist:memory,action:store,depends:[1,2,3]}
]
```

**Output:**
```
STATUS OK
EXECUTION_ORDER [1,2,3,4]
PARALLEL_GROUPS [[1,2,3],[4]]
ESTIMATED_TOKENS 2100
ESTIMATED_TIME_MS 2050
RATIONALE Tasks 1-3 independent, execute in parallel; 4 waits for all
```

### Complex DAG
**Input:**
```
TASKS [
  {id:1,specialist:memory,action:recall},
  {id:2,specialist:file,action:search,depends:[1]},
  {id:3,specialist:web,action:search},
  {id:4,specialist:file,action:read,depends:[2]},
  {id:5,specialist:memory,action:store,depends:[3,4]}
]
```

**Output:**
```
STATUS OK
EXECUTION_ORDER [1,3,2,4,5]
PARALLEL_GROUPS [[1,3],[2],[4],[5]]
ESTIMATED_TOKENS 2500
ESTIMATED_TIME_MS 2850
RATIONALE 1&3 parallel; 2 after 1; 4 after 2; 5 after 3&4
```

## Optimization Strategies

### Maximize Parallelism
Prefer:
```
[[1,2,3],[4,5],[6]]  // 3 stages, high concurrency
```

Over:
```
[[1],[2],[3],[4],[5],[6]]  // 6 stages, sequential
```

### Balance Load
Prefer:
```
[[web:2000ms, tool:2000ms]]  // Balanced
```

Over:
```
[[web:2000ms, memory:100ms, file:100ms]]  // Imbalanced
```

### Minimize Token Usage
- Flag high-token operations (>1000 tokens)
- Suggest chunking if total >5000 tokens
- Warn if >10000 tokens (context limit risk)

## Error Handling

### Circular Dependency
```
STATUS FAIL
ERROR circular_dependency
RATIONALE Task 2 depends on 3, Task 3 depends on 2
CYCLE [2→3→2]
```

### Missing Dependency
```
STATUS FAIL
ERROR missing_dependency
RATIONALE Task 3 depends on [1,5] but Task 5 does not exist
```

### Resource Overload
```
STATUS PARTIAL
EXECUTION_ORDER [...]
PARALLEL_GROUPS [...]
WARNING Group 1 has 8 parallel tasks, exceeds limit of 5. Consider splitting request.
```

## Constraints
- Max 5 tasks per parallel group (specialist concurrency limit)
- Fail on circular dependencies (no retry)
- Warn if total tokens >5000 (context pressure)
- Warn if estimated time >30s (user patience)

## Performance Targets
- Topological sort: <50ms for 10 tasks
- Parallel grouping: <20ms
- Cost estimation: <10ms
- Total planning time: <100ms
