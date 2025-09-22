// Game variables
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const playButton = document.getElementById('playButton');
const correctSound = document.getElementById('correctSound');
const wrongSound = document.getElementById('wrongSound');

// Game settings
let gameRunning = false;
let score = 0;
let currentTargetLetter;
let letters = [];
let targetDisplay = {
    visible: false,
    text: ''
};

// Characters collected on the slate
let collectedCharacters = [];
const MAX_CHARACTERS = 4;

// Slate object (controlled by player)
const slate = {
    x: canvas.width / 2 - 50,
    y: canvas.height * 0.7 - 10, // Position on top of water, not inside
    width: 100,
    height: 20,
    speed: 5,
    showCharacter: false
};

// Hindi letters for the game
const hindiLetters = [
    { letter: 'अ', sound: 'a' },
    { letter: 'आ', sound: 'aa' },
    { letter: 'इ', sound: 'i' },
    { letter: 'ई', sound: 'ee' },
    { letter: 'उ', sound: 'u' },
    { letter: 'ऊ', sound: 'oo' },
    { letter: 'ए', sound: 'e' },
    { letter: 'ऐ', sound: 'ai' },
    { letter: 'ओ', sound: 'o' },
    { letter: 'औ', sound: 'au' },
    { letter: 'क', sound: 'ka' },
    { letter: 'ख', sound: 'kha' },
    { letter: 'ग', sound: 'ga' },
    { letter: 'घ', sound: 'gha' },
    { letter: 'च', sound: 'cha' },
    { letter: 'छ', sound: 'chha' },
    { letter: 'ज', sound: 'ja' },
    { letter: 'झ', sound: 'jha' },
    { letter: 'ट', sound: 'ta' },
    { letter: 'ठ', sound: 'tha' },
    { letter: 'ड', sound: 'da' },
    { letter: 'ढ', sound: 'dha' },
    { letter: 'त', sound: 'ta_soft' },
    { letter: 'थ', sound: 'tha_soft' },
    { letter: 'द', sound: 'da_soft' },
    { letter: 'ध', sound: 'dha_soft' },
    { letter: 'न', sound: 'na' },
    { letter: 'प', sound: 'pa' },
    { letter: 'फ', sound: 'pha' },
    { letter: 'ब', sound: 'ba' },
    { letter: 'भ', sound: 'bha' },
    { letter: 'म', sound: 'ma' },
    { letter: 'य', sound: 'ya' },
    { letter: 'र', sound: 'ra' },
    { letter: 'ल', sound: 'la' },
    { letter: 'व', sound: 'va' },
    { letter: 'श', sound: 'sha' },
    { letter: 'ष', sound: 'sha_hard' },
    { letter: 'स', sound: 'sa' },
    { letter: 'ह', sound: 'ha' }
];

// Track misses (wrong attempts)
let misses = 0;
const MAX_MISSES = 4;

// Audio control
let soundInterval = null;
let currentAudio = null;

// Water splash effects
let waterSplashes = [];

// Update octopus chances display and wooden slates
function updateOctopusChances() {
    const octopusChances = document.getElementById('octopusChances');
    if (octopusChances) {
        octopusChances.textContent = misses;
    }
    updateChancesBar();
}

function updateChancesBar() {
    const slates = document.querySelectorAll('.chance-slate');
    slates.forEach((slate, idx) => {
        // Remove any previous cross
        let cross = slate.parentElement.querySelector('.slate-cross[data-index="' + idx + '"]');
        if (cross) cross.remove();
        // If this miss has occurred, overlay a cross
        if (idx < misses) {
            const crossMark = document.createElement('span');
            crossMark.className = 'slate-cross';
            crossMark.setAttribute('data-index', idx);
            crossMark.textContent = '✕';
            crossMark.style.position = 'absolute';
            crossMark.style.left = (slate.offsetLeft + 33) + 'px';
            crossMark.style.top = (slate.offsetTop + 10) + 'px';
            crossMark.style.fontSize = '28px';
            crossMark.style.color = '#FF0000';
            crossMark.style.fontWeight = 'bold';
            crossMark.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            crossMark.style.pointerEvents = 'none';
            crossMark.style.userSelect = 'none';
            crossMark.style.zIndex = 20;
            slate.parentElement.appendChild(crossMark);
        }
    });
}

// Load images
const slateImage = new Image();
slateImage.src = 'images/slate.svg';

