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
  context.clearRect(0,0,n,n);
  if($('bgMode').value==='color'){context.fillStyle=$('bgColor').value;context.fillRect(0,0,n,n);}
  context.save();
  if($('clip').checked){context.beginPath();context.arc(n/2,n/2,n/2,0,Math.PI*2);context.clip();}
  drawLayer(context,'icon',n);context.restore();
  drawLayer(context,'ring',n);
}
const versions={icon:0,ring:0};
async function load(name,file){
  const version=++versions[name];if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)){ $('status').textContent='PNG・JPEG・WebPの画像を選んでください。';return; }
  const url=URL.createObjectURL(file),image=new Image();
  try{image.src=url;await image.decode();if(version!==versions[name])return;
    layers[name]={image,x:0,y:0};$(name+'Scale').value=100;$(name+'Angle').value=0;$('target').value=name;update();
    $('showImage').disabled=!layers.icon.image;$('status').textContent=layers.icon.image?'画像を読み込みました。位置やサイズを調整できます。':'アイコン画像を選んでください。';
  }catch{if(version===versions[name])$('status').textContent='画像を読み込めませんでした。別の画像を選んでください。';}
  finally{URL.revokeObjectURL(url);}
}
function update(){for(const name of ['icon','ring']){$(name+'ScaleValue').textContent=value(name+'Scale')+'%';$(name+'AngleValue').textContent=value(name+'Angle')+'°';}$('bgColor').disabled=$('bgMode').value==='transparent';render();}
for(const name of ['icon','ring'])$(name+'File').addEventListener('change',e=>load(name,e.target.files[0]));
for(const id of ['iconScale','iconAngle','ringScale','ringAngle','clip','bgMode','bgColor'])$(id).addEventListener('input',update);
$('reset').addEventListener('click',()=>{const name=$('target').value;layers[name].x=layers[name].y=0;$(name+'Scale').value=100;$(name+'Angle').value=0;update();});
let drag=null;
canvas.addEventListener('pointerdown',e=>{const name=$('target').value;if(!layers[name].image)return;drag={id:e.pointerId,name,x:e.clientX,y:e.clientY,lx:layers[name].x,ly:layers[name].y};canvas.setPointerCapture(e.pointerId);});
canvas.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;const rect=canvas.getBoundingClientRect();layers[drag.name].x=drag.lx+(e.clientX-drag.x)/rect.width;layers[drag.name].y=drag.ly+(e.clientY-drag.y)/rect.height;render();});
for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,()=>drag=null);
let exportFile=null, exportUrl=null;
$('showImage').addEventListener('click',()=>{
  if(!layers.icon.image)return;
  $('showImage').disabled=true;
  const out=document.createElement('canvas');out.width=out.height=value('size');render(out.getContext('2d'),out.width);
  out.toBlob(blob=>{
    $('showImage').disabled=false;
    if(!blob){$('status').textContent='画像を作成できませんでした。';return;}
    if(exportUrl)URL.revokeObjectURL(exportUrl);
    exportFile=new File([blob],'icon-ring.png',{type:'image/png'});exportUrl=URL.createObjectURL(blob);
    $('exportPreview').src=exportUrl;
    const canShare=!!(navigator.share&&navigator.canShare&&navigator.canShare({files:[exportFile]}));
    $('shareImage').hidden=!canShare;
    $('shareStatus').textContent=canShare?'共有メニューから画像を保存・共有できます。':'このブラウザでは画像共有に対応していません。画像を長押しするか「PNGを保存」をお使いください。';
    $('imageDialog').showModal();
  },'image/png');
});
$('closeImage').addEventListener('click',()=>$('imageDialog').close());
$('save').addEventListener('click',()=>{if(!exportUrl)return;const a=document.createElement('a');a.href=exportUrl;a.download='icon-ring.png';a.click();});
$('shareImage').addEventListener('click',async()=>{
  if(!exportFile)return;
  try{await navigator.share({files:[exportFile]});$('shareStatus').textContent='共有しました。';}
  catch(error){$('shareStatus').textContent=error.name==='AbortError'?'共有をキャンセルしました。':'共有できませんでした。画像を長押しするか「PNGを保存」をお使いください。';}
});
render();

$('removeRing').addEventListener('click',()=>{versions.ring++;layers.ring={image:null,x:0,y:0};$('ringFile').value='';$('showImage').disabled=!layers.icon.image;render();$('status').textContent='リング画像を削除しました。';});
