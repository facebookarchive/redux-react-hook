import {css} from 'emotion';
import * as React from 'react';
import {useMappedState} from './redux-react-hook';
import {IState} from './Store';
import TodoItem from './TodoItem';

const mapState = (state: IState) => ({
  lastUpdated: state.lastUpdated,
  todoCount: state.todos.length,
});

export default function TodoList() {
  const {lastUpdated, todoCount} = useMappedState(mapState);
  return (
    <div>
      <div className={styles.count}>You have {todoCount} todos</div>
      <ul className={styles.todos}>
        {new Array(todoCount).fill(null).map((_, index) => (
          <TodoItem index={index} key={index} />
        ))}
      </ul>
      <div className={styles.lastUpdated}>
        Last updated: {lastUpdated ? new Date(lastUpdated).toString() : 'never'}
      </div>
    </div>
  );
}

const styles = {
  count: css`
    font-size: 12px;
  `,
  lastUpdated: css`
    color: #666;
    font-size: 10px;
  `,
  todos: css`
    padding-left: 0;
  `,
};
