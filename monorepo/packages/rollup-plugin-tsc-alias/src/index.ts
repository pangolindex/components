const util = require('util');
const exec = util.promisify(require('child_process').exec);

// Pluing to run `tsc-alias` command after rollup write the bundle
// this allows rollup to update absolute import to relative import in declaration (d.ts) file
export default function tscAlias() {
  return {
    name: 'rollup-plugin-tsc-alias',
    async writeBundle() {
      // Executes the tsc-alias command after writing the bundle
      const { stderr } = await exec('tsc-alias');
      if (stderr) {
        console.error(`tsc-alias STDERR: ${stderr}`);
        return;
      }
    },
  };
}
