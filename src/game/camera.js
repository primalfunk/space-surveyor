export class Camera {
  constructor(ship) {
    this.ship = ship;
    this.zoom = 1;
  }

  applyTransform(ctx, canvas) {
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(this.zoom, this.zoom);
    ctx.translate(-this.ship.x, -this.ship.y);
  }

  resetTransform(ctx) {
    ctx.restore();
  }
}

