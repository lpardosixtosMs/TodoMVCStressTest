import * as React from 'react';
import * as ReactDOM from 'react-dom';
import * as classNames from 'classnames';
import Router from 'director';
import { ReactSelectorTreeComponentRenderer } from '../../shared/react/types';

class AppUtils {
  public static ALL_TODOS: string = 'all';
  public static ACTIVE_TODOS: string = 'active';
  public static COMPLETED_TODOS: string = 'completed';

  public static uuid() {
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
      random = (Math.random() * 16) | 0;
      if (i === 8 || i === 12 || i === 16 || i === 20) {
        uuid += '-';
      }
      uuid += (i === 12 ? 4 : i === 16 ? (random & 3) | 8 : random).toString(16);
    }

    return uuid;
  }

  public static pluralize(count: number, word: string): string {
    return count === 1 ? word : word + 's';
  }

  public static extend(arg1: Todo, extension: any) {
    var newObj: Todo = arg1;
    for (var key in extension) {
      if (extension.hasOwnProperty(key)) {
        Object.defineProperty(newObj, key, extension[key]);
      }
    }
    return newObj;
  }
}

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

class TodoModel {
  key: string;
  todos: Array<Todo>;
  onChanges: any;

  constructor(key: string) {
    this.key = key;
    this.todos = [];
    this.onChanges = [];
  }

  subscribe(onChange: any) {
    this.onChanges.push(onChange);
  }

  inform() {
    this.onChanges.forEach(function (cb: any) {
      cb();
    });
  }

  addTodo(title: string) {
    this.todos = this.todos.concat({
      id: AppUtils.uuid(),
      title: title,
      completed: false,
    });

    this.inform();
  }

  toggleAll(checked: boolean) {
    // Note: it's usually better to use immutable data structures since they're
    // easier to reason about and React works very well with them. That's why
    // we use map() and filter() everywhere instead of mutating the array or
    // todo items themselves.
    this.todos = this.todos.map(function (todo) {
      return AppUtils.extend(todo, { completed: checked });
    });

    this.inform();
  }

  toggle(todoToToggle: Todo) {
    this.todos = this.todos.map(function (todo) {
      return todo !== todoToToggle ? todo : AppUtils.extend(todo, { completed: !todo.completed });
    });

    this.inform();
  }

  destroy(todo: Todo) {
    this.todos = this.todos.filter(function (candidate) {
      return candidate !== todo;
    });

    this.inform();
  }

  save(todoToSave: Todo, text: string) {
    this.todos = this.todos.map(function (todo) {
      return todo !== todoToSave ? todo : AppUtils.extend(todo, { title: text });
    });

    this.inform();
  }

  clearCompleted() {
    this.todos = this.todos.filter(function (todo) {
      return !todo.completed;
    });

    this.inform();
  }
}

type FooterProps = {
  count: number;
  completedCount: number;
  onClearCompleted: React.MouseEventHandler<HTMLButtonElement>;
  nowShowing: string;
};

class TodoFooter extends React.Component<FooterProps> {
  render() {
    var activeTodoWord = AppUtils.pluralize(this.props.count, 'item');
    var clearButton = null;

    if (this.props.completedCount > 0) {
      clearButton = (
        <button className="clear-completed" onClick={this.props.onClearCompleted}>
          Clear completed
        </button>
      );
    }

    var nowShowing = this.props.nowShowing;
    return (
      <footer className="footer">
        <span className="todo-count">
          <strong>{this.props.count}</strong> {activeTodoWord} left
        </span>
        <ul className="filters">
          <li>
            <a href="#/" className={classNames({ selected: nowShowing === AppUtils.ALL_TODOS })}>
              All
            </a>
          </li>{' '}
          <li>
            <a href="#/active" className={classNames({ selected: nowShowing === AppUtils.ACTIVE_TODOS })}>
              Active
            </a>
          </li>{' '}
          <li>
            <a href="#/completed" className={classNames({ selected: nowShowing === AppUtils.COMPLETED_TODOS })}>
              Completed
            </a>
          </li>
        </ul>
        {clearButton}
      </footer>
    );
  }
}

