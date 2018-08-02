import React, { Component } from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import Form from './Form'
import './App.css';


const TodosQuery = gql`
{
  todos{
    id
    text
    complete
  }
}
`;
  
const UpdateMutation = gql`
mutation($id: ID!, $complete: Boolean!) {
  updateTodo(id: $id, complete: $complete)
}
`;

const RemoveMutation = gql`
mutation($id: ID!){
  
  removeTodo(id: $id)

 }
 `;

 const CreateMutation = gql`
 mutation($text: String!){
  createTodo(text: $text){
    text
    complete
    id
   }
}
`;

class App extends Component {
  updateTodo = async todo => {
    await this.props.updateTodo({
      variables: {
        id: todo.id,
        complete: !todo.complete
      },
      update: store => {
        // Read the data from our cache for this query.
        const data = store.readQuery({ query: TodosQuery });
        // Add our comment from the mutation to the end.
        data.todos = data.todos.map(
            x => 
              x.id === todo.id 
                ? {
                  ...todo,
                  complete: !todo.complete
                } 
            : x
        );
        // Write our data back to the cache.
        store.writeQuery({ query: TodosQuery, data });
      }
    });
  };

  removeTodo = async todo => {
    await this.props.removeTodo({
      variables: {
        id: todo.id,
      },
      update: store => {
        const data = store.readQuery({ query: TodosQuery });
        data.todos = data.todos.filter( x=> x.id !== todo.id);
        store.writeQuery({ query: TodosQuery, data });
      }
    });

  };

  createTodo = async text => {
    await this.props.createTodo({
      variables: {
        text,
      },
      update: (store, { data: { createTodo } }) => {
        const data = store.readQuery({ query: TodosQuery });
        data.todos.unshift(createTodo);
        store.writeQuery({ query: TodosQuery, data });
      }
    });

  }

  render() {
    console.log(this.props);
    const {data: {loading, todos}} = this.props;
    if(loading){
      return null;
    }

    return (
    <div className = "container">
        <div className = "todoitem">
        <Paper elevation={1}>
        <Form submit ={this.createTodo}/>
            <List>
          {todos.map(todo => (
            <ListItem
              key={todo.id}
              role={undefined}
              dense
              button
              onClick={() => this.updateTodo(todo)}
            >
              <Checkbox
                checked={todo.complete}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary= {todo.text} />
              <ListItemSecondaryAction>
                <IconButton onClick={() =>this.removeTodo(todo)} >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>

            </Paper>

        </div>
    </div>
    );

      
  }
}


export default compose(
  graphql(CreateMutation, {name: "createTodo"}), 
  graphql(UpdateMutation, {name: "updateTodo"}), 
  graphql(RemoveMutation, {name: "removeTodo"}),
  graphql(TodosQuery)
)(App);
