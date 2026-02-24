import * as THREE from "./build/three.module.js";

globalThis.__STEALTHIS_THREE__ = THREE;
globalThis.dispatchEvent(new Event("stealthis:three-ready"));