const parachuteImage = new Image();
parachuteImage.src = 'images/parachute.png';

const characterImage = new Image();
characterImage.src = 'images/character.png';

const backgroundImage = new Image();
backgroundImage.src = 'images/background.svg';

const turtleImage = new Image();
turtleImage.src = 'images/turtleimg.png';

// Key states for movement
const keys = {
    ArrowLeft: false,
    ArrowRight: false
};

// Event listeners
playButton.addEventListener('click', startGame);

// Replay sound button removed as requested

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) {
        keys[e.key] = false;
    }
});

// Add event listeners for movement arrows
window.addEventListener('DOMContentLoaded', () => {
    const leftArrow = document.getElementById('leftArrow');
    const rightArrow = document.getElementById('rightArrow');
    if (leftArrow) {
        leftArrow.addEventListener('mousedown', () => {
            keys.ArrowLeft = true;
        });
        leftArrow.addEventListener('mouseup', () => {
            keys.ArrowLeft = false;
        });
        leftArrow.addEventListener('mouseleave', () => {
            keys.ArrowLeft = false;
        });
        leftArrow.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys.ArrowLeft = true;
        });
        leftArrow.addEventListener('touchend', () => {
            keys.ArrowLeft = false;
        });
    }
    if (rightArrow) {
        rightArrow.addEventListener('mousedown', () => {
            keys.ArrowRight = true;
        });
        rightArrow.addEventListener('mouseup', () => {
            keys.ArrowRight = false;
        });
        rightArrow.addEventListener('mouseleave', () => {
            keys.ArrowRight = false;
        });
        rightArrow.addEventListener('touchstart', (e) => {
            e.preventDefault();
            keys.ArrowRight = true;
        });
        rightArrow.addEventListener('touchend', () => {
            keys.ArrowRight = false;
        });
    }
});

// Game functions
function startGame() {
    if (!gameRunning) {
        // Stop any existing sounds
        stopRepeatingSound();
        
        gameRunning = true;
        score = 0;
        letters = [];
        collectedCharacters = [];
        targetDisplay.visible = false;
        playButton.textContent = 'Restart';
        misses = 0; // Reset misses to 0
        updateOctopusChances();
        generateNewTargetLetter();
        gameLoop();
    } else {
        // Restart the game - but prevent infinite loop
        gameRunning = false;
        stopRepeatingSound(); // Stop sounds when restarting
        setTimeout(() => {
            startGame();
        }, 100);
    }
}

function generateNewTargetLetter() {
    const randomIndex = Math.floor(Math.random() * hindiLetters.length);
    currentTargetLetter = hindiLetters[randomIndex];
    
    // Update the target display
    targetDisplay.visible = true;
    targetDisplay.text = `Listen and collect: ${currentTargetLetter.letter}`;
    
    // Play the sound of the letter
    playLetterSound(currentTargetLetter.sound);
    
    console.log(`Listen to sound: ${currentTargetLetter.sound} and collect the letter: ${currentTargetLetter.letter}`);
}

function playLetterSound(sound) {
    // Stop any existing sound
    stopRepeatingSound();
    
    try {
        // Try to play the audio file for the letter sound
        currentAudio = new Audio(`sounds/${sound}.mp3`);
        currentAudio.play().catch(e => {
            console.log('Audio file not found, using text-to-speech fallback');
            // Fallback to text-to-speech if audio file doesn't exist
            startRepeatingSpeech(sound);
        });
        
        // Set up repeating audio
        currentAudio.addEventListener('ended', () => {
            if (currentAudio && gameRunning) {
                currentAudio.currentTime = 0;
                currentAudio.play();
            }
        });
        
    } catch (e) {
        console.log('Audio not available, using text-to-speech');
        startRepeatingSpeech(sound);
    }
}

function startRepeatingSpeech(sound) {
    // Repeat speech every 3 seconds
    soundInterval = setInterval(() => {
        if (gameRunning) {
            speakLetter(sound);
        }
    }, 3000);
    
    // Play immediately
    speakLetter(sound);
}

function stopRepeatingSound() {
    // Stop audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    
    // Stop speech interval
    if (soundInterval) {
        clearInterval(soundInterval);
        soundInterval = null;
    }
}

