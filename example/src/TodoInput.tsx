// Copyright (c) Facebook, Inc. and its affiliates. All Rights Reserved

import {css} from '@emotion/css';
import {useState} from 'react';
import {useDispatch} from './Store';

export default function TodoInput() {
  const [newTodo, setNewTodo] = useState('');
  const dispatch = useDispatch();

  return (
    <input
      className={styles.root}
      type="text"
      onChange={e => setNewTodo(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          dispatch({type: 'add todo', todo: newTodo});
          setNewTodo('');
        }
      }}
      placeholder="What needs to be done?"
      value={newTodo}
    />
  );
}

const styles = {
  root: css`
    box-sizing: border-box;
    font-size: 16px;
    margin-bottom: 24px;
    padding: 8px 12px;
    width: 100%;
  `,
};
