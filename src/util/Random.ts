/*
Interface for a random number generator if I ever need to come up with a new algorithm
(for example - if the algorithm I copy-pasted from random github gists turns out to be wrong)
*/
interface IRandom {
  random: () => number; // float in [0, 1)
  randomFloat: (min: number, max: number) => number; // float in [min, max)
  randomInt: (min: number, max: number) => number; // int in [min, max)
}

/*
An implementation of MersenneTwister - found on github. 
Figured its better to just copy and paste the algorithm rather than bring in the dependency
since this is a somewhat well known algorithm and I don't need a dependency for one class
*/
class MersenneTwister implements IRandom {
  private N: number;
  private M: number;
  private MATRIX_A: number;
  private UPPER_MASK: number;
  private LOWER_MASK: number;
  private mt: Array<number>;
  private mti: number;

  constructor(seed?: number) {
    if (seed == undefined) {
      seed = new Date().getTime();
    }

    /* Period parameters */
    this.N = 624;
    this.M = 397;
    this.MATRIX_A = 0x9908b0df; /* constant vector a */
    this.UPPER_MASK = 0x80000000; /* most significant w-r bits */
    this.LOWER_MASK = 0x7fffffff; /* least significant r bits */

    this.mt = new Array(this.N); /* the array for the state vector */
    this.mti = this.N + 1; /* mti==N+1 means mt[N] is not initialized */

    this.init(seed);
  }

  private init(s: number) {
    this.mt[0] = s >>> 0;
    for (this.mti = 1; this.mti < this.N; this.mti++) {
      const s = this.mt[this.mti - 1] ^ (this.mt[this.mti - 1] >>> 30);
      this.mt[this.mti] = ((((s & 0xffff0000) >>> 16) * 1812433253) << 16) + (s & 0x0000ffff) * 1812433253 + this.mti;
      this.mt[this.mti] >>>= 0;
    }
  }

  private genRandomInt32() {
    let y;
    const mag01 = [0x0, this.MATRIX_A];

    if (this.mti >= this.N) {
      let kk;

      if (this.mti == this.N + 1) {
        this.init(5489);
      }

      for (kk = 0; kk < this.N - this.M; kk++) {
        y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
        this.mt[kk] = this.mt[kk + this.M] ^ (y >>> 1) ^ mag01[y & 0x1];
      }

      for (; kk < this.N - 1; kk++) {
        y = (this.mt[kk] & this.UPPER_MASK) | (this.mt[kk + 1] & this.LOWER_MASK);
        this.mt[kk] = this.mt[kk + (this.M - this.N)] ^ (y >>> 1) ^ mag01[y & 0x1];
      }

      y = (this.mt[this.N - 1] & this.UPPER_MASK) | (this.mt[0] & this.LOWER_MASK);
      this.mt[this.N - 1] = this.mt[this.M - 1] ^ (y >>> 1) ^ mag01[y & 0x1];

      this.mti = 0;
    }

    y = this.mt[this.mti++];

    y ^= y >>> 11;
    y ^= (y << 7) & 0x9d2c5680;
    y ^= (y << 15) & 0xefc60000;
    y ^= y >>> 18;

    return y >>> 0;
  }

  public random(): number {
    return this.genRandomInt32() * (1.0 / 4294967296.0);
    /* divided by 2^32 */
  }

  public randomFloat(min: number, max: number): number {
    return this.random() * (max - min) + min;
  }

  public randomInt(min: number, max: number): number {
    const mi = Math.ceil(min);
    const ma = Math.floor(max);
    return Math.floor(this.random() * (ma - mi) + mi);
  }
}

export { MersenneTwister as Random };
