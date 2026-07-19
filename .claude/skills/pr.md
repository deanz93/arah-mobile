---
name: pr
description: Pre-PR checklist for arah-mobile
---

# Pre-PR Checklist — arah-mobile

Run these before opening a PR:

```bash
npm run typecheck     # Zero TypeScript errors
npm run lint          # Zero ESLint errors  
npm test              # All tests pass
```

## Review checklist

### Styling
- [ ] No `StyleSheet.create()` usage (except animated styles)
- [ ] No hardcoded hex colors — Tailwind tokens only
- [ ] All touchable elements have `min-h-12 min-w-12` and `accessibilityLabel`

### Testing
- [ ] New component has a test file
- [ ] Test covers: render, primary interaction, error state
- [ ] All existing tests still pass

### UX
- [ ] Loading state shown for async actions
- [ ] Error state has a retry/dismiss action
- [ ] Works offline (or shows clear offline message)
- [ ] 3-tap rule respected for new flows

### Story
- [ ] PR title references story ID: `feat(mobile): MOB-NNN description`
- [ ] Story status updated to 🔄 In Progress in `docs/bmad/04-stories.md`
