import * as React from 'react';
import { Header } from "./TodoMVC/header";
import { Main } from "./TodoMVC/main";
import { Footer } from "./TodoMVC/footer";
import { ReactSelectorTreeComponentRenderer } from '../../shared/react/types';

import { todoReducer } from "./TodoMVC/reducer";
import { HashRouter, Route, Routes } from "react-router-dom";

import { Button } from '@fluentui/react-components';

import "./TodoMVC/app.css";

function App() {
  const [todos, dispatch] = React.useReducer(todoReducer, []);

  return (
      <>
          <Header dispatch={dispatch} id = "TodoAppDiv"/>
          <Main todos={todos} dispatch={dispatch} />
          <Footer todos={todos} dispatch={dispatch} />
      </>
  );
}
class TestButton extends React.Component {
  render() {
    return <Button>Button at index</Button>;
  }
}

const TODOMVCRenderer: ReactSelectorTreeComponentRenderer = (node, depth, index) => {
    if (index != 0) {
      // rendered_todo = true;
      return <TestButton/>
      // return <div/> ;
    }

    return (
      <HashRouter>
        <Routes>
            <Route path="*" element={<App />} />
        </Routes>
      </HashRouter>
    );
}

export default TODOMVCRenderer;
