// import { Amplify } from 'aws-amplify';
// import config from '../aws-exports.js';
// import { generateServerClientUsingCookies } from '@aws-amplify/adapter-nextjs/api';
import { generateClient } from 'aws-amplify/api';
// import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import * as mutations from '@/graphql/mutations';
// 1. Add the queries as an import
import * as queries from '@/graphql/queries';

// import config from '@/amplifyconfiguration.json';


// @ts-ignore
// Amplify.configure(config);


// const client = generateServerClientUsingCookies({
//   // @ts-ignore
//   config,
//   cookies
// });
const client = generateClient();

async function createTodo(formData: FormData) {
  'use server';
  const { data } = await client.graphql({
    query: mutations.createTodos,
    variables: {
      input: {
        name: formData.get('name')?.toString() ?? ''
      }
    }
  });

  console.log('Created Todo: ', data?.createTodos);

  revalidatePath('/');
}

export default async function Home() {
  // 2. Fetch additional todos
  const { data, errors } = await client.graphql({
    query: queries.listTodos
  });

  const todos = data?.listTodos?.items ?? [];

  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'center',
        marginTop: '100px'
      }}
    >
      <form action={createTodo}>
        <input name="name" placeholder="Add a todo" />
        <button type="submit">Add</button>
      </form>

      {/* 3. Handle edge cases & zero state & error states*/}
      {(!todos || todos.length === 0 || errors) && (
        <div>
          <p>No todos, please add one.</p>
        </div>
      )}

      {/* 4. Display todos*/}
      <ul>
        {todos.map((todo) => {
          return <li style={{ listStyle: 'none' }}>{todo?.name ?? 'No name'}</li>;
        })}
      </ul>
    </div>
  );
}