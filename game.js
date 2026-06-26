(function() {
    console.log("SOLAR_OS: Advanced Ignition Sequence Started.");

    const setup = () => {
        const startBtn = document.getElementById('startBtn');
        const restartBtn = document.getElementById('restartBtn'); 
        const startScreen = document.getElementById('startScreen');
        const gameOverScreen = document.getElementById('gameOverScreen');
        const hud = document.getElementById('hud');
        const canvas = document.getElementById('gameCanvas');
        const scoreDisplay = document.getElementById('scoreDisplay');
        const livesDisplay = document.getElementById('livesDisplay');
        const finalDistanceText = document.getElementById('finalDistance');

        if (!startBtn || !canvas || !restartBtn) return;

        const ctx = canvas.getContext('2d');
        
        // Стан гри
        let gameRunning = false;
        let frame = 0;
        let lives = 3;
        let distance = 0;
        let speed = 5;
        let obstacles = [];
        let player = { x: 80, y: 0, r: 15, targetY: 0 };

        const resize = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
            player.y = canvas.height / 2;
            player.targetY = canvas.height / 2;
        };
        window.addEventListener('resize', resize);
        resize();

        // Керування
        const moveHandler = (e) => {
            if (!gameRunning) return;
            const rect = canvas.getBoundingClientRect();
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;
            player.targetY = clientY - rect.top;
        };
        canvas.addEventListener('mousemove', moveHandler);
        canvas.addEventListener('touchmove', (e) => { moveHandler(e); e.preventDefault(); }, { passive: false });

        // Функція для повного скидання стану гри
        function resetGame() {
            lives = 3;
            distance = 0;
            frame = 0;
            speed = 5;
            obstacles = [];
            player.y = canvas.height / 2;
            player.targetY = canvas.height / 2;
            
           
            livesDisplay.textContent = '❤️❤️❤️';
            scoreDisplay.textContent = `DISTANCE: 0m`;
            canvas.classList.remove('animate-pulse');
        }

      
        function drawRocket(x, y) {
            ctx.save();
            ctx.translate(x, y);
            const fireSize = 15 + Math.random() * 15;
            const fireGrad = ctx.createLinearGradient(-10, 0, -10 - fireSize, 0);
            fireGrad.addColorStop(0, '#ffaa00');
            fireGrad.addColorStop(1, 'transparent');
            ctx.fillStyle = fireGrad;
            ctx.beginPath();
            ctx.moveTo(-10, -7); ctx.lineTo(-10 - fireSize, 0); ctx.lineTo(-10, 7);
            ctx.fill();
            ctx.fillStyle = '#00e5ff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#00e5ff';
            ctx.beginPath(); ctx.ellipse(0, 0, 20, 10, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.moveTo(15, -10); ctx.lineTo(28, 0); ctx.lineTo(15, 10); ctx.fill();
            ctx.fillStyle = '#ffffff';
            ctx.beginPath(); ctx.arc(7, 0, 4, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        function drawComet(o) {
            ctx.save();
            const tailLen = o.r * 4;
            const grad = ctx.createLinearGradient(o.x, o.y, o.x + tailLen, o.y);
            grad.addColorStop(0, 'rgba(255, 68, 68, 0.6)');
            grad.addColorStop(1, 'transparent');
            ctx.fillStyle = grad;
            ctx.beginPath(); ctx.moveTo(o.x, o.y - o.r); ctx.lineTo(o.x + tailLen, o.y); ctx.lineTo(o.x, o.y + o.r); ctx.fill();
            ctx.fillStyle = '#555';
            ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

     
        startBtn.onclick = function(e) {
            e.preventDefault();
            resetGame();
            gameRunning = true;
            startScreen.style.setProperty('display', 'none', 'important');
            hud.style.setProperty('display', 'flex', 'important');
            gameLoop();
        };

        
        restartBtn.onclick = function(e) {
            e.preventDefault();
            resetGame(); 
            gameOverScreen.classList.add('hidden'); 
            gameRunning = true; 
            gameLoop(); 
        };

        function gameLoop() {
            if (!gameRunning) return;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            frame++;
            distance = Math.floor(frame / 5);
            scoreDisplay.textContent = `DISTANCE: ${distance}m`;
            speed = 5 + (frame / 1000);

            player.y += (player.targetY - player.y) * 0.12;
            drawRocket(player.x, player.y);

            if (frame % Math.max(15, Math.floor(50 - speed)) === 0) {
                obstacles.push({
                    x: canvas.width + 100,
                    y: Math.random() * canvas.height,
                    r: 10 + Math.random() * 20,
                    spd: speed + (Math.random() * 3)
                });
            }

            for (let i = obstacles.length - 1; i >= 0; i--) {
                let o = obstacles[i];
                o.x -= o.spd;
                drawComet(o);

                const dx = player.x - o.x;
                const dy = player.y - o.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < player.r + o.r) {
                    obstacles.splice(i, 1);
                    lives--;
                    livesDisplay.textContent = '❤️'.repeat(Math.max(0, lives));
                    
                    canvas.classList.add('animate-pulse');
                    setTimeout(() => canvas.classList.remove('animate-pulse'), 200);

                    if (lives <= 0) {
                        gameRunning = false;
                        finalDistanceText.textContent = `ДИСТАНЦІЯ: ${distance}m`;
                        gameOverScreen.classList.remove('hidden'); 
                        return; 
                    }
                }
                if (o.x < -100) obstacles.splice(i, 1);
            }
            requestAnimationFrame(gameLoop);
        }
    };

    const checkBtn = setInterval(() => {
        if (document.getElementById('startBtn') && document.getElementById('restartBtn')) {
            setup();
            clearInterval(checkBtn);
        }
    }, 100);
})();
