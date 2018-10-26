import React from 'react';
import TodoInput from './TodoInput.react';
import TodoList from './TodoList.react';

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