type ItemProps = {
  onDestroy: () => void;
  onSave: (arg0: string) => void;
  onEdit: () => void;
  onCancel: (arg0: React.KeyboardEvent<HTMLInputElement>) => void;
  onToggle: (arg0: React.ChangeEvent<HTMLInputElement>) => void;
  todo: Todo;
  editing: boolean;
};

type ItemState = {
  editText: string;
};

class TodoItem extends React.Component<ItemProps, ItemState> {
  constructor(props: ItemProps) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleEdit = this.handleEdit.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.getInitialState = this.getInitialState.bind(this);
    this.shouldComponentUpdate = this.shouldComponentUpdate.bind(this);
  }

  handleSubmit() {
    var val = this.state.editText.trim();
    if (val) {
      this.props.onSave(val);
      this.setState({ editText: val });
    } else {
      this.props.onDestroy();
    }
  }

  handleEdit() {
    this.props.onEdit();
    this.setState({ editText: this.props.todo.title });
  }

  handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      this.setState({ editText: this.props.todo.title });
      this.props.onCancel(event);
    } else if (event.key === 'Enter') {
      this.handleSubmit();
    }
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    if (this.props.editing) {
      this.setState({ editText: event.target.value });
    }
  }

  getInitialState() {
    return { editText: this.props.todo.title };
  }

  /**
   * This is a completely optional performance enhancement that you can
   * implement on any React component. If you were to delete this method
   * the app would still work correctly (and still be very performant!), we
   * just use it as an example of how little code it takes to get an order
   * of magnitude performance improvement.
   */
  shouldComponentUpdate(nextProps: ItemProps, nextState: ItemState) {
    return (
      nextProps.todo !== this.props.todo ||
      nextProps.editing !== this.props.editing ||
      nextState.editText !== this.state.editText
    );
  }

  /**
   * Safely manipulate the DOM after updating the state when invoking
   * `this.props.onEdit()` in the `handleEdit` method above.
   * For more info refer to notes at https://facebook.github.io/react/docs/component-api.html#setstate
   * and https://facebook.github.io/react/docs/component-specs.html#updating-componentdidupdate
   */
  componentDidUpdate(prevProps: ItemProps) {
    if (!prevProps.editing && this.props.editing) {
      var node = ReactDOM.findDOMNode(this.refs.editField) as HTMLInputElement;
      node.focus();
      node.setSelectionRange(node.value.length, node.value.length);
    }
  }

  render() {
    return (
      <li
        className={classNames({
          completed: this.props.todo.completed,
          editing: this.props.editing,
        })}
      >
        <div className="view">
          <input
            className="toggle"
            type="checkbox"
            checked={this.props.todo.completed}
            onChange={this.props.onToggle}
          />
          <label onDoubleClick={this.handleEdit}>{this.props.todo.title}</label>
          <button className="destroy" onClick={this.props.onDestroy} />
        </div>
        <input
          ref="editField"
          className="edit"
          value={this.state.editText}
          onBlur={this.handleSubmit}
          onChange={this.handleChange}
          onKeyDown={this.handleKeyDown}
        />
      </li>
    );
  }
}

type AppProps = {
  model: TodoModel;
};

type AppState = {
  nowShowing: string;
  editing: null | string;
  newTodo: string;
};

