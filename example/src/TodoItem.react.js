import React, {useCallback} from 'react';
import {useDispatch, useStore} from './Store';

export default function TodoItem({index}) {
  const mapState = useCallback(state => state.todos[index], [index]);
  const todo = useStore(mapState);

  const dispatch = useDispatch();
  const deleteTodo = useCallback(() => dispatch({type: 'delete todo', index}), [
    index,
  ]);

  return (
    <li>
      <button onClick={deleteTodo}>x</button> {todo}
    </li>
  );
}
