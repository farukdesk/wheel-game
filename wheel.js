class WheelOfNames {
    constructor() {
        this.names = [];
        this.canvas = document.getElementById('wheel');
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
    }

    bindEvents() {
        document.getElementById('manualSpin').addEventListener('click', () => {
            this.spinWheel();
        });
    }

    loadNames() {
        this.names = JSON.parse(localStorage.getItem('wheelNames')) || [];
        if (this.names.length === 0) {
            this.names = ['Add names in admin panel'];
        }
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
        const minutes = Math.floor(this.timer / 60);
        const seconds = this.timer % 60;
        const display = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById('countdown').textContent = display;
    }

    drawWheel() {
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
        this.drawWheel();
        
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

        this.canvas.style.transform = `rotate(${finalRotation}deg)`;

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
        const resultDiv = document.getElementById('result');
        const winnerNameDiv = resultDiv.querySelector('.winner-name');
        
        winnerNameDiv.textContent = winner;
        resultDiv.classList.remove('hidden');

        // Hide result after 10 seconds and reset wheel
        setTimeout(() => {
            this.hideResult();
            this.resetWheel();
        }, 10000);
    }

    hideResult() {
        document.getElementById('result').classList.add('hidden');
    }

    resetWheel() {
        this.canvas.style.transform = 'rotate(0deg)';
        this.drawWheel();
    }
}

// Initialize the wheel when page loads
window.addEventListener('load', () => {
    new WheelOfNames();
});