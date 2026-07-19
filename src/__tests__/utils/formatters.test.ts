import {
  formatDistance,
  formatDuration,
  formatTollCost,
} from '../../utils/formatters'

describe('formatDistance', () => {
  it('formats meters under 1km', () => {
    expect(formatDistance(450, 'ms')).toBe('450 m')
    expect(formatDistance(450, 'en')).toBe('450 m')
  })

  it('formats km over 1000m', () => {
    expect(formatDistance(1500, 'ms')).toBe('1.5 km')
    expect(formatDistance(10000, 'en')).toBe('10.0 km')
  })

  it('rounds meters correctly', () => {
    expect(formatDistance(999, 'ms')).toBe('999 m')
    expect(formatDistance(1000, 'ms')).toBe('1.0 km')
  })
})

describe('formatDuration', () => {
  it('formats minutes only', () => {
    expect(formatDuration(600, 'ms')).toBe('10 min')
    expect(formatDuration(600, 'en')).toBe('10 min')
  })

  it('formats hours and minutes in BM', () => {
    expect(formatDuration(3900, 'ms')).toBe('1 j 5 min')
  })

  it('formats hours and minutes in EN', () => {
    expect(formatDuration(3900, 'en')).toBe('1h 5min')
  })

  it('formats exactly 1 hour', () => {
    expect(formatDuration(3600, 'ms')).toBe('1 j 0 min')
  })
})

describe('formatTollCost', () => {
  it('shows tiada tol for 0', () => {
    expect(formatTollCost(0)).toBe('Tiada tol')
  })

  it('formats RM with 2 decimal places', () => {
    expect(formatTollCost(4.5)).toBe('RM 4.50')
    expect(formatTollCost(12)).toBe('RM 12.00')
    expect(formatTollCost(1.1)).toBe('RM 1.10')
  })
})
