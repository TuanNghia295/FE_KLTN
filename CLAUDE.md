## MCP & Context Optimization
- **Priority Tooling**: Always prioritize using the `serena` MCP server for context gathering, project indexing, and code search.
- **Token Efficiency**: Before reading multiple files manually with `ls` or `cat`, use `serena`'s search/indexing tools to identify and fetch only the relevant code snippets.
- **Workflow**:
    1. Use `serena` to get a high-level overview of the project structure if not already in context.
    2. Use `serena` to locate specific logic or variable definitions across the codebase instead of broad file reads.
    3. Only request full file content if `serena`'s summaries are insufficient for the task.
- **Context Maintenance**: Use `serena` to update or refresh context when moving between different modules of the project.