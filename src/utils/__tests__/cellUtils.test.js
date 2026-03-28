import { describe, test, expect } from '@jest/globals'
import {
  FULLBLEED_STRUCTURE,
  normalizeStructure,
  getCellInfo,
  countCells,
  cleanupOrphanedCells,
} from '../cellUtils.js'

describe('normalizeStructure', () => {
  test('returns FULLBLEED_STRUCTURE for fullbleed type', () => {
    const structure = [{ size: 50 }, { size: 50 }]
    expect(normalizeStructure('fullbleed', structure)).toBe(FULLBLEED_STRUCTURE)
  })

  test('returns FULLBLEED_STRUCTURE for null structure', () => {
    expect(normalizeStructure('rows', null)).toBe(FULLBLEED_STRUCTURE)
  })

  test('returns FULLBLEED_STRUCTURE for empty array', () => {
    expect(normalizeStructure('columns', [])).toBe(FULLBLEED_STRUCTURE)
  })

  test('returns original structure for rows with valid structure', () => {
    const structure = [{ size: 60 }, { size: 40 }]
    expect(normalizeStructure('rows', structure)).toBe(structure)
  })
})

describe('getCellInfo', () => {
  test('returns single cell for empty structure', () => {
    const result = getCellInfo({ structure: [] })
    expect(result).toEqual([{ index: 0, label: '1', sectionIndex: 0, subIndex: 0 }])
  })

  test('returns correct cells for single section with 2 subdivisions', () => {
    const result = getCellInfo({
      structure: [{ size: 100, subdivisions: 2, subSizes: [50, 50] }],
    })
    expect(result).toHaveLength(2)
    expect(result[0]).toEqual({ index: 0, label: '1', sectionIndex: 0, subIndex: 0 })
    expect(result[1]).toEqual({ index: 1, label: '2', sectionIndex: 0, subIndex: 1 })
  })

  test('returns correct cells for multi-section layout', () => {
    const result = getCellInfo({
      structure: [
        { size: 50, subdivisions: 1, subSizes: [100] },
        { size: 50, subdivisions: 2, subSizes: [50, 50] },
      ],
    })
    expect(result).toHaveLength(3)
    expect(result[0].index).toBe(0)
    expect(result[1].index).toBe(1)
    expect(result[2].index).toBe(2)
    expect(result[2].sectionIndex).toBe(1)
    expect(result[2].subIndex).toBe(1)
  })

  test('defaults subdivisions to 1 when not specified', () => {
    const result = getCellInfo({ structure: [{ size: 100 }] })
    expect(result).toHaveLength(1)
  })
})

describe('countCells', () => {
  test('returns 1 for null structure', () => {
    expect(countCells(null)).toBe(1)
  })

  test('returns 1 for empty structure', () => {
    expect(countCells([])).toBe(1)
  })

  test('counts subdivisions correctly', () => {
    const structure = [
      { size: 50, subdivisions: 2 },
      { size: 50, subdivisions: 3 },
    ]
    expect(countCells(structure)).toBe(5)
  })

  test('defaults missing subdivisions to 1', () => {
    const structure = [{ size: 50 }, { size: 50 }]
    expect(countCells(structure)).toBe(2)
  })
})

describe('cleanupOrphanedCells', () => {
  test('removes cells beyond newCellCount', () => {
    const prevState = {
      cellImages: { 0: 'img-1', 1: 'img-2', 2: 'img-3' },
      padding: { cellOverrides: { 0: 10, 2: 20 } },
      frame: { cellFrames: {} },
      freeformText: {},
      text: { 0: {}, 1: {}, 2: {} },
    }
    const result = cleanupOrphanedCells(prevState, 2)
    expect(Object.keys(result.cellImages)).toEqual(['0', '1'])
    expect(Object.keys(result.text)).toEqual(['0', '1'])
  })

  test('handles NaN keys from corrupted state', () => {
    const prevState = {
      cellImages: { 0: 'img-1', foo: 'img-bad' },
      padding: { cellOverrides: {} },
      frame: { cellFrames: {} },
      freeformText: {},
      text: {},
    }
    const result = cleanupOrphanedCells(prevState, 5)
    expect(result.cellImages).toEqual({ 0: 'img-1' })
    expect(result.cellImages.foo).toBeUndefined()
  })

  test('preserves all cells when newCellCount is large enough', () => {
    const prevState = {
      cellImages: { 0: 'img-1', 1: 'img-2' },
      padding: { cellOverrides: {} },
      frame: { cellFrames: {} },
      freeformText: { 0: [], 1: [] },
      text: {},
    }
    const result = cleanupOrphanedCells(prevState, 10)
    expect(Object.keys(result.cellImages)).toEqual(['0', '1'])
    expect(Object.keys(result.freeformText)).toEqual(['0', '1'])
  })
})
