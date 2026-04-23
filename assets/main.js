// ─────────────────────────────────────────
//  main.js  — entry point
//
//  Import order determines scene build
//  order. Each module runs once and adds
//  its objects to the shared scene/groups.
// ─────────────────────────────────────────

// 1. Core — renderer, scene, camera
import "./renderer.js";

// 2. Shared utilities (rng etc.) — imported before any module that uses them
import "./utils.js";

// 2. Lights before anything casts shadows
import "./lights.js";

// 3. Environment
import "./background.js";
import "./floor.js";

// 4. Furniture (tableGroup created here)
import "./table.js";

// 5. Objects on / above the table
import "./cake.js";
import "./card.js";
import "./decorations.js";
import "./doors.js";

// 6. Start the render loop (also sets up input)
import { startAnimation } from "./animate.js";
startAnimation();
