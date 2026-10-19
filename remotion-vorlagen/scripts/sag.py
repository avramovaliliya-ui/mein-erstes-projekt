import numpy as np, cv2, json
from PIL import Image
from scipy.ndimage import binary_dilation
B='/tmp/claude-0/-home-user-mein-erstes-projekt/6951b3f4-245f-5cc6-8384-60a6b2b60b9d/scratchpad'
S=B+'/sag'; W,H=720,1280
rng=np.random.default_rng(3)
def raw(n): return cv2.imread(f'{S}/raw/f{n:04d}.jpg').astype(np.float32)
def cut(n):
    a=np.asarray(Image.open(f'{B}/kueche/cut/c{n:04d}.png')).astype(np.float32)
    rgb=a[:,:,2::-1].copy(); al=a[:,:,3:4]/255.
    return rgb,al
def plate(n):
    f=raw(n).astype(np.uint8); _,al=cut(n)
    h=binary_dilation(al[...,0]>0.04,iterations=16)
    sm=cv2.resize(f,(W//4,H//4),interpolation=cv2.INTER_AREA)
    v=(cv2.resize(h.astype(np.uint8),(W//4,H//4),interpolation=cv2.INTER_NEAREST)==0).astype(np.uint8)
    o=np.zeros_like(sm); cv2.xphoto.inpaint(sm,v,o,cv2.xphoto.INPAINT_FSR_BEST)
    up=cv2.resize(o,(W,H),interpolation=cv2.INTER_CUBIC).astype(np.float32)
    hb=cv2.GaussianBlur(binary_dilation(h,iterations=3).astype(np.float32),(15,15),0)[...,None]
    return f*(1-hb)+up*hb
def comp(bg,fg,al): return bg*(1-al)+fg*al
def noise(seed,sc):
    r=np.random.default_rng(seed).random((H//sc+2,W//sc+2)).astype(np.float32)
    return cv2.resize(r,(W,H),interpolation=cv2.INTER_CUBIC)
frames=[]; marks={}
def put(img): frames.append(np.clip(img,0,255).astype(np.uint8))

# A: src 1..99 normal
for n in range(1,100): put(raw(n))
marks['verschwinde']=55
# B: dissolve src 100..126 + hold
P1=plate(100)
nz=0.6*noise(1,40)+0.4*noise(2,9)
nz=(nz-nz.min())/(nz.max()-nz.min())
yy=np.linspace(0,1,H)[:,None]*np.ones((1,W))
field=0.75*nz+0.25*(1-yy)   # oben zuerst
parts=np.zeros((0,6),np.float32)  # x,y,vx,vy,life,size
prev=None; marks['dissolve']=len(frames)
T=30
for i in range(T+30):
    n=min(100+i,126)
    rgb,al=cut(n)
    t=-0.05+1.15*min(i/T,1)
    keep=(field>t).astype(np.float32)[...,None]
    edge=np.clip(1-np.abs(field-t)/0.035,0,1)[...,None]*(field>t-0.02)[...,None]*al
    a2=al*keep
    img=comp(P1,rgb,a2)
    glow=cv2.GaussianBlur(edge[...,0],(0,0),4)[...,None]
    img=img+ (edge*np.array([150,215,255])*1.4) + glow*np.array([90,170,255])*1.2
    # neue Partikel
    cur=a2[...,0]>0.3
    if prev is not None:
        gone=prev&~cur
        ys,xs=np.nonzero(gone)
        if len(xs):
            k=rng.choice(len(xs),min(len(xs),260),replace=False)
            new=np.stack([xs[k],ys[k],rng.normal(0,1.2,len(k)),rng.normal(-2.5,1.2,len(k)),rng.uniform(20,40,len(k)),rng.uniform(1,2.6,len(k))],1).astype(np.float32)
            parts=np.concatenate([parts,new])
    prev=cur
    layer=np.zeros((H,W),np.float32)
    parts[:,0]+=parts[:,2]+np.sin(parts[:,1]*0.03+i*0.3)*0.8; parts[:,1]+=parts[:,3]; parts[:,3]-=0.06; parts[:,4]-=1
    parts=parts[parts[:,4]>0]
    for x,y,_,_,l,s in parts:
        if 0<=x<W and 0<=y<H: cv2.circle(layer,(int(x),int(y)),int(s),float(min(l/20,1)),-1,cv2.LINE_AA)
    lg=cv2.GaussianBlur(layer,(0,0),2.5)
    img=img+(layer[...,None]*np.array([190,235,255])+lg[...,None]*np.array([120,200,255])*2)
    if i>=T: img=img  # leer
    put(img)
marks['leer']=marks['dissolve']+T
# D: src 328..401 dann rueckwaerts 400..360 ; Schnipp + Klone
city=cv2.resize(cv2.imread(f'{S}/stadt_leer.jpg'),(W,H)).astype(np.float32)
src=list(range(328,402))+list(range(400,359,-1))
marks['schnipp_cmd']=len(frames)
SN=18; CL=62
d0=len(frames)
yy2,xx2=np.mgrid[0:H,0:W]
for j,n in enumerate(src):
    f=raw(n); rgb,al=cut(n)
    if j<SN: img=f
    else:
        k=j-SN
        r=k*95.0
        cx,cy=360,560
        dist=np.sqrt((xx2-cx)**2+(yy2-cy)**2)
        inside=np.clip((r-dist)/20,0,1)[...,None]
        ring=np.clip(1-np.abs(dist-r)/14,0,1)[...,None]*(k<16)
        # Stadt leicht an Licht angepasst
        bg=f*(1-inside)+city*inside
        warm=rgb*np.array([0.82,0.9,1.02])*inside+rgb*(1-inside)
        img=comp(bg,warm,al)+ring*255*0.9
        if k<3: img=img+(3-k)*60
        if j>=CL:
            c=j-CL
            for side,(dx,sc,dl) in enumerate([(-215,0.8,6),(215,0.8,12),(-370,0.64,18),(370,0.64,24)]):
                e=min(max((c-[0,0,6,6][side])/8,0),1); e=1-(1-e)**3
                if e<=0: continue
                m=src[max(j-dl,0)]; r2,a2=cut(m)
                M=np.float32([[sc,0,(1-sc)*cx+dx*e],[0,sc,(1-sc)*1180]])
                rr=cv2.warpAffine(r2,M,(W,H)); aa=cv2.warpAffine(a2,M,(W,H))[...,None]*e
                # Klone hinter die Echte
                img=comp(img,rr*np.array([0.78,0.86,1.0]),aa*(1-al))
                img=img
    put(img)
marks['klone_cmd']=d0+CL-12
# E: src 512..583 Stopp, dann pingpong
P3=plate(530)
gray=cv2.cvtColor(P3.astype(np.uint8),cv2.COLOR_BGR2GRAY).astype(np.float32)[...,None]*np.ones(3)
gray=gray*0.92+np.array([18,8,0])  # kuehler Ton
e0=len(frames); ST=18
srcE=list(range(512,584))+list(range(582,519,-1))+list(range(521,560))
marks['stopp_cmd']=e0
for j,n in enumerate(srcE):
    f=raw(n); rgb,al=cut(n)
    if j<ST: img=f
    else:
        k=j-ST; e=min(k/5,1)
        bg=f*(1-e)+gray*e if k<5 else gray
        img=comp(bg,rgb,al)
        if k<4: img=img+(4-k)*35
        if k<10:
            sh=(10-k)*2; img=np.roll(img,sh if k%2 else -sh,axis=1)
    put(img)
marks['ende']=e0+72
marks['total']=len(frames)
json.dump(marks,open(f'{S}/marks.json','w'))
vw=cv2.VideoWriter(f'{S}/out/fx.mp4',cv2.VideoWriter_fourcc(*'mp4v'),24,(W,H))
for fr in frames: vw.write(fr)
vw.release(); print(marks)
