import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import pkg from "./package.json";

export default {
  input: "src/index.tsx",
  output: [
    {
      file: pkg.main,
      format: "cjs",
      sourcemap: true,
    },
    {
      file: pkg.module,
      format: "esm",
      sourcemap: true,
    },
  ],
  plugins: [
    commonjs(),
    typescript({
      tsconfig: "./tsconfig.json",
    }),
  ],
};
