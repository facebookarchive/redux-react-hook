import React, {useState} from 'react';
import {useDispatch} from './Store';

export default function TodoInput() {
  const [newTodo, setNewTodo] = useState('');
  const dispatch = useDispatch();
  function onKeyDown(e) {
    if (e.key === 'Enter') {
      dispatch({type: 'add todo', todo: newTodo});
      setNewTodo('');
    }
  }

  return (
    <input
      type="text"
      onChange={e => setNewTodo(e.target.value)}
      onKeyDown={onKeyDown}
      value={newTodo}
    />
  );
}
