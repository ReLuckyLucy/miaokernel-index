/* Progressive UI enhancement. Content and external project links remain usable
   when JavaScript, clipboard permission or the Canvas context are unavailable. */
(function () {
  'use strict';
  const visuals=window.MiaoheVisual;
  const {project}=window.MiaoheCore;
  const scenes=Array.from(document.querySelectorAll('.scene'));
  const navigation=Array.from(document.querySelectorAll('.scene-indicator a, [data-nav]'));
  const menuButton=document.querySelector('.menu-toggle');
  const mobileNav=document.getElementById('mobile-nav');
  const motionButton=document.getElementById('motion-toggle');
  const rainButton=document.getElementById('rain-toggle');
  const dialog=document.getElementById('project-dialog');
  let active=0,scrollFrame=0,lastTransition=0,toastTimeout=0;
  const reduced=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  function setMenu(open){
    menuButton.setAttribute('aria-expanded',String(open));
    menuButton.setAttribute('aria-label',open?'关闭导航':'打开导航');
    mobileNav.hidden=!open;
  }
  menuButton.addEventListener('click',()=>setMenu(mobileNav.hidden));
  document.addEventListener('pointerdown',event=>{
    if(!mobileNav.hidden&&!mobileNav.contains(event.target)&&!menuButton.contains(event.target))setMenu(false);
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape')setMenu(false);});
  function syncMotion(){
    const state=visuals.getState();
    motionButton.setAttribute('aria-pressed',String(state.paused));
    motionButton.setAttribute('aria-label',state.paused?'启用动态效果':'暂停动态效果');
    motionButton.querySelector('.pause-icon').textContent=state.paused?'▷':'Ⅱ';
    motionButton.querySelector('.control-text').textContent=state.reduced?'静态':state.paused?'动效关':'动效开';
    motionButton.disabled=state.reduced||state.available===false;
    motionButton.title=state.reduced?'已遵循系统减少动态效果设置':state.paused?'启用动态效果':'暂停动态效果';
  }
  motionButton.addEventListener('click',()=>{visuals.setPaused(!visuals.getState().paused);syncMotion();});
  rainButton.addEventListener('click',()=>{
    const enabled=rainButton.getAttribute('aria-pressed')!=='true';
    rainButton.setAttribute('aria-pressed',String(enabled));visuals.setRain(enabled);
  });
  addEventListener('miaohe:motionchange',syncMotion);syncMotion();
  function updateScene(){
    scrollFrame=0;
    const center=innerHeight*.45;
    let next=0;
    for(let index=0;index<scenes.length;index++)if(scenes[index].getBoundingClientRect().top<=center)next=index;
    if(next!==active){
      active=next;visuals.setScene(active);
      if(performance.now()-lastTransition>1100){visuals.transition();lastTransition=performance.now();}
    }
    const id=scenes[active].id;
    navigation.forEach(link=>{
      if(link.getAttribute('href')==='#'+id)link.setAttribute('aria-current','location');
      else link.removeAttribute('aria-current');
    });
    document.body.dataset.activeScene=String(active);
  }
  addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(updateScene);},{passive:true});
  addEventListener('resize',()=>{if(innerWidth>760)setMenu(false);updateScene();},{passive:true});
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',event=>{
      const target=document.getElementById(link.getAttribute('href').slice(1));
      if(!target)return;
      event.preventDefault();setMenu(false);
      const id=target.id;
      if(id!=='main'&&scenes[active].id!==id){visuals.transition();lastTransition=performance.now();}
      target.scrollIntoView({behavior:reduced()?'instant':'smooth',block:'start'});
      // file:// and in-memory preview environments may disallow history writes.
      try{history.replaceState(null,'','#'+id);}catch(_){/* Navigation itself still succeeds. */}
      if(id==='main'){target.setAttribute('tabindex','-1');target.focus({preventScroll:true});}
    });
  });
  const year=document.getElementById('year');year.textContent=String(new Date().getFullYear());
  let coordinateTime=0;
  addEventListener('pointermove',event=>{
    if(performance.now()-coordinateTime<90)return;
    coordinateTime=performance.now();
    document.getElementById('pointer-x').textContent=String(Math.round(event.clientX)).padStart(4,'0');
    document.getElementById('pointer-y').textContent=String(Math.round(event.clientY)).padStart(4,'0');
  },{passive:true});
  function toast(message){
    const element=document.getElementById('toast');element.textContent=message;element.classList.add('visible');
    clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>element.classList.remove('visible'),2600);
  }
  async function copyProject(){
    let copied=false;
    try{
      if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(project.url);copied=true;}
    }catch(_){/* Fall back to a selectable textarea on local/insecure previews. */}
    if(!copied){
      const area=document.createElement('textarea');area.value=project.url;
      area.setAttribute('aria-label','TokenHub 项目网址');
      Object.assign(area.style,{position:'fixed',left:'-9999px',top:'0'});
      document.body.appendChild(area);area.select();
      try{copied=document.execCommand('copy');}catch(_){copied=false;}
      area.remove();document.getElementById('copy-project').focus({preventScroll:true});
    }
    toast(copied?'项目网址已复制':'复制受限，请从项目入口获取网址');
  }
  document.getElementById('copy-project').addEventListener('click',copyProject);
  document.getElementById('project-info').addEventListener('click',()=>{
    if(typeof dialog.showModal==='function')dialog.showModal();else dialog.setAttribute('open','');
  });
  document.getElementById('close-dialog').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{
    const r=dialog.getBoundingClientRect();
    if(event.target===dialog&&(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom))dialog.close();
  });
  if(location.hash){const target=document.getElementById(location.hash.slice(1));if(target)requestAnimationFrame(()=>target.scrollIntoView({behavior:'instant'}));}
  updateScene();
})();