function speakLetter(sound) {
    // Use Web Speech API as fallback
    if ('speechSynthesis' in window) {
        const cleanSound = sound.replace(/_/g, ' '); // Replace underscores with spaces
        const utterance = new SpeechSynthesisUtterance(cleanSound);
        utterance.lang = 'hi-IN'; // Hindi language
        utterance.rate = 0.7; // Slower speech
        utterance.pitch = 1.0;
        speechSynthesis.speak(utterance);
    } else {
        console.log('Speech synthesis not supported');
    }
}

function createLetter() {
    if (!gameRunning) return;
    
    // Randomly select if this will be the target letter or a different one
    let letterObj;
    const isTarget = Math.random() < 0.3; // 30% chance of being the target letter
    
    if (isTarget) {
        letterObj = currentTargetLetter;
    } else {
        // Select a random letter that is not the target
        let randomIndex;
        do {
            randomIndex = Math.floor(Math.random() * hindiLetters.length);
        } while (hindiLetters[randomIndex].letter === currentTargetLetter.letter);
        
        letterObj = hindiLetters[randomIndex];
    }
    
    const letter = {
        x: Math.random() * (canvas.width - 100) + 50,
        y: -100,
        width: 160, // Increased width
        height: 130, // Increased height
        letter: letterObj.letter,
        isTarget: isTarget,
        speed: 0.7 + Math.random() * 0.7, // Reduced speed
        collected: false
    };
    
    letters.push(letter);
}

function updateGame() {
    // Move the slate based on key presses
    if (keys.ArrowLeft && slate.x > 0) {
        slate.x -= slate.speed;
    }
    if (keys.ArrowRight && slate.x < canvas.width - slate.width) {
        slate.x += slate.speed;
    }
    
    // Update letters position and check for collisions
    for (let i = 0; i < letters.length; i++) {
        const letter = letters[i];
        
        if (!letter.collected) {
            letter.y += letter.speed;
            
            // Check for collision with slate
            if (letter.y + letter.height > slate.y && 
                letter.y < slate.y + slate.height && 
                letter.x + letter.width > slate.x && 
                letter.x < slate.x + slate.width) {
                
                letter.collected = true;
                
                if (letter.isTarget) {
                    // Stop the repeating sound when correct letter is collected
                    stopRepeatingSound();
                    
                    // Correct letter collected
                    score++;
                    // Try to play the correct sound if available
                    if (correctSound) {
                        try {
                            correctSound.play();
                        } catch (e) {
                            console.log('Could not play sound:', e);
                        }
                    }
                    console.log('Correct letter collected!');
                    
                    // Add character to the collected characters array
                    collectedCharacters.push({
                        letter: letter.letter,
                        x: slate.x + (collectedCharacters.length * 25) // Position characters side by side
                    });
                    
                    // Check if we've collected the maximum number of characters
                    if (collectedCharacters.length >= MAX_CHARACTERS) {
                        // Instead of congratulating, decrement a chance and reset collectedCharacters
                        misses = Math.min(MAX_MISSES, misses + 1);
                        updateOctopusChances();
                        collectedCharacters = [];
                        if (misses >= MAX_MISSES) {
                            showGameOverBox();
                            gameRunning = false;
                            return;
                        }
                    }
                    
                    // Generate a new target letter (which will start the new sound)
                    generateNewTargetLetter();
                    // Remove the collected letter from the array
                    letters.splice(i, 1);
                    i--;
                } else {
                    // Wrong letter collected
                    if (wrongSound) {
                        try {
                            wrongSound.play();
                        } catch (e) {
                            console.log('Could not play sound:', e);
                        }
                    }
                    misses = Math.min(MAX_MISSES, misses + 1);
                    updateOctopusChances();
                    console.log('Wrong letter collected!');
                    // End game if max misses reached
                    if (misses >= MAX_MISSES) {
                        showGameOverBox();
                        gameRunning = false;
                        return;
                    }
                    // Remove the collected letter from the array
                    letters.splice(i, 1);
                    i--;
                }
            }
        }
        
        // Check if letter hits the water
        if (letter.y > canvas.height * 0.7) {
            // Create water splash effect
            createWaterSplash(letter.x + letter.width / 2, canvas.height * 0.7);
            
            // Play drop sound
            playDropSound();
            
            // Remove the letter (make it invisible)
            letters.splice(i, 1);
            i--;
        }
    }
    
    // SAFEGUARD: Only stop parachutes if all chances are missed
    if (misses < MAX_MISSES && gameRunning !== false) {
        while (letters.length < 4) {
            createLetter();
        }
    }
    
    // Update water splashes
    updateWaterSplashes();
}

