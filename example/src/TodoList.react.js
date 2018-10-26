import React from 'react';
import {useStore} from './Store';
import TodoItem from './TodoItem.react';

const mapState = state => ({
  lastUpdated: state.lastUpdated,
  todoCount: state.todos.length,
});

export default function TodoList() {
  const {lastUpdated, todoCount} = useStore(mapState);
  return (
    <div>
      <div>Count: {todoCount}</div>
      <ul>
        {new Array(todoCount).fill().map((_, index) => (
          <TodoItem index={index} key={index} />
        ))}
      </ul>
      Last updated: {lastUpdated ? new Date(lastUpdated).toString() : 'never'}
    </div>
  );
}
