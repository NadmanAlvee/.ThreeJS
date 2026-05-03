import { Vehicle } from "yuka";

class CustomVehicle extends Vehicle {
  constructor(navMesh) {
    super();
    this.navMesh = navMesh;
  }

  update(delta) {
    super.update(delta);
    const currentRegion = this.navMesh.getRegionForPoint(this.position, 0.01);
    if (currentRegion !== null) {
      const distance = currentRegion.distanceToPoint(this.position);
      this.position.y -= distance * 0.2;
    }
    return this;
  }
}

export { CustomVehicle };
