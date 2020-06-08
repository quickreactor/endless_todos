var ENTER_KEY = 13;

var allTodos = [];
var newTodoInput = document.getElementById('new-todo-input');
var todosMainDiv = document.getElementById('todos-main-div');
var toggleAllButton = document.getElementById('toggle-all');


var util = {
    save: function (name, data) {
        localStorage.setItem(name, JSON.stringify(data));
    },
    load: function (name) {
        var saveData = localStorage.getItem(name)
        return (saveData && JSON.parse(saveData)) || [];
    }
}

function init () {
    allTodos = util.load('endless-todos');
    eventListeners();
    renderTodos();
    newTodoInput.focus();
}

function uuid() {
    /*jshint bitwise:false */
    var i, random;
    var uuid = '';

    for (i = 0; i < 32; i++) {
        random = Math.random() * 16 | 0;
        if (i === 8 || i === 12 || i === 16 || i === 20) {
            uuid += '-';
        }
        uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
    }

    return uuid;
}

function testFunction() {
    console.log("beans");
}

function renderTodos(todos, targetElement) {
    if (todos === undefined) {
        todos = allTodos.filter(e => e.parent === 0); // only root level todos
    }


    var newUl = document.createElement('ul');
    todos.forEach(function(e, i) {
        var todoLi = document.createElement('li');
        todoLi.innerHTML = `<div class="container"><div><input type="checkbox" class="toggle"${e.completed ? ' checked' : ''}><span ${e.completed ? 'class = "completed"': ''}>${e.name}</span></div><div class='buttons'><button class="edit-button">E</button><button class="delete-button">X</button><button class="sub-todo-button">+</button></div></div>`;
        todoLi.setAttribute("data-id", e.id);
        
        // if there are sub todos
        if (e.children && e.children.length > 0) {
            var childrenArray = [];
            e.children.forEach(child => {
                childrenArray.push(todoFromId(child));
            });
            renderTodos(childrenArray, todoLi);
        }
        newUl.appendChild(todoLi);
    });

    if (targetElement !== undefined) {
        targetElement.appendChild(newUl);
    } else {
        todosMainDiv.innerHTML = `<ul>${newUl.innerHTML}</ul>`;
    }
    console.log('todos after render', allTodos);
}

function addTodo(e) {
    if ((e.type === 'click' || e.keyCode === ENTER_KEY) && newTodoInput.value) {
    allTodos.push({
        name: newTodoInput.value.trim(),
        completed: false,
        parent: 0,
        children: [],
        id: uuid()
    });
    newTodoInput.value = '';
    console.log(allTodos);
    util.save('endless-todos', allTodos);
    renderTodos();
    }
}

function addSubTodo(id) {
    var subPrompt = prompt("What's the sub-todo?");
    if (subPrompt) {
        var parent = todoFromId(id);
        var subTodo = {
            name: subPrompt.trim(),
            completed: false,
            parent: parent.id,
            children: [],
            id: uuid()
        }
        allTodos.push(subTodo);
        parent.children.push(subTodo.id);
        util.save('endless-todos', allTodos);
        renderTodos();
    } else {
        alert('Nothing entered');
    }
}

function mainClickRouter(e) {
    var targetLi = e.target.closest('li');
    var id = targetLi.getAttribute("data-id");
    
    if (e.target.matches('.edit-button')) {
        editTodo(id);
    }
    if (e.target.matches('.delete-button')) {
        deleteTodo(id);
    }
    if (e.target.matches('.toggle')) {
        toggle(id);
    }
    if (e.target.matches('.sub-todo-button')) {
        addSubTodo(id);
    }
}

function deleteTodo(id) {
    var todoElement = todoFromId(id);
    var index = indexFromId(allTodos, id);

    if (todoElement.children && todoElement.children.length > 0) {
        todoElement.children.forEach(e => {
            deleteTodo(e);
        });
    }
    if (todoElement.parent !== 0){
        var parentId = todoElement.parent;
        var parent = todoFromId(parentId);
        var childIndex = indexFromId(parent.children, id);
        parent.children.splice(childIndex, 1);
    }
    

    allTodos.splice(index, 1);
    util.save('endless-todos', allTodos);
    renderTodos();
}

function editTodo(id) {
    var todoElement = todoFromId(id);
    var editPrompt = prompt("Editing mode", todoElement.name);
    todoElement.name = editPrompt;
    util.save('endless-todos', allTodos);
    renderTodos();
}

function toggle(id, parentState) {
    var index = indexFromId(allTodos, id);
    if (parentState !== undefined) {
        allTodos[index].completed = parentState;
    } else {
        allTodos[index].completed = !allTodos[index].completed;
    }


    // setting children to same as parent
    var parentCompleted = allTodos[index].completed;
    var todoElement = todoFromId(id);
    if (todoElement.children && todoElement.children.length > 0) {
        todoElement.children.forEach(e => {
            toggle(e, parentCompleted);
        });
    }

    util.save('endless-todos', allTodos);
    renderTodos();
}

function toggleAll() {
    if (allTodos.every(e => e.completed === true)) {
        allTodos.forEach(e => {e.completed = false});
    } else {
        allTodos.forEach(e => {e.completed = true});
    }
    util.save('endless-todos', allTodos);
    renderTodos();
}

function todoFromId(id) {
    return allTodos.find(e => e.id === id);
}

function indexFromId(array, id) {
    return array.findIndex(e => e.id === id || e === id);
}

function eventListeners () {
    todosMainDiv.addEventListener('click', mainClickRouter);
    newTodoInput.addEventListener('click', testFunction);
    newTodoInput.addEventListener('keyup', addTodo);
    toggleAllButton.addEventListener('click', toggleAll);
    document.getElementById('ok-button').addEventListener('click', addTodo);
}

function reset () {
    allTodos = [];
    util.save('endless-todos', allTodos);
}


init();

// things I could add
// CSS
// ability to click on todo and go into it like workflowy
// ability to edit by using contenteditable