'use strict';
const $ = id => document.getElementById(id);
const canvas = $('canvas'), ctx = canvas.getContext('2d');
const layers = {icon:{image:null,x:0,y:0},ring:{image:null,x:0,y:0}};
const value = id => Number($(id).value);
function drawLayer(context,name,n){
  const layer=layers[name]; if(!layer.image)return;
  const image=layer.image, scale=value(name+'Scale')/100;
  const fit=name==='icon'?Math.max(n/image.width,n/image.height):Math.min(n/image.width,n/image.height);
  context.save();context.translate(n/2+layer.x*n,n/2+layer.y*n);context.rotate(value(name+'Angle')*Math.PI/180);
  context.drawImage(image,-image.width*fit*scale/2,-image.height*fit*scale/2,image.width*fit*scale,image.height*fit*scale);context.restore();
}
function render(context=ctx,n=canvas.width){
  context.clearRect(0,0,n,n);context.save();
  if($('clip').checked){context.beginPath();context.arc(n/2,n/2,n/2,0,Math.PI*2);context.clip();}
  drawLayer(context,'icon',n);context.restore();
  if(layers.ring.image)drawLayer(context,'ring',n);
  else{const width=n*value('thickness')/100,scale=value('ringScale')/100;
    if(width>0){context.save();context.strokeStyle=$('color').value;context.lineWidth=width*scale;context.beginPath();context.arc(n/2+layers.ring.x*n,n/2+layers.ring.y*n,(n-width)*scale/2,0,Math.PI*2);context.stroke();context.restore();}}
}
const versions={icon:0,ring:0};
async function load(name,file){
  const version=++versions[name];if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)){ $('status').textContent='PNG・JPEG・WebPの画像を選んでください。';return; }
  const url=URL.createObjectURL(file),image=new Image();
  try{image.src=url;await image.decode();if(version!==versions[name])return;
    layers[name]={image,x:0,y:0};$(name+'Scale').value=100;$(name+'Angle').value=0;update();$('target').value=name;
    $('save').disabled=!layers.icon.image;$('status').textContent='画像を読み込みました。位置やサイズを調整できます。';
  }catch{if(version===versions[name])$('status').textContent='画像を読み込めませんでした。別の画像を選んでください。';}
  finally{URL.revokeObjectURL(url);}
}
function update(){for(const name of ['icon','ring']){ $(name+'ScaleValue').textContent=value(name+'Scale')+'%';$(name+'AngleValue').textContent=value(name+'Angle')+'°';}$('thicknessValue').textContent=value('thickness')+'%';render();}
for(const name of ['icon','ring'])$(name+'File').addEventListener('change',e=>load(name,e.target.files[0]));
for(const id of ['iconScale','iconAngle','ringScale','ringAngle','clip','color','thickness'])$(id).addEventListener('input',update);
$('clearRing').addEventListener('click',()=>{versions.ring++;layers.ring={image:null,x:0,y:0};$('ringFile').value='';$('ringScale').value=100;$('ringAngle').value=0;update();});
$('reset').addEventListener('click',()=>{const name=$('target').value;layers[name].x=layers[name].y=0;$(name+'Scale').value=100;$(name+'Angle').value=0;update();});
let drag=null;
canvas.addEventListener('pointerdown',e=>{const name=$('target').value;if(name==='icon'&&!layers.icon.image)return;drag={id:e.pointerId,name,x:e.clientX,y:e.clientY,lx:layers[name].x,ly:layers[name].y};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const rect=canvas.getBoundingClientRect();layers[drag.name].x=drag.lx+(e.clientX-drag.x)/rect.width;layers[drag.name].y=drag.ly+(e.clientY-drag.y)/rect.height;render();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>drag=null);
$('save').addEventListener('click',()=>{if(!layers.icon.image)return;const out=document.createElement('canvas');out.width=out.height=value('size');render(out.getContext('2d'),out.width);out.toBlob(blob=>{if(!blob){$('status').textContent='保存に失敗しました。';return;}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='icon-ring.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);$('status').textContent='PNGを保存しました。';},'image/png');});
render();
