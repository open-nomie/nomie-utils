import time from './time'

test('should convert seconds into time', () => {
  expect(time.secondsToTime(20)).toBe('00:00:20')
  expect(time.secondsToTime('20')).toBe('00:00:20')
  expect(time.secondsToTime(3600)).toBe('01:00:00')
  expect(time.secondsToTime(7200)).toBe('02:00:00')
  expect(time.secondsToTime(5400)).toBe('01:30:00')
})

test('should convert ms into seconds', () => {
  expect(time.msToSecond(10000)).toBe(10)
})

test('should pad time with zero', () => {
  expect(time.padTime('5')).toBe('05')
})

test('should convert a time string to seconds', () => {
  expect(time.timestringToSeconds('01:00:00')).toBe(3600)
  expect(time.timestringToSeconds('2:00:01')).toBe(7201)
  expect(time.timestringToSeconds('0:00:03')).toBe(3)
  expect(time.timestringToSeconds(':00:03')).toBe(3)
})

test('should convert time units into seconds', () => {
  expect(time.unitsToSeconds('01', '00', '00')).toBe(3600)
  expect(time.unitsToSeconds('01', '00', '20')).toBe(3620)
  expect(time.unitsToSeconds('2', '00', '20')).toBe(7220)
  expect(time.unitsToSeconds('0', '01', '00')).toBe(60)
})
