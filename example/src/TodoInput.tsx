import {css} from 'emotion';
import * as React from 'react';
import {useDispatch} from './redux-react-hook';

export default function TodoInput() {
  const [newTodo, setNewTodo] = React.useState('');
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
