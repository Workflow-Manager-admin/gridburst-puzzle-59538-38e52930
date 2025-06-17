import React, { useState, useRef, useEffect } from "react";
import "./GridBurstMain.css";

/**
 * GridBurst Puzzle Main Container (React)
 * Features:
 * - Responsive grid-based puzzle inspired by Block Blast
 * - Drag-and-drop game pieces
 * - Animated row/column clears
 * - Dynamic grid and score updates
 * - Restart and instructions buttons
 * - Themed with palette: #4CAF50, #FFC107, #2196F3
 * - Layout: Game board on top, pieces underneath
 */

// Configuration/constants
const GRID_SIZE = 9;
const INITIAL_SCORE = 0;
const COLORS = {
  primary: "#4CAF50",
  secondary: "#FFC107",
  accent: "#2196F3",
};

// Predefined piece shapes (like Block Blast / Tetris but simple)
const PIECES = [
  [[1]],
  [
    [1],
    [1],
  ],
  [
    [1, 1],
  ],
  [
    [1, 1, 1],
  ],
  [
    [1],
    [1],
    [1],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [1, 1, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [1, 0, 0],
  ],
  [
    [1, 0],
    [1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
  ],
];

// Helper to get random piece
function getRandomPiece() {
  const index = Math.floor(Math.random() * PIECES.length);
  return PIECES[index];
}

// Deep copy grid
function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

/**
 * Check if a piece can be placed on the grid at (row, col).
 */
function isValidPlacement(grid, piece, targetRow, targetCol) {
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[r].length; c++) {
      if (
        piece[r][c] === 1 &&
        (targetRow + r >= grid.length ||
          targetCol + c >= grid[0].length ||
          grid[targetRow + r][targetCol + c] !== 0)
      ) {
        return false;
      }
    }
  }
  return true;
}

/**
 * Place a piece onto the grid at (row, col).
 * Returns a new grid with the piece applied.
 */
function placePiece(grid, piece, row, col) {
  const newGrid = cloneGrid(grid);
  for (let r = 0; r < piece.length; r++) {
    for (let c = 0; c < piece[r].length; c++) {
      if (piece[r][c] === 1) {
        newGrid[row + r][col + c] = 1;
      }
    }
  }
  return newGrid;
}

/**
 * Find which full rows/columns to clear.
 */
function getClearedLines(grid) {
  const rows = [];
  const cols = [];
  // Find full rows
  for (let r = 0; r < GRID_SIZE; r++) {
    if (grid[r].every((v) => v === 1)) rows.push(r);
  }
  // Find full cols
  for (let c = 0; c < GRID_SIZE; c++) {
    let full = true;
    for (let r = 0; r < GRID_SIZE; r++) {
      if (grid[r][c] !== 1) {
        full = false;
        break;
      }
    }
    if (full) cols.push(c);
  }
  return { rows, cols };
}

/**
 * Remove full rows/columns with animation class state (do not mutate original grid)
 */
function clearLines(grid, toClear) {
  let clearedGrid = cloneGrid(grid);

  // Clear rows
  for (const row of toClear.rows) {
    for (let c = 0; c < GRID_SIZE; c++) {
      clearedGrid[row][c] = 0;
    }
  }
  // Clear cols
  for (const col of toClear.cols) {
    for (let r = 0; r < GRID_SIZE; r++) {
      clearedGrid[r][col] = 0;
    }
  }
  return clearedGrid;
}

/**
 * Returns true if at least one piece in pieceOptions can be placed on grid.
 */
function canPlaceAnyPiece(grid, pieceOptions) {
  for (const shape of pieceOptions) {
    for (let r = 0; r <= GRID_SIZE - shape.length; r++) {
      for (let c = 0; c <= GRID_SIZE - shape[0].length; c++) {
        if (isValidPlacement(grid, shape, r, c)) return true;
      }
    }
  }
  return false;
}

