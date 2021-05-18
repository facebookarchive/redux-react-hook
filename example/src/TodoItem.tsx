// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import {css} from '@emotion/css';
import {useCallback} from 'react';
import {IState, useDispatch, useMappedState} from './Store';

export default function TodoItem({index}: {index: number}) {
  const {todo, deleteTodo} = useTodo(index);

  return (
    <li className={styles.root}>
      <span>{todo}</span>
      <button onClick={deleteTodo}>Delete</button>
    </li>
  );
}

// Example of creating a custom hook to encapsulate the store
function useTodo(index: number): {todo: string; deleteTodo: () => void} {
  const todo = useMappedState(
    useCallback((state: IState) => state.todos[index], [index]),
  );

  const dispatch = useDispatch();
  const deleteTodo = useCallback(
    () => dispatch({type: 'delete todo', index}),
    [dispatch, index],
  );
  return {todo, deleteTodo};
}

const styles = {
  root: css`
    align-items: center;
    display: flex;
    justify-content: space-between;
    list-style-type: none;
    margin: 0;
    padding: 8px 12px;

    &:hover {
      background-color: #efefef;

      button {
        opacity: 1;
      }
    }

    button {
      opacity: 0;
    }
  `,
};
