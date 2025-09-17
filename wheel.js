class WheelOfNames {
    constructor() {
        this.names = [];
        this.canvas = document.getElementById('wheel');
        if (!this.canvas) {
            // If no canvas element, this is likely the admin page
            // Only bind events for manual spin if button exists
            this.bindEvents();
            return;
        }
        this.ctx = this.canvas.getContext('2d');
        this.isSpinning = false;
        this.timer = 120; // 2 minutes in seconds
        this.timerInterval = null;
        this.autoSpinTimeout = null;
        
        this.init();
    }

    init() {
        this.loadNames();
        this.drawWheel();
        this.startTimer();
        this.bindEvents();
        this.startNameRefresh();
    }

    bindEvents() {
        const manualSpinButton = document.getElementById('manualSpin');
        if (manualSpinButton) {
            manualSpinButton.addEventListener('click', () => {
                this.spinWheel();
            });
        }
    }

    loadNames() {
        this.names = JSON.parse(localStorage.getItem('wheelNames')) || [];
        if (this.names.length === 0) {
            this.names = ['Add names in admin panel'];
        }
    }

    startNameRefresh() {
        // Listen for storage changes from other tabs
        window.addEventListener('storage', (e) => {
            if (e.key === 'wheelNames') {
                this.loadNames();
                this.drawWheel();
            }
        });

        // Also refresh every 2 seconds to catch same-tab updates
        setInterval(() => {
            const currentNames = JSON.stringify(this.names);
            this.loadNames();
            const newNames = JSON.stringify(this.names);
            if (currentNames !== newNames) {
                this.drawWheel();
            }
        }, 2000);
    }

    startTimer() {
        this.updateTimerDisplay();
        
        this.timerInterval = setInterval(() => {
            this.timer--;
            this.updateTimerDisplay();
            
            if (this.timer <= 0) {
                this.spinWheel();
                this.resetTimer();
            }
        }, 1000);
    }

    resetTimer() {
        this.timer = 120; // Reset to 2 minutes
        this.updateTimerDisplay();
    }

    updateTimerDisplay() {
        const countdownElement = document.getElementById('countdown');
        if (countdownElement) {
            const minutes = Math.floor(this.timer / 60);
            const seconds = this.timer % 60;
            const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
            countdownElement.textContent = display;
        }
    }

    drawWheel() {
        if (!this.canvas) return; // Skip if no canvas
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 180;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.names.length === 0) return;

        const anglePerSegment = (2 * Math.PI) / this.names.length;
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

        this.names.forEach((name, index) => {
            const startAngle = index * anglePerSegment;
            const endAngle = (index + 1) * anglePerSegment;

            // Draw segment
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            this.ctx.closePath();
            this.ctx.fillStyle = colors[index % colors.length];
            this.ctx.fill();
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw text
            this.ctx.save();
            this.ctx.translate(centerX, centerY);
            this.ctx.rotate(startAngle + anglePerSegment / 2);
            this.ctx.textAlign = 'center';
            this.ctx.fillStyle = '#fff';
            this.ctx.font = 'bold 14px Arial';
            this.ctx.fillText(name, radius / 1.5, 5);
            this.ctx.restore();
        });

        // Draw center circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#333';
        this.ctx.fill();
    }

    spinWheel() {
        if (this.isSpinning) return;
        
        this.loadNames(); // Refresh names from localStorage
        if (this.canvas) {
            this.drawWheel();
        }
        
        if (this.names.length === 0 || this.names[0] === 'Add names in admin panel') {
            alert('Please add names in the admin panel first!');
            return;
        }

        this.isSpinning = true;
        this.hideResult();

        // Random rotation (at least 5 full spins)
        const minRotation = 1800; // 5 full rotations
        const maxRotation = 3600; // 10 full rotations
        const finalRotation = Math.random() * (maxRotation - minRotation) + minRotation;

        if (this.canvas) {
            this.canvas.style.transform = `rotate(${finalRotation}deg)`;
        }

        setTimeout(() => {
            this.determineWinner(finalRotation);
            this.isSpinning = false;
        }, 10000); // 10 seconds spin duration
    }

    determineWinner(rotation) {
        const normalizedRotation = (360 - (rotation % 360)) % 360;
        const anglePerSegment = 360 / this.names.length;
        const winnerIndex = Math.floor(normalizedRotation / anglePerSegment);
        const winner = this.names[winnerIndex];

        this.showWinner(winner);
    }

    showWinner(winner) {
        this.showWinnerModal(winner);
        
        const resultDiv = document.getElementById('result');
        if (resultDiv) {
            const winnerNameDiv = resultDiv.querySelector('.winner-name');
            if (winnerNameDiv) {
                winnerNameDiv.textContent = winner;
            }
            resultDiv.classList.remove('hidden');

            // Hide result after 10 seconds and reset wheel
            setTimeout(() => {
                this.hideResult();
                this.resetWheel();
            }, 10000);
        }
    }

    showWinnerModal(winner) {
        // Create modal if it doesn't exist
        let modal = document.getElementById('winnerModal');
        if (!modal) {
            modal = this.createWinnerModal();
        }

        // Set winner name
        const winnerText = modal.querySelector('.modal-winner-name');
        winnerText.textContent = winner;

        // Show modal
        modal.style.display = 'flex';
        
        // Start confetti
        this.startConfetti();

        // Close modal after 5 seconds
        setTimeout(() => {
            modal.style.display = 'none';
            this.stopConfetti();
        }, 5000);

        // Close modal on click
        modal.onclick = (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                this.stopConfetti();
            }
        };
    }

    createWinnerModal() {
        const modal = document.createElement('div');
        modal.id = 'winnerModal';
        modal.className = 'winner-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="confetti-container"></div>
                <h2>🎉 Congratulations! 🎉</h2>
                <div class="modal-winner-name"></div>
                <p>You are the winner!</p>
                <button class="modal-close" onclick="document.getElementById('winnerModal').style.display='none'">Close</button>
            </div>
        `;
        document.body.appendChild(modal);
        return modal;
    }

    startConfetti() {
        const container = document.querySelector('.confetti-container');
        if (!container) return;

        // Clear existing confetti
        container.innerHTML = '';

        // Create confetti pieces
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti-piece';
            confetti.style.left = Math.random() * 100 + '%';
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
            confetti.style.backgroundColor = this.getRandomColor();
            container.appendChild(confetti);
        }
    }

    stopConfetti() {
        const container = document.querySelector('.confetti-container');
        if (container) {
            container.innerHTML = '';
        }
    }

    getRandomColor() {
        const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    hideResult() {
        const resultElement = document.getElementById('result');
        if (resultElement) {
            resultElement.classList.add('hidden');
        }
    }

    resetWheel() {
        if (!this.canvas) return; // Skip if no canvas
        this.canvas.style.transform = 'rotate(0deg)';
        this.drawWheel();
    }
}

// Initialize the wheel when page loads
window.addEventListener('load', () => {
    new WheelOfNames();
});