/* eslint-disable react-refresh/only-export-components */
// Requirement: Shared alignment icon components and option arrays.
// Approach: Single source of truth for alignment UI used by ContentTab (and potentially others).
// This file intentionally exports both icon components and option arrays.
// Alternatives:
//   - Inline in each component: Rejected — duplicated across files, changes drift.

const AlignLeftIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="0" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="0" y="8" width="8" height="2" />
  </svg>
)
const AlignCenterIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="2" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="3" y="8" width="8" height="2" />
  </svg>
)
const AlignRightIcon = () => (
  <svg width="14" height="10" viewBox="0 0 14 10" fill="currentColor">
    <rect x="4" y="0" width="10" height="2" />
    <rect x="0" y="4" width="14" height="2" />
    <rect x="6" y="8" width="8" height="2" />
  </svg>
)
const AlignTopIcon = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
    <rect x="0" y="0" width="10" height="2" />
    <rect x="3" y="4" width="4" height="10" opacity="0.4" />
  </svg>
)
const AlignMiddleIcon = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
    <rect x="0" y="6" width="10" height="2" />
    <rect x="3" y="2" width="4" height="10" opacity="0.4" />
  </svg>
)
const AlignBottomIcon = () => (
  <svg width="10" height="14" viewBox="0 0 10 14" fill="currentColor">
    <rect x="0" y="12" width="10" height="2" />
    <rect x="3" y="0" width="4" height="10" opacity="0.4" />
  </svg>
)

export const textAlignOptions = [
  { id: 'left', name: 'Left', Icon: AlignLeftIcon },
  { id: 'center', name: 'Center', Icon: AlignCenterIcon },
  { id: 'right', name: 'Right', Icon: AlignRightIcon },
]

export const verticalAlignOptions = [
  { id: 'start', name: 'Top', Icon: AlignTopIcon },
  { id: 'center', name: 'Middle', Icon: AlignMiddleIcon },
  { id: 'end', name: 'Bottom', Icon: AlignBottomIcon },
]
