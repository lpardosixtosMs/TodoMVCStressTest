function runSpeedometerTest(name : string, test : ()=>void, callback : (syncTime: number, asybcTime : number) => void) {
  performance.mark(`${name}-start`);
  const syncStartTime = performance.now();
  test();
  const syncEndTime = performance.now();
  performance.mark(`${name}-sync-end`);

  const syncTime = syncEndTime - syncStartTime;

  const asyncStartTime = performance.now();
  setTimeout(() => {
      // Some browsers don't immediately update the layout for paint.
      // Force the layout here to ensure we're measuring the layout time.
      const asyncEndTime = performance.now();
      const asyncTime = asyncEndTime - asyncStartTime;
      performance.mark(`${name}-async-end`);
      window.requestAnimationFrame(() => {
          callback(syncTime, asyncTime);
      });
  }, 0);
}

export default runSpeedometerTest;
