import * as React from 'react';
import TodoInput from './TodoInput';
import TodoList from './TodoList';

export default function App() {
  return (
    <div>
      <h1>Add todo:</h1>
      <TodoInput />
      <h1>Todos:</h1>
      <TodoList />
    </div>
  );
}
