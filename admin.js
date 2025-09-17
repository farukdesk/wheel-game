class AdminPanel {
    constructor() {
        this.names = JSON.parse(localStorage.getItem('wheelNames')) || [];
        this.init();
    }

    init() {
        this.renderNamesList();
        this.bindEvents();
    }

    bindEvents() {
        document.getElementById('nameForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addName();
        });

        document.getElementById('clearNames').addEventListener('click', () => {
            this.clearAllNames();
        });
    }

    addName() {
        const nameInput = document.getElementById('nameInput');
        const name = nameInput.value.trim();
        
        if (name && !this.names.includes(name)) {
            this.names.push(name);
            this.saveNames();
            this.renderNamesList();
            nameInput.value = '';
            nameInput.focus();
        }
    }

    clearAllNames() {
        if (confirm('Are you sure you want to clear all names?')) {
            this.names = [];
            this.saveNames();
            this.renderNamesList();
        }
    }

    renderNamesList() {
        const namesList = document.getElementById('namesList');
        namesList.innerHTML = '';
        
        if (this.names.length === 0) {
            namesList.innerHTML = '<li>No names added yet</li>';
            return;
        }

        this.names.forEach((name, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <span>${name}</span>
                <button onclick="adminPanel.removeName(${index})" style="margin-left: 10px; padding: 5px 10px; font-size: 12px;">Remove</button>
            `;
            namesList.appendChild(li);
        });
    }

    removeName(index) {
        this.names.splice(index, 1);
        this.saveNames();
        this.renderNamesList();
    }

    saveNames() {
        localStorage.setItem('wheelNames', JSON.stringify(this.names));
    }
}

const adminPanel = new AdminPanel();