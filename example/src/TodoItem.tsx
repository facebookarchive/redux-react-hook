import * as React from 'react';
import {IState, useDispatch, useMappedState} from './Store';

export default function TodoItem({index}: {index: number}) {
  const mapState = React.useCallback((state: IState) => state.todos[index], [
    index,
  ]);
  const todo = useMappedState(mapState);

  const dispatch = useDispatch();
  const deleteTodo = React.useCallback(
    () => dispatch({type: 'delete todo', index}),
    [index],
  );

  return (
    <li>
      <button onClick={deleteTodo}>x</button> {todo}
    </li>
  );
}
