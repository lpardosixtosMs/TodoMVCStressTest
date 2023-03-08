class BenchmarkTestStep {
  name: string;
  run: () => void;
  constructor(testName: string, testFunction: () => void) {
    this.name = testName;
    this.run = testFunction;
  }
}

var numberOfItemsToAdd = 100;

export const AddStep = new BenchmarkTestStep('Add', () => {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
  const newTodo = document.querySelector('.new-todo');
  for (let i = 0; i < numberOfItemsToAdd; i++) {
    nativeInputValueSetter.call(newTodo, `Something to do ${i}`);
    const event1 = new Event('input', { bubbles: true, cancelable: true });
    newTodo.dispatchEvent(event1);
    let eventOptions = {
      bubbles: true,
      cancelable: true,
      key: 'Enter',
    };
    const event = new KeyboardEvent('keydown', eventOptions);
    newTodo.dispatchEvent(event);
    // console.log(newTodo);
  }
});

export const CheckStep = new BenchmarkTestStep('Check', () => {
  const checkboxes: HTMLElement[] = document.querySelectorAll('.toggle');
  // console.log(checkboxes);
  for (let i = 0; i < numberOfItemsToAdd; i++) checkboxes[i].click();
  window.requestAnimationFrame(() => {});
});

export const DestroyStep = new BenchmarkTestStep('Destroy', () => {
  const deleteButtons: HTMLElement[] = document.querySelectorAll('.destroy');
  for (let i = 0; i < numberOfItemsToAdd; i++) deleteButtons[i].click();
});
