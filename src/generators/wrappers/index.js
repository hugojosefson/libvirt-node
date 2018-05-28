let fs = require('fs');
let gen_wrapper = require('./gen_wrappers');
let {libvirt_parser} = require('../../parser');

let src_path = 'src';
let generated_path = 'generated';
let override_path = `${src_path}/override`;

module.exports = new class {
  generate(js_file) {
    let class_name = 'vir' + js_file[0].toUpperCase() + js_file.slice(1);
    let generated_js = gen_wrapper.generate(libvirt_parser, js_file);
    let override_js = '';
    try {
    	override_js = fs.readFileSync(`${override_path}/${js_file}.js`);
    } catch(e) {}

    let cpp = `
let libvirt_native = require('bindings')('libvirt');
${js_file !== 'domain' ? "let virDomain = require('./domain');" : ''} // TODO: remove require virDomain hack

module.exports = class {

/* The following functions are generated */
${generated_js}

/* The following functions are overridden */
${override_js}

}
`;

    fs.writeFileSync(`${generated_path}/${js_file}.js`, cpp);
  }
};