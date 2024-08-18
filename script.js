let currentLevel = 1;
let timer;
let seconds = 0;
let hintTimer; // Timer for hints

// Base Sudoku puzzle (for validation purposes)
const basePuzzle = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9]
];

const solvedPuzzle = [
    [5, 3, 4, 6, 7, 8, 9, 1, 2],
    [6, 7, 2, 1, 9, 5, 3, 4, 8],
    [1, 9, 8, 3, 4, 2, 5, 6, 7],
    [8, 5, 9, 7, 6, 1, 4, 2, 3],
    [4, 2, 6, 8, 5, 3, 7, 9, 1],
    [7, 1, 3, 9, 2, 4, 8, 5, 6],
    [9, 6, 1, 5, 3, 7, 2, 8, 4],
    [2, 8, 7, 4, 1, 9, 6, 3, 5],
    [3, 4, 5, 2, 8, 6, 1, 7, 9]
];

const maxLevel = 10000;

// Function to start the game
function startGame() {
    const userName = document.getElementById('user-name').value;
    if (!userName) {
        alert('Please enter your name before starting the game!');
        return;
    }
    document.getElementById('user-info').style.display = 'none';
    document.getElementById('user-name-display').innerText = `Welcome, ${userName}`;
    document.getElementById('user-display').style.display = 'block';
    document.getElementById('timer-display').style.display = 'block';
    document.getElementById('sudoku-container').style.display = 'block';
    generateSudokuGrid(currentLevel);
    updateLevelDisplay();
    startTimer();
    startHintTimer(); // Start hint timer when game starts
}

// Function to start the timer
function startTimer() {
    timer = setInterval(function() {
        seconds++;
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        document.getElementById('timer').innerText = 
            `${minutes < 10 ? '0' : ''}${minutes}:${displaySeconds < 10 ? '0' : ''}${displaySeconds}`;
    }, 1000);
}

// Function to stop the timer
function stopTimer() {
    clearInterval(timer);
}

// Function to generate a Sudoku grid
function generateSudokuGrid(level) {
    const sudokuGrid = document.getElementById('sudoku-grid');
    sudokuGrid.innerHTML = ''; // Clear previous grid

    // Generate a new puzzle for each level
    const puzzle = generatePuzzle(level);

    // Create grid cells
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            const cell = document.createElement('input');
            cell.type = 'text';
            cell.maxLength = '1';
            cell.classList.add('sudoku-cell');
            if (puzzle[i][j] !== 0) {
                cell.value = puzzle[i][j];
                cell.disabled = true;
            }
            sudokuGrid.appendChild(cell);
        }
    }

    addCellEventListeners(); // Add event listeners for cells
}

// Function to generate a Sudoku puzzle based on the level
function generatePuzzle(level) {
    const puzzle = JSON.parse(JSON.stringify(basePuzzle));

    // Adjust difficulty based on level
    const emptyCells = Math.min(level, 50); // Increase empty cells with levels

    // Randomly remove numbers from the puzzle based on level
    for (let i = 0; i < emptyCells; i++) {
        let row, col;
        do {
            row = Math.floor(Math.random() * 9);
            col = Math.floor(Math.random() * 9);
        } while (puzzle[row][col] === 0); // Ensure we're not removing an already empty cell
        puzzle[row][col] = 0;
    }

    return puzzle;
}

// Function to check the Sudoku puzzle
function checkSudoku() {
    const inputs = document.querySelectorAll('.sudoku-cell');
    let isCorrect = true;

    inputs.forEach((input, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        if (parseInt(input.value) !== solvedPuzzle[row][col] && solvedPuzzle[row][col] !== 0) {
            isCorrect = false;
            input.style.backgroundColor = '#ffcccc'; // Red background for wrong inputs
        } else {
            input.style.backgroundColor = '#ccffcc'; // Green background for correct inputs
        }
    });

    const status = document.getElementById('status');
    if (isCorrect) {
        status.innerText = 'Congratulations! You solved the puzzle!';
        stopTimer();
        if (currentLevel < maxLevel) {
            currentLevel++;
            generateSudokuGrid(currentLevel);
            updateLevelDisplay();
            resetTimer();
        } else {
            status.innerText = 'You have completed all levels! Great job!';
        }
    } else {
        status.innerText = 'Some values are incorrect. Please try again.';
    }
}

// Function to reset the timer
function resetTimer() {
    seconds = 0;
    document.getElementById('timer').innerText = '00:00';
    startTimer();
}

// Function to update the level display
function updateLevelDisplay() {
    document.getElementById('level-display').innerText = `Level: ${currentLevel}`;
}

// Function to change the theme
function changeTheme(theme) {
    document.getElementById('main-body').className = theme;
}

// Function to show the complete solution
function showSolution() {
    const inputs = document.querySelectorAll('.sudoku-cell');
    inputs.forEach((input, index) => {
        const row = Math.floor(index / 9);
        const col = index % 9;
        if (input.value === '') { // Only fill if the cell is empty
            input.value = solvedPuzzle[row][col];
        }
        input.disabled = true; // Disable cell once solution is revealed
    });
    stopTimer();
    document.getElementById('status').innerText = 'Solution displayed. Please complete the puzzle.';
}

// Function to give a hint if the user is stuck
function giveHint() {
    const inputs = document.querySelectorAll('.sudoku-cell');
    let emptyCells = [];
    
    inputs.forEach((input, index) => {
        if (input.value === '') {
            const row = Math.floor(index / 9);
            const col = index % 9;
            emptyCells.push({ row, col });
        }
    });

    if (emptyCells.length > 0) {
        const hintCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const { row, col } = hintCell;
        const hintValue = solvedPuzzle[row][col];
        const cell = document.querySelector(`.sudoku-cell:nth-child(${row * 9 + col + 1})`);
        cell.value = hintValue;
        cell.style.backgroundColor = '#ffff00'; // Highlight hint cell
        document.getElementById('status').innerText = `Hint: Try ${hintValue} in row ${row + 1}, column ${col + 1}.`;
    } else {
        document.getElementById('status').innerText = 'No hints available.';
    }
}

// Start hint timer when starting the game
function startHintTimer() {
    hintTimer = setTimeout(giveHint, 60000); // Provide hint if user takes more than 1 minute
}

// Reset hint timer
function resetHintTimer() {
    clearTimeout(hintTimer);
    startHintTimer(); // Restart hint timer when user interacts
}

// Add event listeners after generating Sudoku grid
function addCellEventListeners() {
    const inputs = document.querySelectorAll('.sudoku-cell');
    inputs.forEach(input => {
        input.addEventListener('input', resetHintTimer);
    });
}


