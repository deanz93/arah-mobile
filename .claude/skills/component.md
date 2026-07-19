---
name: component
description: Create a new React Native UI component with NativeWind styling and tests
---

# Create React Native Component

## Component template

Create `src/components/[ComponentName]/index.tsx`:

```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface [ComponentName]Props {
  // define props here
}

export function [ComponentName]({ ...props }: [ComponentName]Props) {
  return (
    <View className="flex-1 bg-white dark:bg-gray-900 p-4 rounded-xl">
      {/* NativeWind className for ALL styling */}
    </View>
  );
}
```

## Test template

Create `src/components/[ComponentName]/__tests__/[ComponentName].test.tsx`:

```tsx
import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { [ComponentName] } from '../index';

describe('[ComponentName]', () => {
  it('renders without crash', () => {
    render(<[ComponentName] />);
  });

  it('handles primary interaction', () => {
    const onPress = jest.fn();
    render(<[ComponentName] onPress={onPress} />);
    fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalled();
  });

  it('shows error state when prop passed', () => {
    render(<[ComponentName] error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeTruthy();
  });
});
```

## Rules
- Use NativeWind `className` props only — never StyleSheet.create for layout/color
- min-h-12 min-w-12 on all touchable elements (48dp minimum touch target)
- Include accessibilityLabel on all Touchable elements
- Loading, error, and empty states must all be handled