// PUBLIC_INTERFACE
function GridBurstMain() {
  // Game state
  const [grid, setGrid] = useState(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
  const [pieces, setPieces] = useState([getRandomPiece(), getRandomPiece(), getRandomPiece()]);
  const [score, setScore] = useState(INITIAL_SCORE);
  const [draggingIdx, setDraggingIdx] = useState(null);
  const [draggedOver, setDraggedOver] = useState({ row: null, col: null });
  const [clearAnim, setClearAnim] = useState({ rows: [], cols: [] });
  const [showInstructions, setShowInstructions] = useState(false);
  const [gameOver, setGameOver] = useState(false);

  const animationTimeout = useRef(null);

  /**
   * Handler to restart game
   */
  // PUBLIC_INTERFACE
  function handleRestart() {
    setGrid(Array(GRID_SIZE).fill().map(() => Array(GRID_SIZE).fill(0)));
    setScore(INITIAL_SCORE);
    setPieces([getRandomPiece(), getRandomPiece(), getRandomPiece()]);
    setGameOver(false);
    setClearAnim({ rows: [], cols: [] });
    setDraggedOver({ row: null, col: null });
  }

  /**
   * Drag-and-drop handlers
   */
  // PUBLIC_INTERFACE
  function handleDragStart(idx) {
    setDraggingIdx(idx);
  }

  // PUBLIC_INTERFACE
  function handleDragEnd() {
    setDraggingIdx(null);
    setDraggedOver({ row: null, col: null });
  }

  // PUBLIC_INTERFACE
  function handleDragOver(row, col, piece) {
    // Only allow dragging over drop zone if valid
    if (
      draggingIdx !== null &&
      isValidPlacement(grid, pieces[draggingIdx], row, col)
    ) {
      setDraggedOver({ row, col });
    } else {
      setDraggedOver({ row: null, col: null });
    }
  }

  // PUBLIC_INTERFACE
  function handleDrop(row, col) {
    if (draggingIdx === null) return;

    const piece = pieces[draggingIdx];
    if (isValidPlacement(grid, piece, row, col)) {
      let updatedGrid = placePiece(grid, piece, row, col);
      let cleared = getClearedLines(updatedGrid);

      // Start clear animation if lines cleared
      if (cleared.rows.length > 0 || cleared.cols.length > 0) {
        setClearAnim({ rows: cleared.rows, cols: cleared.cols });
        if (animationTimeout.current) clearTimeout(animationTimeout.current);
        animationTimeout.current = setTimeout(() => {
          setClearAnim({ rows: [], cols: [] });
          setGrid(clearLines(updatedGrid, cleared));
        }, 500); // Animation duration
      } else {
        setGrid(updatedGrid);
      }

      // Update score
      let add = piece.flat().filter((v) => v).length + (cleared.rows.length + cleared.cols.length) * GRID_SIZE;
      setScore((s) => s + add);

      // Remove used piece, refresh if all placed
      let newPieces = pieces.slice();
      newPieces[draggingIdx] = null;
      if (newPieces.every((p) => !p)) {
        newPieces = [getRandomPiece(), getRandomPiece(), getRandomPiece()];
      }
      setPieces(newPieces);
    }
    setDraggingIdx(null);
    setDraggedOver({ row: null, col: null });
  }

  // Clean up animation timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeout.current) clearTimeout(animationTimeout.current);
    }
  }, []);

  // Game over logic: check if any placements possible after rendering
  useEffect(() => {
    const availablePieces = pieces.filter(Boolean);
    if (
      availablePieces.length > 0 &&
      !canPlaceAnyPiece(grid, availablePieces)
    ) {
      setGameOver(true);
    }
  }, [grid, pieces]);

  // PUBLIC_INTERFACE
  function renderGridCell(rowIdx, colIdx) {
    // Show highlight for drop target
    let highlight =
      draggedOver.row === rowIdx && draggedOver.col === colIdx && draggingIdx !== null &&
      isValidPlacement(grid, pieces[draggingIdx], rowIdx, colIdx);

    let animRow = clearAnim.rows.includes(rowIdx);
    let animCol = clearAnim.cols.includes(colIdx);

    return (
      <div
        key={`cell-${rowIdx}-${colIdx}`}
        className={
          "gb-cell" +
          (grid[rowIdx][colIdx] === 1 ? " filled" : "") +
          (highlight ? " highlight" : "") +
          (animRow || animCol ? " clear-anim" : "")
        }
        style={{
          borderColor: COLORS.accent,
          background:
            grid[rowIdx][colIdx] === 1
              ? COLORS.primary
              : "rgba(255,255,255,0.08)",
          transition: animRow || animCol ? "background 0.4s" : undefined,
        }}
        onDragOver={
          draggingIdx !== null &&
          rowIdx <= GRID_SIZE - pieces[draggingIdx].length &&
          colIdx <= GRID_SIZE - pieces[draggingIdx][0].length
            ? (e) => {
                e.preventDefault();
                handleDragOver(rowIdx, colIdx, pieces[draggingIdx]);
              }
            : undefined
        }
        onDrop={
          draggingIdx !== null &&
          rowIdx <= GRID_SIZE - pieces[draggingIdx].length &&
          colIdx <= GRID_SIZE - pieces[draggingIdx][0].length
            ? (e) => {
                e.preventDefault();
                handleDrop(rowIdx, colIdx);
              }
            : undefined
        }
      />
    );
  }

  // PUBLIC_INTERFACE
  function renderGamePieces() {
    return (
      <div className="gb-pieces">
        {pieces.map((piece, idx) =>
          piece ? (
            <div
              key={`piece-${idx}`}
              className={
                "gb-piece-draggable" +
                (draggingIdx === idx ? " dragging" : "") +
                (!canPlaceAnyPiece(grid, [piece]) ? " unplayable" : "")
              }
              draggable={
                !gameOver &&
                canPlaceAnyPiece(grid, [piece])
              }
              onDragStart={() => handleDragStart(idx)}
              onDragEnd={handleDragEnd}
              tabIndex={0}
              aria-label={`Piece ${idx + 1}`}
              style={{
                opacity:
                  draggingIdx === idx ||
                  !canPlaceAnyPiece(grid, [piece])
                    ? 0.6
                    : 1,
                outline:
                  draggingIdx === idx
                    ? `2px solid ${COLORS.accent}`
                    : "none",
              }}
            >
              {piece.map((row, rIdx) => (
                <div className="gb-piece-row" key={`piece-row-${idx}-${rIdx}`}>
                  {row.map((cell, cIdx) => (
                    <span
                      key={`piece-cell-${idx}-${rIdx}-${cIdx}`}
                      className={cell === 1 ? "gb-piece-cell filled" : "gb-piece-cell"}
                      style={{
                        background:
                          cell === 1
                            ? COLORS.secondary
                            : "transparent",
                        borderColor: cell === 1 ? COLORS.accent : "transparent",
                      }}
                    ></span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div
              className="gb-piece-placeholder"
              style={{ width: "60px", height: "60px", margin: "0 10px" }}
              key={`piece-null-${idx}`}
            ></div>
          )
        )}
      </div>
    );
  }

  return (
    <div className="gb-container">
      {/* Header */}
      <div className="gb-header">
        <h2>
          <span role="img" aria-label="GridBurst" style={{ color: COLORS.accent }}>▦</span>
          GridBurst Puzzle
        </h2>
        <div className="gb-score" style={{ background: COLORS.primary }}>
          Score: <span>{score}</span>
        </div>
      </div>

      {/* Game Board */}
      <div className="gb-board-outer">
        <div
          className={
            "gb-board" + (gameOver ? " gb-board-gameover" : "")
          }
        >
          {grid.map((row, rowIdx) => (
            <div className="gb-row" key={`row-${rowIdx}`}>
              {row.map((_, colIdx) => renderGridCell(rowIdx, colIdx))}
            </div>
          ))}
          {gameOver && (
            <div className="gb-gameover-message">
              <h3>Game Over</h3>
              <div style={{ marginBottom: 10 }}>Final Score: {score}</div>
              <button className="gb-btn" onClick={handleRestart}>
                Restart
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Pieces */}
      <div className="gb-piece-bar">{renderGamePieces()}</div>

      {/* Controls */}
      <div className="gb-controls">
        <button className="gb-btn" onClick={handleRestart}>
          Restart
        </button>
        <button className="gb-btn accent" onClick={() => setShowInstructions((v) => !v)}>
          {showInstructions ? "Hide Instructions" : "Instructions"}
        </button>
      </div>

      {/* Instructions popup */}
      {showInstructions && (
        <div className="gb-instructions-modal">
          <div className="gb-instructions-content">
            <h3>How to Play</h3>
            <ol>
              <li>Drag a piece from below and drop it onto the board so it fits without overlapping.</li>
              <li>Fill an entire row or column to clear it for points (with a burst animation!)</li>
              <li>Strategize to place as many pieces as possible. The game ends when no piece fits.</li>
              <li>
                <b>Controls:</b>{" "}
                <span style={{ color: COLORS.accent }}>Drag &amp; Drop, or use Space/Enter for board placement if supported.</span>
              </li>
            </ol>
            <button className="gb-btn" onClick={() => setShowInstructions(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Responsive credit / footer */}
      <div className="gb-footer">
        &copy; 2024 GridBurst | Theme:{" "}
        <span style={{ color: COLORS.primary }}>#4CAF50</span>,{" "}
        <span style={{ color: COLORS.secondary }}>#FFC107</span>,{" "}
        <span style={{ color: COLORS.accent }}>#2196F3</span>
      </div>
    </div>
  );
}

export default GridBurstMain;
