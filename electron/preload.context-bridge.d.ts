import type { ElectronGlobal } from "./preload.cjs";

declare global {
  var electron: ElectronGlobal;
}