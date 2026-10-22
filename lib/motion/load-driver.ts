import type { MotionDriver, SceneHost } from "./types";

/** Import dinámico separado del bootstrap para conservar el modo instantáneo si falla GSAP. */
export async function loadGsapDriver(host: SceneHost): Promise<MotionDriver> {
  const { createGsapDriver } = await import("./gsap-driver");
  return createGsapDriver(host);
}
