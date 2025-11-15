# Contributing to Bokata Agent

Thank you for your interest in contributing to Bokata Agent!

## Development Setup

1. Clone the repository
```bash
git clone https://github.com/abrahamvallez/bokata-agent.git
cd bokata-agent
```

2. Install dependencies
```bash
npm install
```

3. Create `.env` file
```bash
cp .env.example .env
# Add your ANTHROPIC_API_KEY
```

4. Build the project
```bash
npm run build
```

## Project Structure

```
src/
├── agents/         # Specialized agents (add new agents here)
├── orchestrator/   # LangGraph coordination
├── api/           # External API interface
├── types/         # TypeScript type definitions
├── prompts/       # Agent prompts and methodologies
└── utils/         # Utility functions
```

## Adding a New Agent

1. Create a new file in `src/agents/`
2. Extend `BaseAgent` class
3. Implement the `execute()` method
4. Add your agent to `src/agents/index.ts`
5. Register in the orchestrator if needed

Example:

```typescript
import { BaseAgent } from './base-agent';
import { AgentConfig } from '../types';

export class MyNewAgent extends BaseAgent {
  constructor(config: AgentConfig) {
    super(config);
  }

  async execute(input: any): Promise<any> {
    this.log('Starting my agent');
    // Your logic here
    return result;
  }
}
```

## Testing

```bash
npm test
```

## Code Style

- Use TypeScript
- Follow existing code style
- Run `npm run lint` before committing
- Run `npm run format` to auto-format code

## Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Commit Messages

Follow conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Example:
```
feat: add new decomposition strategy for microservices
```

## Adding New Decomposition Strategies

To add a new decomposition strategy:

1. Add the strategy to `DecompositionStrategy` enum in `src/types/index.ts`
2. Document the strategy in `src/prompts/hamburger-method.ts`
3. Update tests to cover the new strategy

## Documentation

- Update README.md for user-facing changes
- Add JSDoc comments to new public APIs
- Include examples in `examples/` directory

## Questions?

Open an issue with the `question` label.

## License

By contributing, you agree that your contributions will be licensed under the GPL-3.0 License.
