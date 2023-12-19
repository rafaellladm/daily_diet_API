export function findLongestSequence(array: number[]): number {
  // let current = 0
  // let longest = 0

  // for (const value of array) {
  //   if (value === 1) {
  //     current++
  //   } else {
  //     current = 0
  //   }

  //   longest = Math.max(longest, current)
  // }

  // return longest

  return array.reduce((acc, value) => {
    if (value === 1) {
      return acc + 1
    } else {
      return 0
    }
  }, 0)
}