function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw background
    if (backgroundImage.complete) {
        ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
    } else {
        // Fallback if image not loaded
        ctx.fillStyle = '#87CEEB'; // Sky blue
        ctx.fillRect(0, 0, canvas.width, canvas.height * 0.7);
        
        ctx.fillStyle = '#0077BE'; // Deep blue for water
        ctx.fillRect(0, canvas.height * 0.7, canvas.width, canvas.height * 0.3);
        
        // Draw some clouds
        ctx.fillStyle = 'white';
        drawCloud(100, 50, 70);
        drawCloud(300, 80, 60);
        drawCloud(500, 60, 80);
        drawCloud(700, 100, 50);
        
        // Draw a small raft in the water
        ctx.fillStyle = '#8B4513'; // Brown
        ctx.fillRect(canvas.width / 2 - 40, canvas.height * 0.7 - 10, 80, 20);
        
        // Draw character on raft
        ctx.fillStyle = '#FFA500'; // Orange
        ctx.fillRect(canvas.width / 2 - 10, canvas.height * 0.7 - 30, 20, 20); // Head
        ctx.fillRect(canvas.width / 2 - 5, canvas.height * 0.7 - 10, 10, 10); // Body
    }
    
    // Draw the slate
    if (slateImage.complete) {
        ctx.drawImage(slateImage, slate.x, slate.y, slate.width, slate.height);
    } else {
        ctx.fillStyle = '#8B4513'; // Brown for wooden slate
        ctx.fillRect(slate.x, slate.y, slate.width, slate.height);
    }
    
    // Draw collected characters on the slate
    if (collectedCharacters.length > 0) {
        const charWidth = 100;
        const charHeight = 70;
        const spacing = 25; // Space between characters
        
        // Calculate starting position to center the characters on the slate
        const totalWidth = collectedCharacters.length * spacing;
        const startX = slate.x + (slate.width / 2) - (totalWidth / 2) + (spacing / 2);
        
        collectedCharacters.forEach((char, index) => {
            if (characterImage.complete) {
                // Draw the character image on the slate
                ctx.drawImage(characterImage, 
                    startX + (index * spacing) - charWidth / 2, 
                    slate.y - charHeight + slate.height, // Feet on the slate
                    charWidth, charHeight);
                
                // Draw the letter above the character
                ctx.fillStyle = 'black';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(char.letter, startX + (index * spacing), slate.y - charHeight - 10);
            } else {
                // Fallback if image not loaded
                ctx.fillStyle = '#FFA500'; // Orange
                ctx.fillRect(startX + (index * spacing) - 10, slate.y - 25, 20, 20); // Head
                ctx.fillRect(startX + (index * spacing) - 5, slate.y - 5, 10, 10); // Body
                
                // Draw the letter above the character
                ctx.fillStyle = 'black';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(char.letter, startX + (index * spacing), slate.y - 45);
            }
        });
    }
    
    // Draw letters with parachutes
    letters.forEach(letter => {
        if (!letter.collected) {
            if (parachuteImage.complete) {
                // Use the parachute SVG image
                ctx.save();
                // Apply color tint based on whether it's the target letter
                if (letter.isTarget) {
                    ctx.filter = 'hue-rotate(0deg)'; // Keep pink color for target
                } else {
                    ctx.filter = 'hue-rotate(60deg)'; // Yellow tint for non-target
                }
                ctx.drawImage(parachuteImage, letter.x, letter.y, letter.width, letter.height);
                    ctx.restore();
                
                // Draw letter text on top of the parachute
                ctx.fillStyle = 'black';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(letter.letter, letter.x + letter.width / 2, letter.y + 40);
            } else {
                // Fallback if image not loaded
                // Draw parachute
                ctx.fillStyle = letter.isTarget ? '#FF69B4' : '#FFFF00'; // Pink for target, yellow for others
                ctx.beginPath();
                ctx.arc(letter.x + letter.width / 2, letter.y + 10, 30, 0, Math.PI, true);
                ctx.fill();
                
                // Draw strings
                ctx.strokeStyle = 'black';
                ctx.beginPath();
                ctx.moveTo(letter.x + letter.width / 2 - 20, letter.y + 10);
                ctx.lineTo(letter.x + letter.width / 2 - 5, letter.y + 40);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(letter.x + letter.width / 2 + 20, letter.y + 10);
                ctx.lineTo(letter.x + letter.width / 2 + 5, letter.y + 40);
                ctx.stroke();
                
                // Draw letter circle
                ctx.fillStyle = letter.isTarget ? '#FF69B4' : '#FFFF00';
                ctx.beginPath();
                ctx.arc(letter.x + letter.width / 2, letter.y + 40, 20, 0, Math.PI * 2);
                ctx.fill();
                
                // Draw letter text
                ctx.fillStyle = 'black';
                ctx.font = 'bold 20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(letter.letter, letter.x + letter.width / 2, letter.y + 40);
            }
        }
    });
    
    // Target letter indicator removed as requested
    
    // Draw instructions if game is not running
    if (!gameRunning) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Center the play button on the canvas
        playButton.style.display = 'block';
        playButton.style.position = 'absolute';
        playButton.style.left = '50%';
        playButton.style.top = '50%';
        playButton.style.transform = 'translate(-50%, -50%)';
        playButton.style.zIndex = '100';
        playButton.style.padding = '20px 40px';
        playButton.style.fontSize = '24px';
        playButton.style.backgroundColor = '#4CAF50';
        playButton.style.color = 'white';
        playButton.style.border = 'none';
        playButton.style.borderRadius = '10px';
        playButton.style.cursor = 'pointer';
        playButton.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        playButton.textContent = 'Play';
    } else {
        // Hide the play button during game play
        playButton.style.display = 'none';
    }
    
    // Draw water splashes
    drawWaterSplashes();
    
    // Draw the turtle image and score outside the canvas (on the page)
    drawTurtleOnBorder();
}

