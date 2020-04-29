export default {
  padTime(t: string) {
    return (t + '').length === 1 ? (t + '').padStart(2, '0') : t
  },
  // Seconds to Time Chunk "03:30:30"
  secondsToTime(secondsStr: string | number): string {
    const _seconds =
      typeof secondsStr === 'string' ? parseInt(secondsStr) : secondsStr
    let seconds = ''
    let minutes = Math.floor(_seconds / 60).toString()
    let hours = ''
    if (parseInt(minutes) > 59) {
      hours = this.padTime(Math.floor(parseInt(minutes) / 60).toString())
      minutes = this.padTime(
        (parseInt(minutes) - parseInt(hours) * 60).toString()
      )
    }
    seconds = this.padTime(Math.floor(_seconds % 60).toString())
    minutes = this.padTime(minutes)

    if (hours !== '') {
      return `${this.padTime(hours)}:${minutes}:${seconds}`
    } else {
      return `00:${minutes}:${seconds}`
    }
  },
  msToSecond(ms: number) {
    return ms / 1000
  },
  timestringToSeconds(timestring: string): number {
    const tsa = timestring.split(':')
    return this.unitsToSeconds(tsa[0], tsa[1], tsa[2])
  },
  unitsToSeconds(hour: string, minutes: string, seconds: string): number {
    let s = 0
    s = (parseInt(hour) || 0) * 60 * 60
    s = s + (parseInt(minutes) || 0) * 60
    s = s + (parseInt(seconds) || 0)
    return s
  }
}
