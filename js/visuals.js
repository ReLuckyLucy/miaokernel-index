/* Original Canvas 2D renderer: a particle atom, a dithered sphere and ASCII rain.
   No textures, WebGL, fonts, external services or copied site assets required. */
(function () {
  'use strict';
  const {clamp, seededRandom} = window.MiaoheCore;
  const canvas = document.getElementById('universe');
  const overlay = document.getElementById('transition-rain');
  const ctx = canvas && canvas.getContext('2d', {alpha:false});
  const tx = overlay && overlay.getContext('2d');
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const state = {scene:0, target:0, paused:preference.matches, reduced:preference.matches, rain:false};
  if (!ctx || !tx) {
    window.MiaoheVisual = {setScene(){},setPaused(){},setRain(){},transition(){},getState:()=>({...state,available:false})};
    return;
  }
  const rand = seededRandom(2418);
  const PI = Math.PI, TAU = PI * 2;
  let width = innerWidth, height = innerHeight, unit=2;
  let frameId=0, last=0, clock=0, transitionStart=-10;
  let pointerX=0, pointerY=0, px=0, py=0;
  const chars = '01{}[]<>/\\:;*+.#TOKENHUBMIAOHE';
  const stars=Array.from({length:180},()=>({x:rand(),y:rand(),s:rand(),phase:rand()*TAU}));
  const streams=Array.from({length:140},()=>({seed:rand(),speed:.5+rand(),offset:rand()*1000,phase:rand()*TAU}));
  // One particle has a position in each scene: interpolating positions produces
  // a coherent transition rather than removing and rebuilding the visual.
  const count=6500;
  const particles=Array.from({length:count},(_,i)=>{
    const a=rand()*TAU, group=i%3, tilt=[-.55,.70,1.58][group];
    const spread=(rand()+rand()+rand()-1.5)*.052;
    let ax,ay,az;
    const isNucleus=i>count*.76;
    const u=rand()*2-1, phi=rand()*TAU, r=Math.sqrt(1-u*u);
    const sx=r*Math.cos(phi),sy=u,sz=r*Math.sin(phi);
    if(isNucleus){const rr=.19*Math.cbrt(rand());ax=sx*rr;ay=sy*rr;az=sz*rr;}
    else{
      const ex=(1+spread)*Math.cos(a),ey=(.34+spread)*Math.sin(a);
      ax=ex*Math.cos(tilt)-ey*Math.sin(tilt);
      ay=ex*Math.sin(tilt)+ey*Math.cos(tilt);
      az=Math.sin(a)*.33+(rand()-.5)*.035;
    }
    return {ax,ay,az,sx,sy,sz,a,group,isNucleus,brightness:.30+rand()*.70,size:rand(),
      grain:(Math.sin(sx*13+sy*9)+Math.cos(sz*16-sx*4)+Math.sin(sy*24+sz*8))*.12+.5};
  });
  // A cached, low-resolution sphere with ordered grayscale dithering.
  // It is generated from analytic noise, not a photograph or site texture.
  const sphere=document.createElement('canvas');sphere.width=200;sphere.height=200;
  const sphereContext=sphere.getContext('2d');
  if(sphereContext){
    const image=sphereContext.createImageData(200,200);
    const order=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5];
    for(let y=0;y<200;y++)for(let x=0;x<200;x++){
      const nx=(x-99.5)/98,ny=(y-99.5)/98,rr=nx*nx+ny*ny;
      if(rr>1)continue;
      const nz=Math.sqrt(1-rr);
      const light=Math.max(0,-nx*.66-ny*.35+nz*.41);
      const field=Math.sin(nx*21+Math.sin(ny*14)*2)+Math.cos(ny*28+nz*12)+Math.sin(nx*53-ny*31)*.45;
      const surface=.68+field*.085;
      const intensity=Math.max(0,light*surface+.018);
      const threshold=order[(y%4)*4+(x%4)]/16-.5;
      const level=clamp(Math.floor(intensity*7+threshold+.5)/7,0,1);
      const offset=(y*200+x)*4,gray=Math.floor(level*218+5);
      image.data[offset]=gray;image.data[offset+1]=gray;image.data[offset+2]=Math.max(5,gray-3);image.data[offset+3]=255;
    }
    sphereContext.putImageData(image,0,0);
  }
  function resize(){
    width=innerWidth;height=innerHeight;unit=width<761?2:2;
    canvas.width=Math.ceil(width/unit);canvas.height=Math.ceil(height/unit);
    overlay.width=Math.ceil(width/2);overlay.height=Math.ceil(height/2);
    ctx.imageSmoothingEnabled=false;tx.imageSmoothingEnabled=false;
    draw(0);
  }
  function geometry(index){
    const mobile=width<761;
    if(index===0)return {x:width*(mobile?.69:.73),y:height*(mobile?.71:.50),r:Math.min(width*(mobile?.49:.245),height*(mobile?.28:.40)),alpha:mobile?.69:1};
    if(index===1)return {x:width*(mobile?.85:.285),y:height*(mobile?.33:.48),r:Math.min(width*(mobile?.53:.225),height*.34),alpha:mobile?.15:1};
    if(index===2)return {x:width*.7,y:height*.59,r:width*.48,alpha:.12};
    return {x:width*.5,y:height*.45,r:Math.max(width*.49,height*.49),alpha:mobile?.24:.40};
  }
  function point(p,index,t){
    if(index===0){
      const rot=t*.07, cos=Math.cos(rot),sin=Math.sin(rot);
      return {x:p.ax*cos+p.az*sin,y:p.ay,z:-p.ax*sin+p.az*cos};
    }
    if(index===1){
      const rot=t*.035,cos=Math.cos(rot),sin=Math.sin(rot);
      return {x:p.sx*cos+p.sz*sin,y:p.sy,z:-p.sx*sin+p.sz*cos};
    }
    if(index===2){
      return {x:p.sx*1.5,y:p.sy*.16+Math.sin(p.sx*3+t*.23)*.1,z:p.sz*.3};
    }
    const theta=p.a+t*.025,rad=.72+(p.sz+1)*.11;
    return {x:Math.cos(theta)*rad,y:Math.sin(theta)*rad*.62,z:p.sz*.3};
  }
  function drawStars(t){
    for(const s of stars){
      const brightness=(.15+s.s*.48)*(.86+Math.sin(t*.7+s.phase)*.14);
      ctx.fillStyle=`rgba(207,208,196,${brightness})`;
      const x=Math.floor(s.x*canvas.width),y=Math.floor(s.y*canvas.height);
      ctx.fillRect(x,y,1,1);
      if(s.s>.973){ctx.globalAlpha=.4;ctx.fillRect(x-2,y,5,1);ctx.fillRect(x,y-2,1,5);ctx.globalAlpha=1;}
    }
  }
  function drawRain(t){
    const step=width<761?23:24, columns=Math.ceil(width/step);
    ctx.font=state.rain?'7px monospace':'5px monospace';ctx.textAlign='center';
    for(let c=0;c<columns;c++){
      const s=streams[c%streams.length];
      if(!state.rain && c%3!==0)continue;
      const x=c*step, y=(t*37*s.speed+s.offset)%(height+380)-280;
      // Keep the resting texture out of the title's highest contrast region.
      const leftZone=x<width*.5;
      const opacity=state.rain?.72:(leftZone?.035:.10);
      for(let n=0;n<19;n++){
        const iy=y-n*(state.rain?17:13);
        if(iy<80||iy>height)continue;
        const ch=chars[(Math.floor(s.seed*100+c+n*7+t*(state.paused?0:3)))%chars.length];
        ctx.fillStyle=`rgba(218,218,206,${opacity*(1-n/20)})`;
        ctx.fillText(ch,x/unit,iy/unit);
      }
    }
  }
  function drawCore(t){
    const from=Math.floor(state.scene),to=Math.min(3,from+1),blend=state.scene-from;
    const a=geometry(from),b=geometry(to);
    const cx=a.x+(b.x-a.x)*blend,cy=a.y+(b.y-a.y)*blend,radius=a.r+(b.r-a.r)*blend;
    const baseAlpha=(a.alpha+(b.alpha-a.alpha)*blend)*(state.rain?.32:1);
    const sphereWeight=Math.max(0,1-Math.abs(state.scene-1));
    if(sphereWeight>.01&&sphereContext){
      ctx.globalAlpha=sphereWeight*baseAlpha;
      ctx.drawImage(sphere,(cx-radius)/unit,(cy-radius)/unit,radius*2/unit,radius*2/unit);
      ctx.globalAlpha=1;
    }
    const countStep=width<761?2:1;
    for(let i=0;i<count;i+=countStep){
      const p=particles[i],v=point(p,from,t),v2=blend>.001?point(p,to,t):v;
      let x=v.x+(v2.x-v.x)*blend,y=v.y+(v2.y-v.y)*blend,z=v.z+(v2.z-v.z)*blend;
      x+=z*px*.15;y+=z*py*.10;
      const perspective=1+z*.17;
      const drawX=Math.floor((cx+x*radius*perspective)/unit),drawY=Math.floor((cy+y*radius*perspective)/unit);
      let shade=.24+p.brightness*.46+z*.25;
      if(from===0)shade=p.isNucleus?(.63+p.brightness*.35):(.20+p.brightness*.43+z*.43);
      if(from===1){
        // Back hemisphere hidden; front surface receives directional light.
        if(z<-.04)continue;
        const light=Math.max(0,-x*.62-y*.30+z*.43);
        shade=(p.grain*.48+.19)*light*.60;
      }
      if(from===3)shade*=.65+.35*Math.sin(p.a*7+t*.15);
      const alpha=clamp(shade*baseAlpha,0,1);
      if(alpha<.028)continue;
      const q=Math.max(1,Math.floor((p.size>.975?2:1)*(width<761?1:1)));
      const gray=Math.floor(155+85*p.brightness);
      ctx.fillStyle=`rgba(${gray},${gray},${gray-5},${alpha.toFixed(3)})`;
      ctx.fillRect(drawX,drawY,q,q);
    }
    if(from===0 && blend<.5 && width>760){
      const orbit=t*.30;
      for(let k=0;k<3;k++){
        const tilt=[-.55,.70,1.58][k],angle=orbit+k*2.1;
        const ex=Math.cos(angle),ey=Math.sin(angle)*.34;
        const x=cx+(ex*Math.cos(tilt)-ey*Math.sin(tilt))*radius;
        const y=cy+(ex*Math.sin(tilt)+ey*Math.cos(tilt))*radius;
        ctx.fillStyle=`rgba(239,239,228,${.8*baseAlpha})`;
        ctx.fillRect(Math.floor(x/unit)-1,Math.floor(y/unit)-1,3,3);
      }
    }
  }
  function drawTransition(t){
    tx.clearRect(0,0,overlay.width,overlay.height);
    const elapsed=t-transitionStart;
    if(elapsed<0 || elapsed>1.1 || state.paused || state.reduced)return;
    const fade=Math.sin(Math.min(1,elapsed/1.1)*PI);
    tx.font='6px monospace';tx.textAlign='center';
    const columns=Math.ceil(width/16);
    for(let c=0;c<columns;c++){
      const s=streams[c%streams.length],head=elapsed*(height+480)*1.35-s.seed*220;
      for(let row=0;row<15;row++){
        const y=head-row*15;
        if(y<0||y>height)continue;
        const alpha=fade*(1-row/16)*.66;
        tx.fillStyle=`rgba(201,201,190,${alpha})`;
        tx.fillText(chars[(c*3+row*7+Math.floor(t*18))%chars.length],c*8,y/2);
      }
    }
  }
  function draw(dt){
    const damping=1-Math.exp(-7*dt);
    if(state.paused||state.reduced)state.scene=state.target;
    else state.scene+=(state.target-state.scene)*damping;
    if(Math.abs(state.target-state.scene)<.0001)state.scene=state.target;
    px+=(pointerX-px)*.04;py+=(pointerY-py)*.04;
    ctx.fillStyle='#050505';ctx.fillRect(0,0,canvas.width,canvas.height);
    drawStars(clock);drawRain(clock);drawCore(clock);drawTransition(clock);
  }
  function tick(now){
    frameId=0;
    if(state.paused||document.hidden)return;
    const elapsed=now-last;
    const interval=width<761?1000/30:1000/40;
    if(elapsed>=interval){
      const dt=Math.min(.08,elapsed/1000);last=now;clock+=dt;draw(dt);
    }
    frameId=requestAnimationFrame(tick);
  }
  function start(){if(!frameId&&!state.paused&&!document.hidden){last=performance.now();frameId=requestAnimationFrame(tick);}}
  function stop(){if(frameId){cancelAnimationFrame(frameId);frameId=0;}tx.clearRect(0,0,overlay.width,overlay.height);}
  window.MiaoheVisual={
    setScene(index){state.target=clamp(index,0,3);if(state.paused){state.scene=state.target;draw(0);}else start();},
    setPaused(value){state.paused=Boolean(value)||state.reduced;state.paused?stop():start();document.body.classList.toggle('motion-paused',state.paused);},
    setRain(value){state.rain=Boolean(value);if(state.paused)draw(0);},
    transition(){if(!state.paused&&!state.reduced){transitionStart=clock;start();}},
    getState:()=>({...state,available:true}),resize
  };
  addEventListener('pointermove',event=>{pointerX=(event.clientX/width-.5)*2;pointerY=(event.clientY/height-.5)*2;},{passive:true});
  let resizeFrame=0;
  addEventListener('resize',()=>{cancelAnimationFrame(resizeFrame);resizeFrame=requestAnimationFrame(resize);},{passive:true});
  document.addEventListener('visibilitychange',()=>{document.hidden?stop():start();});
  preference.addEventListener('change',event=>{
    state.reduced=event.matches;state.paused=event.matches;
    document.body.classList.toggle('motion-reduced',event.matches);
    window.MiaoheVisual.setPaused(event.matches);draw(0);
    dispatchEvent(new CustomEvent('miaohe:motionchange'));
  });
  document.body.classList.toggle('motion-reduced',state.reduced);
  resize();start();
})();
