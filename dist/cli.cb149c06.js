parcelRequire=function(e,r,n,t){var i="function"==typeof parcelRequire&&parcelRequire,o="function"==typeof require&&require;function u(n,t){if(!r[n]){if(!e[n]){var f="function"==typeof parcelRequire&&parcelRequire;if(!t&&f)return f(n,!0);if(i)return i(n,!0);if(o&&"string"==typeof n)return o(n);var c=new Error("Cannot find module '"+n+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[n][1][r]||r},p.cache={};var l=r[n]=new u.Module(n);e[n][0].call(l.exports,p,l,l.exports,this)}return r[n].exports;function p(e){return u(p.resolve(e))}}u.isParcelRequire=!0,u.Module=function(e){this.id=e,this.bundle=u,this.exports={}},u.modules=e,u.cache=r,u.parent=i,u.register=function(r,n){e[r]=[function(e,r){r.exports=n},{}]};for(var f=0;f<n.length;f++)u(n[f]);if(n.length){var c=u(n[n.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=c:"function"==typeof define&&define.amd?define(function(){return c}):t&&(this[t]=c)}return u}({"lWaG":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.options=exports.command=exports.args=exports.action=void 0;var e=t(require("commander")),o=t(require("chalk"));function t(e){return e&&e.__esModule?e:{default:e}}const r=`\nRun \`${o.default.bold("epk help <command>")}\` for more information on specific commands\n`,a=e=>e.split(",");let s,n;exports.args=n,exports.action=s,e.default.command("serve [input...]").description("starts a development server").option("-d, --out-dir path","Output directory").option("-t, --target [target]","Set parcel target to [node, browser, electron]",void 0,"browser").option("-b, --browsers [target]","Set parcel target to [chrome, firefox]",a,["chrome"]).action(e=>{exports.action=s="serve",exports.args=n=e}),e.default.command("help [command]").description("display help information for a command").action(o=>(e.default.commands.find(e=>e.name()===o)||e.default).help()),e.default.on("--help",e=>console.log(r));const p=process.argv;"--help"!==p[2]&&"-h"!==p[2]||(p[2]="help"),p[2]&&e.default.commands.some(e=>e.name()===p[2])||p.splice(2,0,"serve");const c=e.default.parse(p);exports.command=c;const d=e.default.opts();exports.options=d;
},{}],"B8AH":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=require("rxjs/operators"),t=require("../types"),r=a(require("chalk")),s=a(require("./logger")),n=require("../utils");function a(e){return e&&e.__esModule?e:{default:e}}const i=({description:e,error:{message:t}})=>`  ${e}\n   ${r.default.gray(t.split("\n").shift().trim())}\n\n${r.default.red(t.split("\n").splice(2).map(e=>`  ${e}`).join("\n"))}`,p=({name:e,tests:t=[]})=>t.length?` ${r.default.underline((0,n.prettifyPath)(e))}\n\n${t.map(i).join("\n")}`:"",l=e=>{const r=e.filter(({type:e})=>t.FileType.ANALYZE===e);return r.length?`Analyzing ${r.map(({name:e})=>(0,n.prettifyPath)(e)).join(", ")}\n\n`:""},u=e=>`${r.default.reset.red("Errors:")}\n${r.default.reset(e.map(({tests:e,...t})=>({tests:e.filter(({error:e})=>!!e),...t})).map(p).join("\n"))}`,d=e=>`\n${r.default.reset("Files:")}\n${e.map(({name:e,tests:t})=>{const s=t.every(({type:e})=>!!e),a=t.filter(({type:e})=>e),i=t.filter(({error:e})=>e),p=i.length,l=p?`(${a.length-i.length})`:"";return r.default.reset[s?p?"red":"green":"gray"](`${(0,n.prettifyPath)(e)} ${a.length}${l}/${t.length}`)}).map(e=>` ${e}`).join("\n")}`,o=e=>`\n${l(e)}${u(e)}${d(e)}`;var y=n=>(0,e.scan)((e,n)=>{if("buildStart"===n.name)return s.default.clear(),s.default.progress(`\n${r.default.grey("Bundling...")}`),{files:[]};if("bundled"===n.name)return s.default.progress(`\n${r.default.grey("Bundled")}`),e;const a=n,{files:i}=e,p=i.find(({name:e})=>n.name===e)||a;if(a.type===t.FileType.ANALYZE){const e=i.find(({name:e})=>n.name===e);e?Object.assign(e,a):i.push(a)}else if(a.type===t.FileType.TEST){p.tests||(p.tests=[]);const e=a.test,r=p.tests.find(({description:t})=>e.description===t);r?Object.assign(r,e):r||p.tests.push(e);const s=p.tests.every(e=>"value"in e);p.type=s?t.FileType.DONE:t.FileType.TEST}const l=i.length&&i.every(({type:e})=>t.FileType.DONE===e);return s.default[l?"success":"progress"](o(i)),e},{});exports.default=y;
},{"../types":"UL96","./logger":"QAaq","../utils":"s2T4"}],"Q0HP":[function(require,module,exports) {
"use strict";var e=o(require("../core/index")),r=require("./parser"),t=o(require("./reporter")),s=o(require("./logger"));function o(e){return e&&e.__esModule?e:{default:e}}(0,t.default)({})((0,e.default)({watch:"serve"===r.action,target:r.options.target,entryFiles:r.args,browsers:r.options.browsers})).subscribe(()=>{},e=>s.default.error(e));
},{"../core/index":"7QpE","./parser":"lWaG","./reporter":"B8AH","./logger":"QAaq"}]},{},[], null)
//# sourceMappingURL=cli.cb149c06.map