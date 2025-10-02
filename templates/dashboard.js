function toggleTheme() {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    localStorage.setItem('lightMode', isLightMode);            

    const button = document.querySelector('.theme-toggle');
    if (isLightMode) {
        button.textContent = 'Switch to Light Mode';
    } else {
        button.textContent = 'Switch to Dark Mode';
    }
}

function toggleFlyout() {
    const flyout = document.getElementById('flyout');
    flyout.classList.toggle('hidden');
}

function createTodoModal() {
    if (document.getElementById('todo-modal')) return;

    const modalOverlay = document.createElement('div');
    modalOverlay.id = 'todo-modal';
    modalOverlay.innerHTML = `
        <div class="modal-box">
            <input type="text" placeholder="Enter new todo">
            <div class="button-container">
                <button class="modal-button" onclick="submitTodo(this)">Save</button>
                <button class="modal-button" onclick="closeModal()">Close</button>
            </div>
        </div>
    `;
    document.body.appendChild(modalOverlay);
}

function openModal() {
    const modal = document.getElementById('todo-modal');
    if (modal) {
        modal.style.display = 'flex';
        const input = modal.querySelector('input');
        if (input) input.value = '';
        input.focus();
    }
}

function closeModal() {
    const modal = document.getElementById('todo-modal');
    if (modal) modal.style.display = 'none';
}

function submitTodo(button) {
    const modal = document.getElementById('todo-modal');
    const input = modal.querySelector('input');
    const text = input.value.trim();
    
    if (text) {
        fetch('/todos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `text=${encodeURIComponent(text)}`
        })
        .then(response => response.text())
        .then(html => {
            const todoContainer = document.getElementById('todo');
            if (todoContainer) {
                // Preserve the heading and button
                const heading = todoContainer.querySelector('h2').outerHTML;
                const button = todoContainer.querySelector('.todo-add-button').outerHTML;
                todoContainer.innerHTML = heading + button + '<div id="todo-list">' + html + '</div>';
                
                // Re-attach click handlers for new todos
                todoContainer.querySelectorAll('.todo-item').forEach(el => {
                    el.addEventListener('click', (e) => {
                        if (!e.target.classList.contains('todo-item-delete')) {
                            el.classList.toggle('completed');
                        }
                    });
                });
            }
        })
        .catch(err => console.error('Failed to add Todo:', err));
        
        closeModal();
    }
}

function addTodo() {
    createTodoModal();
    openModal();
}

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('#flyout input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
            const containerId = cb.value;
            const container = document.getElementById(containerId);
            if (container) {
                if (cb.checked) {
                    container.style.display = 'block';
                } else {
                    container.style.display = 'none';
                }
            }
        });
    });

    document.querySelectorAll('#flyout input[type="checkbox"]').forEach(cb => {
        const containerId = cb.value;
        const container = document.getElementById(containerId);
        if (container) {
            container.style.display = cb.checked ? 'block' : 'none';
        }
    });

    const savedTheme = localStorage.getItem('darkMode');

    if (savedTheme !== null) {
        if (savedTheme === 'true') {
            document.body.classList.add('dark-mode');
            document.querySelector('.theme-toggle').textContent = 'Switch to Light Mode';
        }
    } else {
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.classList.add('dark-mode');
            document.querySelector('.theme-toggle').textContent = 'Switch to Light Mode';
        }
    }

    setInterval(() => {
        fetch('/').then(response => response.text()).then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newSystemData = doc.getElementById('systemMonitor');

            if (newSystemData) {
                document.getElementById('systemMonitor').innerHTML = newSystemData.innerHTML;
            }
        });
    }, 5000);

    loadTodos();
});

function loadTodos() {
    fetch('/todos')
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('todo');
            if (container) {
                // Preserve the heading and button
                const heading = container.querySelector('h2').outerHTML;
                const button = container.querySelector('.todo-add-button').outerHTML;
                container.innerHTML = heading + button + '<div id="todo-list">' + html + '</div>';

                // Attach click handler for todo items (no delete functionality)
                container.querySelectorAll('.todo-item').forEach(el => {
                    el.addEventListener('click', (e) => {
                        if (!e.target.classList.contains('todo-item-delete')) {
                            el.classList.toggle('completed');
                        }
                    });
                });
            }
        })
        .catch(err => console.error('Failed to load Todos:', err));
}
