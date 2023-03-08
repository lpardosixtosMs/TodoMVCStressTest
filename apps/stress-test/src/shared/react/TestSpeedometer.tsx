import * as React from 'react';
import { styleInjector } from '../css/injectStyles';
// import { performanceMeasure } from '../utils/performanceMeasure';
import { ReactSelectorTree } from './ReactSelectorTree';
import type { TestProps } from './types';

import runSpeedometerTest from '../vanilla/SpeedometerRunner';
import { AddStep, CheckStep, DestroyStep } from '../vanilla/BenchmarkSteps';

function waitAndResolve(secs: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, secs);
  });
}

export const TestSpeedometer: React.FC<TestProps> = ({ tree, selectors, componentRenderer, testOptions }) => {
  React.useEffect(() => {
    if (testOptions.withStyles === 'true') {
      styleInjector(selectors);
    }
  }, []);

  React.useEffect(() => {
    // setTimeout(() => {
    //   runSpeedometerTest(
    //     'large-dom-todo-mvc',
    //     () => {
    //       AddStep.run();
    //       waitAndResolve(50);
    //       CheckStep.run();
    //       waitAndResolve(50);
    //       DestroyStep.run();
    //       window.requestAnimationFrame(() => {});
    //     },
    //     () => {},
    //   );
    // }, 2000);
  }, []);

  return (
    <>
      <ReactSelectorTree tree={tree} componentRenderer={componentRenderer} />
    </>
  );
};