function drawTurtleOnBorder() {
    if (turtleImage.complete) {
        // Get the canvas container position
        const canvasRect = canvas.getBoundingClientRect();
        const gameArea = canvas.parentElement;
        
        // Create or get existing turtle element
        let turtleElement = document.getElementById('turtleScoreDisplay');
        if (!turtleElement) {
            turtleElement = document.createElement('div');
            turtleElement.id = 'turtleScoreDisplay';
            turtleElement.style.position = 'absolute';
            turtleElement.style.width = '150px';
            turtleElement.style.height = '150px';
            turtleElement.style.backgroundImage = `url(${turtleImage.src})`;
            turtleElement.style.backgroundSize = 'contain';
            turtleElement.style.backgroundRepeat = 'no-repeat';
            turtleElement.style.backgroundPosition = 'center';
            turtleElement.style.display = 'flex';
            turtleElement.style.alignItems = 'center';
            turtleElement.style.justifyContent = 'center';
            turtleElement.style.fontSize = '24px';
            turtleElement.style.fontWeight = 'bold';
            turtleElement.style.color = 'white';
            turtleElement.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            gameArea.appendChild(turtleElement);
        }
        
        // Position turtle on the bottom right of the brown border area
        turtleElement.style.right = '20px';
        turtleElement.style.bottom = '-10px'; // Move up so legs are visible
        turtleElement.style.overflow = 'visible'; // Allow overflow
        turtleElement.style.pointerEvents = 'none'; // Prevent interaction issues
        turtleElement.style.textAlign = 'center';
        turtleElement.style.paddingTop = '80px'; // Move score text lower on the board
        turtleElement.style.paddingLeft = '40px'; // Move score text right to align with board
        turtleElement.textContent = ''; // Clear any existing text
        
        // Remove previous score span if it exists
        let scoreSpan = turtleElement.querySelector('.turtle-score');
        if (!scoreSpan) {
            scoreSpan = document.createElement('span');
            scoreSpan.className = 'turtle-score';
            scoreSpan.style.position = 'absolute';
            scoreSpan.style.left = '35px'; // Move further right
            scoreSpan.style.top = '38px';  // Move further up
            scoreSpan.style.fontSize = '30px';
            scoreSpan.style.fontWeight = 'bold';
            scoreSpan.style.color = 'white';
            scoreSpan.style.textShadow = '2px 2px 4px rgba(0,0,0,0.8)';
            turtleElement.appendChild(scoreSpan);
        }
        scoreSpan.textContent = score;
        turtleElement.style.textAlign = '';
        turtleElement.style.paddingTop = '';
        turtleElement.style.paddingLeft = '';
        turtleElement.appendChild(scoreSpan);
    }
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size / 2, 0, Math.PI * 2);
    ctx.arc(x + size / 2, y - size / 4, size / 3, 0, Math.PI * 2);
    ctx.arc(x + size, y, size / 2, 0, Math.PI * 2);
    ctx.fill();
}

