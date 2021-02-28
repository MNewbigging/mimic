export class GameUtils {
  public static doSequencesMatch(seqA: string[], seqB: string[]) {
    if (seqA.length !== seqB.length) {
      return false;
    }

    for (let i = 0; i < seqA.length; i++) {
      const a = seqA[i];
      const b = seqB[i];
      if (a !== b) {
        return false;
      }
    }

    return true;
  }

  public static flashLight(idx: number, sequence: string[], onFinish: () => void) {
    document.getElementById(sequence[idx]).classList.add('flash');
    const nextIdx = idx + 1;
    if (nextIdx >= sequence.length) {
      onFinish();
      return;
    }

    // Flash animation lasts 500ms, 550 here to allow a little extra time
    setTimeout(() => GameUtils.flashLight(nextIdx, sequence, onFinish), 550);
  }
}
