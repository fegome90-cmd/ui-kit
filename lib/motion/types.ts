export type MotionOrigin = "pointer" | "keyboard" | "deck-forward" | "deck-back" | "direct" | "resize" | "print";
export type MotionPolicy = "system" | "reduce" | "none";
export type SceneState = { view: "overview"; targetId: null } | { view: "detail"; targetId: string };
export const OVERVIEW: SceneState = Object.freeze({ view: "overview", targetId: null });
export type TransitionResult =
  | { requestId: number; status: "completed" | "superseded" | "destroyed" }
  | { requestId: number; status: "failed"; reason: "missing-target" | "commit-error"; recoverTo: SceneState };
export interface CommitContext {
  readonly requestId: number;
  readonly contentKey: string;
  readonly signal: AbortSignal;
}
export interface SceneHost {
  root: HTMLElement;
  coordinateRoot: HTMLElement;
  /** Solo superficies decorativas: nunca párrafos o controles que se escalen con ellas. */
  getTargets(): Element[];
  resolveTarget(id: string): HTMLElement | null;
  applyState(state: SceneState, context: CommitContext): void | Promise<void>;
  getReturnFocus(id: string): HTMLElement | null;
  getDetailHeading(): HTMLElement | null;
  onError?(error: unknown): void;
}
export interface TransitionOptions {
  origin: MotionOrigin;
  animate?: boolean;
  contentKey?: string;
}
export type TransitionKind = "enter" | "open" | "switch" | "close" | "content";
export interface MotionFrame {
  from: SceneState;
  to: SceneState;
  kind: TransitionKind;
  durationMs: number;
  reduced: boolean;
}
export interface MotionDriver {
  capture(frame: MotionFrame): unknown;
  play(snapshot: unknown, frame: MotionFrame, done: () => void): void;
  settle(): void;
  destroy(): void;
}
export interface SceneOptions {
  motionPolicy?: MotionPolicy;
  initialState?: SceneState;
  contentKey?: string;
  /** Carga protegida: el controlador opera inmediatamente mientras se resuelve. */
  loadDriver?: (host: SceneHost) => Promise<MotionDriver>;
}
export interface SceneController {
  transitionTo(state: SceneState, options: TransitionOptions): Promise<TransitionResult>;
  /** Entrada explícita; repetir overview no repite la entrada. */
  enter(origin?: MotionOrigin): Promise<TransitionResult>;
  settle(): void;
  invalidateLayout(): void;
  destroy(): void;
}
