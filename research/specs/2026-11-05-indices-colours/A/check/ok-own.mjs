// Checker's own oklch -> hex (OKLCH -> OKLab -> linear sRGB -> sRGB, clamped), independent of ../../tools/ok.mjs. node ok-own.mjs rose-200 red-200
import fs from 'fs';
const css = fs.readFileSync('/home/ori/dev/finance-tool/site/app/theme.css','utf8');
const pal = {};
for (const m of css.matchAll(/--palette-([a-z]+-\d+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/g)) pal[m[1]] = [+m[2],+m[3],+m[4]];
function toHex([L,C,h]){
  const a=C*Math.cos(h*Math.PI/180), b=C*Math.sin(h*Math.PI/180);
  const l_=L+0.3963377774*a+0.2158037573*b, m_=L-0.1055613458*a-0.0638541728*b, s_=L-0.0894841775*a-1.2914855480*b;
  const l=l_**3,m=m_**3,s=s_**3;
  let r=4.0767416621*l-3.3077115913*m+0.2309699292*s, g=-1.2684380046*l+2.6097574011*m-0.3413193965*s, bb=-0.0041960863*l-0.7034186147*m+1.7076147010*s;
  const f=x=>{x=Math.min(1,Math.max(0,x)); x= x<=0.0031308?12.92*x:1.055*x**(1/2.4)-0.055; return Math.round(x*255).toString(16).padStart(2,'0');};
  return '#'+f(r)+f(g)+f(bb);
}
const out={}; for (const k in pal) out[k]=toHex(pal[k]);
if (process.argv[2]) console.log(process.argv.slice(2).map(k=>k+'='+out[k]).join('\n')); else console.log(JSON.stringify(out));
