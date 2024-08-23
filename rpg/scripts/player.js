import { playerImage } from "./image.js";

export const player = {
  x: 15, // Player stays in the center of the map
  y: 15,
  width: 32,
  height: 32,
  frame: 0,
  frameCount: 2,
  frameInterval: 300,
  lastFrameTime: 0,
};

// Function to draw the player at the center
export function drawPlayer(ctx, tileSize, offsetX, offsetY) {
  const now = Date.now();
  if (now - player.lastFrameTime > player.frameInterval) {
    player.frame = (player.frame + 1) % player.frameCount;
    player.lastFrameTime = now;
  }

  const playerTileX = player.frame;
  const playerTileY = 0;

  // The player remains in the center of the canvas
  const canvasX = (player.x - offsetX) * tileSize;
  const canvasY = (player.y - offsetY) * tileSize;

  ctx.drawImage(playerImage, playerTileX * tileSize, playerTileY * tileSize, tileSize, tileSize, canvasX, canvasY, tileSize, tileSize);
}
