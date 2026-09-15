export function countVowels(str) {
  let count = 0;

  for (const symbol of str) {
    if ('aioeu'.includes(symbol.toLowerCase())) {
      ++count;
    }
  }

  return count;
}
