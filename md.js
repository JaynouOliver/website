// Tiny markdown + content parser for the portfolio. No dependencies.
export function esc(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
export function mdInline(s){
  s=esc(s);
  s=s.replace(/`([^`]+)`/g,'<code>$1</code>');
  s=s.replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>');
  s=s.replace(/(^|[^*])\*([^*]+)\*/g,'$1<em>$2</em>');
  s=s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,'<a href="$2" target="_blank" rel="noopener">$1</a>');
  return s;
}
export function mdToHtml(md){
  const lines=md.replace(/\r/g,'').split('\n');
  let html='',para=[],list=null,code=null;
  const flushP=()=>{if(para.length){html+='<p>'+mdInline(para.join(' '))+'</p>';para=[];}};
  const flushL=()=>{if(list){html+='<ul>'+list.map(x=>'<li>'+mdInline(x)+'</li>').join('')+'</ul>';list=null;}};
  for(const raw of lines){
    const l=raw;
    if(code!==null){ if(l.trim().startsWith('```')){html+='<pre><code>'+esc(code.join('\n'))+'</code></pre>';code=null;} else code.push(l); continue; }
    if(l.trim().startsWith('```')){flushP();flushL();code=[];continue;}
    const t=l.trim();
    if(!t){flushP();flushL();continue;}
    const img=t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);
    if(img){flushP();flushL();html+='<figure><img class="washed" src="'+img[2]+'" alt="'+esc(img[1])+'">'+(img[1]?'<figcaption>'+esc(img[1])+'</figcaption>':'')+'</figure>';continue;}
    const h=t.match(/^(#{1,4})\s+(.*)$/);
    if(h){flushP();flushL();const n=Math.min(h[1].length+1,5);html+='<h'+n+'>'+mdInline(h[2])+'</h'+n+'>';continue;}
    if(t.startsWith('> ')){flushP();flushL();html+='<blockquote>'+mdInline(t.slice(2))+'</blockquote>';continue;}
    if(t.startsWith('- ')){flushP();if(!list)list=[];list.push(t.slice(2));continue;}
    flushL();para.push(t);
  }
  flushP();flushL();
  if(code)html+='<pre><code>'+esc(code.join('\n'))+'</code></pre>';
  return html;
}
export function parseFrontMatter(md){
  const meta={};let body=md.replace(/\r/g,'');
  if(body.startsWith('---')){
    const end=body.indexOf('\n---',3);
    if(end>-1){
      body.slice(3,end).split('\n').forEach(l=>{const m=l.match(/^(\w+):\s*(.*)$/);if(m)meta[m[1].toLowerCase()]=m[2].trim();});
      body=body.slice(end+4);
    }
  }
  return {meta,body:body.trim()};
}
export function parseContent(text){
  const lines=text.replace(/<!--[\s\S]*?-->/g,'').replace(/\r/g,'').split('\n');
  const meta={};const sections={};let cur=null;
  for(const l of lines){
    if(/^##\s/.test(l)){cur=l.replace(/^##\s+/,'').trim().toLowerCase();sections[cur]=[];continue;}
    if(cur){sections[cur].push(l);continue;}
    const m=l.match(/^([A-Za-z_]+):\s*(.+)$/);
    if(m)meta[m[1].toLowerCase()]=m[2].trim();
  }
  const exp=[];let e=null;
  for(const l of sections.experience||[]){
    if(l.startsWith('### ')){const p=l.slice(4).split('|').map(s=>s.trim());e={company:p[0]||'',role:p[1]||'',period:p[2]||'',points:[]};exp.push(e);}
    else if(e&&l.trim().startsWith('- '))e.points.push(l.trim().slice(2));
  }
  const projects=[];let pr=null;
  for(const l of sections.projects||[]){
    if(l.startsWith('### ')){const p=l.slice(4).split('|').map(s=>s.trim());pr={title:p[0]||'',link:p[1]||'',tags:(p[2]||'').split(',').map(s=>s.trim()).filter(Boolean),desc:''};projects.push(pr);}
    else if(pr&&l.trim())pr.desc=(pr.desc?pr.desc+' ':'')+l.trim();
  }
  const research=(sections.research||[]).filter(l=>l.trim().startsWith('- ')).map(l=>{
    const p=l.trim().slice(2).split('|').map(s=>s.trim());
    return {title:p[0]||'',meta:p[1]||'',link:p[2]||''};
  });
  const posts=(sections.blog||[]).filter(l=>l.trim().startsWith('- ')).map(l=>l.trim().slice(2).trim());
  return {meta,experience:exp,projects,research,posts};
}
export function fmtDate(s){
  const d=new Date(s);
  if(isNaN(d))return s||'';
  return d.toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric'});
}
