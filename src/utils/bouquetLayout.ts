// src/utils/bouquetLayout.ts
// Bouquet layout algorithm for arranging flowers in a pyramid pattern

export type FlowerLayout = {
  x: number;
  y: number;
  rotation: number;
};

const FLOWER_WIDTH = 161;
const FLOWER_HEIGHT = 242;

// Row vertical offset: 1/3 flower height between rows
const ROW_VERTICAL_OFFSET = FLOWER_HEIGHT / 8; // ~80.67px

// Wrapper offset: 1/2 flower height below the fourth row
const WRAPPER_OFFSET = FLOWER_HEIGHT / 2; // 121px

// Base wrapper dimensions (full size at row 4)
const WRAPPER_BASE_WIDTH = 524;
const WRAPPER_BASE_HEIGHT = 365;

// Row configuration: count and rotations for each row
const ROWS = [
  { count: 1, rotations: [0] },                    // Row 1: 1 flower, 0° rotation
  { count: 2, rotations: [-30, 30] },             // Row 2: 2 flowers, -30° (left), +30° (right) - fixed rotation order
  { count: 3, rotations: [-30, 0, 30] },         // Row 3: 3 flowers, -30° (left), 0° (center), +30° (right) - fixed rotation order
  { count: 4, rotations: [-30, -15, 15, 30] },    // Row 4: 4 flowers, -30°, -15°, +15°, +30° from left to right - fixed rotation order
];

/**
 * Get flower position and rotation for a given index (0-9)
 * Returns null if index is out of range (max 10 flowers)
 * 
 * @param index - Flower index (0-9)
 * @returns FlowerLayout with x, y, and rotation, or null if invalid index
 */
export function getFlowerPosition(index: number): FlowerLayout | null {
  if (index < 0 || index >= 10) return null;

  let currentIndex = index;
  let y = 0;

  // Iterate through rows to find which row this flower belongs to
  for (let row = 0; row < ROWS.length; row++) {
    const { count, rotations } = ROWS[row];

    // Check if this flower is in the current row
    if (currentIndex < count) {
      // Calculate horizontal spacing between flowers
      // Reduced spacing for tighter horizontal layout
      const spacing = FLOWER_WIDTH * 0.7;
      
      // Calculate total width of the row
      const totalRowWidth = spacing * (count - 1);
      
      // Calculate x position: center the row, then offset by flower index
      const x = currentIndex * spacing - totalRowWidth / 2;

      return {
        x,
        y,
        rotation: rotations[currentIndex],
      };
    }

    // Move to next row
    currentIndex -= count;
    y += ROW_VERTICAL_OFFSET;
  }

  return null;
}

/**
 * Get wrapper size based on number of flowers (row progression)
 * Row 2: smaller wrapper (70% scale)
 * Row 3: medium wrapper (85% scale)
 * Row 4: full size wrapper (100% scale)
 * 
 * @param totalFlowers - Total number of flowers (0-10)
 * @returns Object with width and height
 */
export function getWrapperSize(totalFlowers: number): { width: number; height: number } {
  // Row 1: 1 flower (indices 0)
  // Row 2: 2 flowers (indices 1-2) = 3 total
  // Row 3: 3 flowers (indices 3-5) = 6 total
  // Row 4: 4 flowers (indices 6-9) = 10 total
  
  const row1Count = 1;
  const row2Count = 2;
  const row3Count = 3;
  
  const row1End = row1Count; // 1
  const row2End = row1Count + row2Count; // 3
  const row3End = row1Count + row2Count + row3Count; // 6
  
  let scale: number;
  
  if (totalFlowers === 0 || totalFlowers <= row1End) {
    // Row 1 or no flowers - small wrapper
    scale = 0.5;
  } else if (totalFlowers <= row2End) {
    // Row 2 - smaller wrapper
    scale = 0.7;
  } else if (totalFlowers <= row3End) {
    // Row 3 - medium wrapper
    scale = 0.9;
  } else {
    // Row 4 (7+ flowers) - full size wrapper (width should increase)
    scale = 1.3;
  }
  
  const width = WRAPPER_BASE_WIDTH * scale;
  const height = WRAPPER_BASE_HEIGHT * scale;
  
  return {
    width,
    height,
  };
}

/**
 * Get wrapper position (centered horizontally, adjusts based on number of flowers)
 * Row 2: smaller wrapper, positioned higher
 * Row 3: medium wrapper, positioned appropriately
 * Row 4: bigger wrapper, positioned lower
 * 
 * @param totalFlowers - Total number of flowers (0-10)
 * @returns Y position for wrapper
 */
export function getWrapperYPosition(totalFlowers: number): number {
  // Row 1: 1 flower (indices 0)
  // Row 2: 2 flowers (indices 1-2) = 3 total
  // Row 3: 3 flowers (indices 3-5) = 6 total
  // Row 4: 4 flowers (indices 6-9) = 10 total
  
  const row1Count = 1;
  const row2Count = 2;
  const row3Count = 3;
  
  const row1End = row1Count; // 1
  const row2End = row1Count + row2Count; // 3
  const row3End = row1Count + row2Count + row3Count; // 6
  
  // Calculate height based on which row we're in
  let totalRowsHeight;
  let wrapperOffset;
  
  if (totalFlowers === 0) {
    // No flowers - default position
    totalRowsHeight = ROW_VERTICAL_OFFSET * 2;
    wrapperOffset = WRAPPER_OFFSET * 0.7; // Smaller offset for smaller wrapper
  } else if (totalFlowers <= row1End) {
    // Row 1 only
    totalRowsHeight = ROW_VERTICAL_OFFSET;
    wrapperOffset = WRAPPER_OFFSET * 0.8;
  } else if (totalFlowers <= row2End) {
    // Row 2 - smaller wrapper, positioned higher (reduced offset)
    totalRowsHeight = ROW_VERTICAL_OFFSET * 2;
    wrapperOffset = WRAPPER_OFFSET * 0.7; // Smaller offset to position higher
  } else if (totalFlowers <= row3End) {
    // Row 3 - medium wrapper, positioned appropriately
    totalRowsHeight = ROW_VERTICAL_OFFSET * 3;
    wrapperOffset = WRAPPER_OFFSET * 0.75; // Medium offset
  } else {
    // Row 4 - bigger wrapper, positioned lower (full offset)
    // Calculate full height of all 4 rows
    totalRowsHeight = ROW_VERTICAL_OFFSET * ROWS.length;
    wrapperOffset = WRAPPER_OFFSET * 0.6; // Increased offset to position lower and give space for row 4
  }
  
  // Position wrapper at offset below the calculated row height
  return totalRowsHeight + wrapperOffset;
}

// Export constants for use in components
export { FLOWER_WIDTH, FLOWER_HEIGHT, WRAPPER_OFFSET, WRAPPER_BASE_WIDTH, WRAPPER_BASE_HEIGHT };
