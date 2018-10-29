import * as React from 'react';
import {useDispatch} from './Store';

export default function TodoInput() {
  const [newTodo, setNewTodo] = React.useState('');
  const dispatch = useDispatch();

  return (
    <input
      type="text"
      onChange={e => setNewTodo(e.target.value)}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          dispatch({type: 'add todo', todo: newTodo});
          setNewTodo('');
        }
      }}
      value={newTodo}
    />
  );
}
