import { DEBUG_MODE } from "../config/config.js";

const log = (...output: unknown[]) => {
    if(DEBUG_MODE) {
        console.log(...output);
    }
}

export default log;
