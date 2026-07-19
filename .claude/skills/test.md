---
name: test
description: Add or fix tests for a React Native component or screen
---

# Testing in arah-mobile

## Test runner
```bash
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm test -- --testPathPattern=ComponentName  # Single file
```

## Test patterns

### Component test
```tsx
import { render, screen, fireEvent } from '@testing-library/react-native';

it('renders correctly', () => {
  render(<MyComponent title="Test" />);
  expect(screen.getByText('Test')).toBeTruthy();
});
```

### Async / loading test
```tsx
it('shows loading then data', async () => {
  render(<MyScreen />);
  expect(screen.getByTestId('skeleton')).toBeTruthy();
  await screen.findByText('Loaded content');
});
```

### Navigation test
```tsx
import { renderWithNavigation } from '../__tests__/utils/renderWithNavigation';

it('navigates to detail on press', () => {
  const { navigate } = renderWithNavigation(<MyScreen />);
  fireEvent.press(screen.getByText('Open'));
  expect(navigate).toHaveBeenCalledWith('Detail', expect.any(Object));
});
```

## What every PR must include
- [ ] New component → test file at `__tests__/ComponentName.test.tsx`
- [ ] New screen → smoke test at `__tests__/screens/ScreenName.smoke.test.tsx`
- [ ] All existing tests still pass: `npm test`
