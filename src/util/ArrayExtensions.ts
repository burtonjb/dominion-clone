import { Random } from "./Random";

/* 
Fisher-Yates algorithm to shuffle an array (I think, I just took it from github) 
In place shuffles the array
*/
export function shuffleArray<T>(array: Array<T>, random: Random) {
  let k = array.length;

  while (k > 0) {
    const i = random.randomInt(0, k);
    k--;

    const temp = array[k];
    array[k] = array[i];
    array[i] = temp;
  }
}

// A kinda-hack replacement for Array(N).fill(0).map(i -> ctor()).
// Still not sure about making my own library function instead of using the built-ins though
export function createNInstances<T>(n: number, ctor: () => T): Array<T> {
  const out: Array<T> = [];
  for (let i = 0; i < n; i++) {
    out.push(ctor());
  }
  return out;
}

// Somewhat dumb function, but I don't really do inline for-loops anymore so I feel like this
// is more natural. Otherwise its 3 lines to do something n times which can quickly get messy
export function doNTimes(n: number, f: (a?: any) => any) {
  for (let i = 0; i < n; i++) {
    f();
  }
}
