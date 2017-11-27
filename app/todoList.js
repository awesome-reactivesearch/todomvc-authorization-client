import React, { Component } from 'react';

import TodoItem from "./todoItem";
import TodoFooter from "./todoFooter";

const ALL_TODOS = "all";
const ACTIVE_TODOS = "active";
const COMPLETED_TODOS = "completed";

class TodoList extends Component {
    constructor(props) {
        super(props);
        this.state = {
            nowShowing: ALL_TODOS,
            showWarning: false
        }
    }

    handleToggle = (e) => {
        this.setState({
          nowShowing: e
        });
    }

    showWarning = () => {
        if (!this.state.showWarning) {
            this.setState({
                showWarning: true
            })
        }
    }

    hideWarning = () => {
        if (this.state.showWarning) {
            this.setState({
                showWarning: false
            });
        }
    }

    toggle (todoToToggle) {
        if (
            !this.props.auth.isAuthenticated() ||
            !this.props.auth.userHasScopes(['write:todos']) ||
            this.props.auth.getUserEmail() !== todoToToggle.createdBy
        ) {
            this.showWarning();
            return;
        }
        this.hideWarning();
        this.props.model.toggle(todoToToggle)
    }

    destroy (todo) {
        if (
            !this.props.auth.isAuthenticated() || 
            !this.props.auth.userHasScopes(['write:todos']) ||
            this.props.auth.getUserEmail() !== todo.createdBy
        ) {
            this.showWarning();
            return;
        }
        this.props.model.destroy(todo)
    }

    save (todoToSave, text) {
        if (
            !this.props.auth.isAuthenticated() || 
            !this.props.auth.userHasScopes(['write:todos']) ||
            this.props.auth.getUserEmail() !== todoToSave.createdBy
        ) {
            this.showWarning();
            return;
        }
        this.hideWarning();
        this.props.model.save(todoToSave, text);
    }
    
    clearCompleted = () => {
        if (
            !this.props.auth.isAuthenticated() || 
            !this.props.auth.userHasScopes(['write:todos'])
        ) {
            return;
        }
        this.props.model.clearCompleted()
    }

    render() {
        let footer,
        todos = this.props.model.todos.sort((a, b) => b.createdAt - a.createdAt);   // order latest first
    
        let activeTodoCount = todos.reduce((accum, todo) => {
          return todo.completed ? accum : accum + 1
        }, 0);
    
        let completedCount = todos.length - activeTodoCount;
    
        if (activeTodoCount || completedCount) {
          footer =
          <TodoFooter
            count={activeTodoCount}
            completedCount={completedCount}
            nowShowing={this.state.nowShowing}
            onClearCompleted={this.clearCompleted}
            handleToggle={this.handleToggle}
          />
        }

        if (this.state.nowShowing !== ALL_TODOS) {
            todos = todos.filter((todo) => todo.completed === (this.state.nowShowing === COMPLETED_TODOS));
        }
        return (
            <div>
                <div>
                    {
                        todos.map((todo) => {
                            return (
                                <TodoItem
                                    key={todo.id}
                                    todo={{...todo}}
                                    onToggle={this.toggle.bind(this, todo)}
                                    onDestroy={this.destroy.bind(this, todo)}
                                    onSave={this.save.bind(this, todo)}
                                />
                            );
                        })
                    }
                    {footer}
                </div>
                {
                    (!this.props.auth.isAuthenticated() || 
                    !this.props.auth.userHasScopes(['write:todos'])) &&
                    <div className="auth-text unauth-msg">
                        <code className="alert">write:todos</code> scope is required to modify todos
                    </div>
                }
                {
                    this.state.showWarning &&
                    <div className="auth-text unauth-msg">
                        You may only modify your own todos
                    </div>
                }
            </div>
        );
    }
}

export default TodoList;
