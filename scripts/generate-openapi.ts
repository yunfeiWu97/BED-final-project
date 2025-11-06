import fs from "fs";
import dotenv from "dotenv";
import { Options } from "swagger-jsdoc";
dotenv.config();

import { generateSwaggerSpec } from "../config/swaggerOptions";

// type is object; swagger-jsdoc returns a plain object
const swaggerSpecs: object = generateSwaggerSpec();

fs.writeFileSync("./openapi.json", JSON.stringify(swaggerSpecs, null, 2), {
  encoding: "utf-8",
});

console.log("OpenAPI specification generated successfully!");
