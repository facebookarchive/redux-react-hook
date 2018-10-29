import * as React from 'react';
import {IState, useMappedState} from './Store';
import TodoItem from './TodoItem';

const mapState = (state: IState) => ({
  lastUpdated: state.lastUpdated,
  todoCount: state.todos.length,
});

export default function TodoList() {
  const {lastUpdated, todoCount} = useMappedState(mapState);
  return (
    <div>
      <div>Count: {todoCount}</div>
      <ul>
        {new Array(todoCount).fill(null).map((_, index) => (
          <TodoItem index={index} key={index} />
        ))}
      </ul>
      <div>
        Last updated: {lastUpdated ? new Date(lastUpdated).toString() : 'never'}
      </div>
    </div>
  );
}