function createWaterSplash(x, y) {
    // Create multiple splash particles for more realistic effect
    for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15; // Distribute particles in a circle
        const speed = Math.random() * 8 + 4; // Random speed
        
        waterSplashes.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed, // Circular distribution
            vy: Math.sin(angle) * speed - 3, // Slight upward bias
            life: 1.0,
            size: Math.random() * 6 + 3, // Larger particles
            gravity: 0.4 + Math.random() * 0.2, // Variable gravity
            bounce: 0.3 + Math.random() * 0.2, // Bounce effect
            hasBounced: false
        });
    }
    
    // Add some smaller secondary droplets
    for (let i = 0; i < 8; i++) {
        waterSplashes.push({
            x: x + (Math.random() - 0.5) * 20,
            y: y,
            vx: (Math.random() - 0.5) * 12,
            vy: -Math.random() * 8 - 4,
            life: 0.8,
            size: Math.random() * 3 + 1,
            gravity: 0.5,
            bounce: 0.4,
            hasBounced: false
        });
    }
}

function updateWaterSplashes() {
    for (let i = waterSplashes.length - 1; i >= 0; i--) {
        const splash = waterSplashes[i];
        
        // Update position
        splash.x += splash.vx;
        splash.y += splash.vy;
        splash.vy += splash.gravity; // Variable gravity
        
        // Bounce effect when hitting water surface
        if (splash.y >= canvas.height * 0.7 && !splash.hasBounced && splash.vy > 0) {
            splash.vy *= -splash.bounce; // Bounce with energy loss
            splash.vx *= 0.8; // Reduce horizontal velocity
            splash.hasBounced = true;
        }
        
        // Air resistance
        splash.vx *= 0.99;
        
        // Fade out over time
        splash.life -= 0.015;
        
        // Remove old splashes
        if (splash.life <= 0 || splash.y > canvas.height + 50) {
            waterSplashes.splice(i, 1);
        }
    }
}

function drawWaterSplashes() {
    waterSplashes.forEach(splash => {
        ctx.save();
        ctx.globalAlpha = splash.life;
        
        // Create more realistic water droplet shape
        const gradient = ctx.createRadialGradient(
            splash.x - splash.size/3, splash.y - splash.size/3, 0,
            splash.x, splash.y, splash.size
        );
        gradient.addColorStop(0, '#E6F7FF'); // Light blue center
        gradient.addColorStop(0.7, '#87CEEB'); // Medium blue
        gradient.addColorStop(1, '#4682B4'); // Darker blue edge
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        
        // Draw teardrop shape for more realistic water droplets
        if (splash.vy > 0) { // Falling droplets are teardrop shaped
            ctx.ellipse(splash.x, splash.y, splash.size, splash.size * 1.5, 0, 0, Math.PI * 2);
        } else { // Rising droplets are more circular
            ctx.arc(splash.x, splash.y, splash.size, 0, Math.PI * 2);
        }
        
        ctx.fill();
        
        // Add highlight for more realistic look
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(splash.x - splash.size/3, splash.y - splash.size/3, splash.size/3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    });
}

function playDropSound() {
    try {
        // Try to play drop sound
        const dropSound = new Audio('sounds/drop.mp3');
        dropSound.play().catch(e => {
            console.log('Drop sound not found');
        });
    } catch (e) {
        console.log('Drop sound not available');
    }
}

function gameLoop() {
    if (gameRunning) {
        updateGame();
        drawGame();
        requestAnimationFrame(gameLoop);
    }
}

// Draw the initial game state
drawGame();

// Helper to show/hide game over box
function showGameOverBox() {
    const box = document.getElementById('gameOverBox');
    if (box) box.style.display = 'flex';
}
function hideGameOverBox() {
    const box = document.getElementById('gameOverBox');
    if (box) box.style.display = 'none';
}

// At the end of window.onload or DOMContentLoaded
window.addEventListener('DOMContentLoaded', () => {
    const okBtn = document.getElementById('gameOverOkButton');
    if (okBtn) {
        okBtn.addEventListener('click', () => {
            hideGameOverBox();
            startGame();
        });
    }
});