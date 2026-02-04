# Contributing

Thanks for contributing!

## Branching workflow

- `main`: always stable and releasable.
- `development`: integration branch for upcoming work.
- `feature/<short-name>`: create from `development`, merge back into `development` via PR or merge commit.
- Releases: merge `development` into `main`, then optionally tag a release.

## Suggested process

1. Create a feature branch from `development`.
2. Keep changes focused and small when possible.
3. Open a PR into `development` and request review.
4. After review, merge into `development`.
5. When ready to release, open a PR from `development` to `main`.

## Quality checks

- Run tests if available.
- Verify the change in the UI or with relevant checks.