class TodoApp extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleNewTodoKeyDown = this.handleNewTodoKeyDown.bind(this);

    this.toggleAll = this.toggleAll.bind(this);
    this.toggle = this.toggle.bind(this);
    this.destroy = this.destroy.bind(this);
    this.edit = this.edit.bind(this);
    this.save = this.save.bind(this);
    this.cancel = this.cancel.bind(this);
    this.clearCompleted = this.clearCompleted.bind(this);
    this.handleNewTodoKeyDown = this.handleNewTodoKeyDown.bind(this);

    this.state = {
      nowShowing: AppUtils.ALL_TODOS,
      editing: null,
      newTodo: '',
    };
  }

  // getInitialState() {
  //   return {
  //     nowShowing: AppUtils.ALL_TODOS,
  //     editing: null,
  //     newTodo: ''
  //   };
  // }

  componentDidMount() {
    var setState = this.setState;
    console.log('router starting');
    var router = Router({
      '/': setState.bind(this, {
        nowShowing: AppUtils.ALL_TODOS,
        editing: this.state.editing,
        newTodo: this.state.newTodo,
      }),
      '/active': setState.bind(this, {
        nowShowing: AppUtils.ACTIVE_TODOS,
        editing: this.state.editing,
        newTodo: this.state.newTodo,
      }),
      '/completed': setState.bind(this, {
        nowShowing: AppUtils.COMPLETED_TODOS,
        editing: this.state.editing,
        newTodo: this.state.newTodo,
      }),
    });
    router.init('/');
    console.log('router init');
  }

  handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ newTodo: event.target.value });
  }

  handleNewTodoKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();

    var val = this.state.newTodo.trim();

    if (val) {
      this.props.model.addTodo(val);
      this.setState({ newTodo: '' });
    }
  }

  toggleAll(event: React.ChangeEvent<HTMLInputElement>) {
    var checked = event.target.checked;
    this.props.model.toggleAll(checked);
  }

  toggle(todoToToggle: Todo) {
    this.props.model.toggle(todoToToggle);
  }

  destroy(todo: Todo) {
    this.props.model.destroy(todo);
  }

  edit(todo: Todo) {
    this.setState({ editing: todo.id });
  }

  save(todoToSave: Todo, text: string) {
    this.props.model.save(todoToSave, text);
    this.setState({ editing: null });
  }

  cancel() {
    this.setState({ editing: null });
  }

  clearCompleted() {
    this.props.model.clearCompleted();
  }

  render() {
    var footer;
    var main;
    var todos = this.props.model.todos;

    var shownTodos = todos.filter(function (todo) {
      switch (this.state.nowShowing) {
        case AppUtils.ACTIVE_TODOS:
          return !todo.completed;
        case AppUtils.COMPLETED_TODOS:
          return todo.completed;
        default:
          return true;
      }
    }, this);

    var todoItems = shownTodos.map(function (todo) {
      return (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={this.toggle.bind(this, todo)}
          onDestroy={this.destroy.bind(this, todo)}
          onEdit={this.edit.bind(this, todo)}
          editing={this.state.editing === todo.id}
          onSave={this.save.bind(this, todo)}
          onCancel={this.cancel}
        />
      );
    }, this);

    var activeTodoCount = todos.reduce(function (accum, todo) {
      return todo.completed ? accum : accum + 1;
    }, 0);

    var completedCount = todos.length - activeTodoCount;

    if (activeTodoCount || completedCount) {
      footer = (
        <TodoFooter
          count={activeTodoCount}
          completedCount={completedCount}
          nowShowing={this.state.nowShowing}
          onClearCompleted={this.clearCompleted}
        />
      );
    }

    if (todos.length) {
      main = (
        <section className="main">
          <input className="toggle-all" type="checkbox" onChange={this.toggleAll} checked={activeTodoCount === 0} />
          <ul className="todo-list">{todoItems}</ul>
        </section>
      );
    }

    return (
      <div>
        <header className="header">
          <h1>todos</h1>
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            // value={'new TODO'}
            value={this.state.newTodo}
            // onKeyDown={() => {}}
            onKeyDown={this.handleNewTodoKeyDown}
            // onChange={() => {}}
            onChange={this.handleChange}
            autoFocus={true}
          />
        </header>
        {main}
        {footer}
      </div>
    );
  }
}

import { Button } from '@fluentui/react-components';

class TestButton extends React.Component {
  render() {
    return <Button>Button at index</Button>;
  }
}

var model = new TodoModel('react-todos');

function ReRenderApp() {
  ReactDOM.render(<TodoApp model={model}/>, document.getElementById("TodoAppDiv"));
}

model.subscribe(ReRenderApp);

const TODOMVCRenderer: ReactSelectorTreeComponentRenderer = (node, depth, index) => {
  return <div id="TodoAppDiv"> <TodoApp model={model} /> </div> ;
  // return <TestButton/>
  // return <Button>Button at index {index}</Button>;
};

export default TODOMVCRenderer;
