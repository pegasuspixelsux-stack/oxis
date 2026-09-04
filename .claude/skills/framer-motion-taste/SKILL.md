---
name: framer-motion-taste
description: This skill should be used when implementing fluid page transitions, layout animations, exit/entry orchestration, and spring physics in React.
---

# Framer Motion Engineering Standards
- Use spring physics (`transition={{ type: "spring", stiffness: 300, damping: 30 }}`) instead of rigid linear transitions.
- Implement layout animations (`layoutId`) for seamless shared-element transitions.
- Ensure animations enhance UX without causing layout thrashing or input delay.
