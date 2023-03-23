import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { ReactTest } from '../../../shared/react/ReactTest';
import { getTestOptions } from '../../../shared/utils/testOptions';
import { AddStep, CheckStep, DestroyStep } from '../../../shared/vanilla/BenchmarkSteps';
// import { runSpeedometerTest } from '../../../shared/vanilla/SpeedometerRunner';

const { fixtureName, rendererName, r } = getTestOptions();
document.title += ' | ' + r ?? rendererName;
ReactDOM.render(
  <FluentProvider theme={webLightTheme}>
    <ReactTest target="v9" fixtureName={fixtureName} rendererName={rendererName ?? r} />
  </FluentProvider>,
  document.getElementById('root'),
);

function waitAndResolve(secs: number) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve('resolved');
    }, secs);
  });
}

async function runBenchmarks() {
  performance.mark(`speedometer-start`);
  const syncStartTime = performance.now();

  AddStep.run();
  window.requestAnimationFrame(() => {});
  await waitAndResolve(0);

  CheckStep.run();
  window.requestAnimationFrame(() => {});
  await waitAndResolve(0);

  DestroyStep.run();
  window.requestAnimationFrame(() => {});

  const syncEndTime = performance.now();
  performance.mark(`speedometer-sync-end`);
  performance.measure('stress', `speedometer-start`, `speedometer-sync-end`);
}

var element_promise = new Promise(resolve => {
  const resolveIfReady = () => {
    const element = document.querySelector('.new-todo');
    if (element) {
      window.requestAnimationFrame(() => {
        return resolve(element);
      });
    } else {
      setTimeout(resolveIfReady, 2000);
    }
  };
  resolveIfReady();
});

element_promise.then(runBenchmarks);
