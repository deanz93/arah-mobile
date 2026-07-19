import { haversineDistance, bboxFromCenter, bearing } from '../../utils/geoUtils'

const KLCC = { latitude: 3.1578, longitude: 101.7118 }
const KLIA = { latitude: 2.7456, longitude: 101.7099 }
const PAVILION = { latitude: 3.1488, longitude: 101.7131 }

describe('haversineDistance', () => {
  it('returns 0 for same point', () => {
    expect(haversineDistance(KLCC, KLCC)).toBe(0)
  })

  it('calculates KLCC to KLIA (~46km)', () => {
    const dist = haversineDistance(KLCC, KLIA)
    expect(dist).toBeGreaterThan(45_000)
    expect(dist).toBeLessThan(48_000)
  })

  it('calculates KLCC to Pavilion (~1km)', () => {
    const dist = haversineDistance(KLCC, PAVILION)
    expect(dist).toBeGreaterThan(900)
    expect(dist).toBeLessThan(1_200)
  })
})

describe('bboxFromCenter', () => {
  it('creates a bounding box around a point', () => {
    const bbox = bboxFromCenter(KLCC, 1000)
    expect(bbox.sw.latitude).toBeLessThan(KLCC.latitude)
    expect(bbox.ne.latitude).toBeGreaterThan(KLCC.latitude)
    expect(bbox.sw.longitude).toBeLessThan(KLCC.longitude)
    expect(bbox.ne.longitude).toBeGreaterThan(KLCC.longitude)
  })

  it('bbox width approximately matches radius', () => {
    const bbox = bboxFromCenter(KLCC, 5000)
    const northDist = haversineDistance(KLCC, { latitude: bbox.ne.latitude, longitude: KLCC.longitude })
    expect(northDist).toBeGreaterThan(4_800)
    expect(northDist).toBeLessThan(5_200)
  })
})

describe('bearing', () => {
  it('returns a value between 0 and 360', () => {
    const b = bearing(KLCC, KLIA)
    expect(b).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThan(360)
  })

  it('KLIA is roughly south of KLCC', () => {
    const b = bearing(KLCC, KLIA)
    // South = ~180°, allow ±30° margin
    expect(b).toBeGreaterThan(150)
    expect(b).toBeLessThan(210)
  })
})
