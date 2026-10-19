import cv2,numpy as np,sys,os
from scipy.ndimage import binary_fill_holes
# Alphabet-Blatt (grauer Grund) -> einzelne freigestellte Buchstaben. Spalten pro Reihe über Lücken finden,
# damit Ä/Ö/Ü-Punkte beim Buchstaben bleiben.
def cut_sheet(path,rows,out):
    os.makedirs(out,exist_ok=True)
    im=cv2.imread(path); hsv=cv2.cvtColor(im,cv2.COLOR_BGR2HSV)
    S=hsv[...,1].astype(float); V=hsv[...,2].astype(float)
    m=((S>40)|(V>200)).astype(np.uint8)
    m=cv2.morphologyEx(m,cv2.MORPH_CLOSE,np.ones((5,5),np.uint8))
    m=cv2.morphologyEx(m,cv2.MORPH_OPEN,np.ones((5,5),np.uint8))
    ys=m.sum(1)>3; bands=[];inb=False
    for y,v in enumerate(ys):
        if v and not inb: s=max(y-8,0);inb=True
        if not v and inb:
            if y-s>40: bands.append((s,min(y+8,len(ys))))
            inb=False
    # nahe Bänder (Umlaut-Punkte) zusammenlegen
    mb=[]
    for b in bands:
        if mb and b[0]-mb[-1][1]<40: mb[-1]=(mb[-1][0],b[1])
        else: mb.append(b)
    assert len(mb)==len(rows),(mb,rows)
    for (y0,y1),chars in zip(mb,rows):
        band=m[y0:y1]; col=band.sum(0)
        n=len(chars)
        # Lücken in der Spalten-Summe = Grenzen; zu wenige Teile -> breitestes Stück an der dünnsten Stelle teilen
        on=col>2; segs=[];inr=False
        for x,v in enumerate(on):
            if v and not inr: s0=x;inr=True
            if not v and inr: segs.append([s0,x]);inr=False
        if inr: segs.append([s0,len(on)])
        segs=[g for g in segs if g[1]-g[0]>15]
        while len(segs)<n:
            i=max(range(len(segs)),key=lambda j:segs[j][1]-segs[j][0]); a,b=segs[i]
            q=(b-a)//4; c=a+q+int(np.argmin(col[a+q:b-q])); segs[i:i+1]=[[a,c],[c,b]]
        xs=[g[0] for g in segs]+[segs[-1][1]]
        xs=[max(0,segs[0][0]-6)]+[(segs[k][1]+segs[k+1][0])//2 for k in range(n-1)]+[min(m.shape[1],segs[-1][1]+6)]
        for k,ch in enumerate(chars):
            sub=band[:,xs[k]:xs[k+1]].copy()
            if sub.sum()==0: continue
            yy,xx=np.nonzero(sub); p=6
            Y0,Y1,X0,X1=max(yy.min()-p,0),min(yy.max()+p,sub.shape[0]),max(xx.min()-p,0),min(xx.max()+p,sub.shape[1])
            raw=sub[Y0:Y1,X0:X1].astype(bool); filled=binary_fill_holes(raw)
            # nur kleine Löcher (Glanzpunkte) füllen, Innenräume von O, A, B … bleiben offen
            hn,hl,hs,_=cv2.connectedComponentsWithStats((filled&~raw).astype(np.uint8))
            mm=raw.copy()
            for j in range(1,hn):
                if hs[j,4]<1500: mm[hl==j]=True
            mm=mm.astype(np.uint8)
            mm=cv2.erode(mm,np.ones((3,3),np.uint8))
            a=cv2.GaussianBlur(mm.astype(float),(5,5),0)
            rgb=im[y0+Y0:y0+Y1,xs[k]+X0:xs[k]+X1]
            cv2.imwrite(f'{out}/{ch}.png',np.dstack([rgb,(a*255).astype(np.uint8)]))
def word(wd,d,H=300,gap=4):
    # Grundlinie: alle Buchstaben auf gleiche Unterkante, Höhe nach normalem Buchstaben
    ims=[cv2.imread(f'{d}/{c}.png',cv2.IMREAD_UNCHANGED) for c in wd]
    ref=cv2.imread(f'{d}/E.png',cv2.IMREAD_UNCHANGED).shape[0]; sc=H/ref
    ims=[cv2.resize(x,(int(x.shape[1]*sc),int(x.shape[0]*sc))) for x in ims]
    top=max(x.shape[0] for x in ims); W=sum(x.shape[1] for x in ims)+gap*(len(ims)-1)
    out=np.zeros((top,W,4),np.uint8); xx=0
    for x in ims:
        h,w=x.shape[:2]; reg=out[top-h:,xx:xx+w]; a=x[...,3:]/255.
        reg[...,:3]=(x[...,:3]*a+reg[...,:3]*(1-a)).astype(np.uint8); reg[...,3]=np.maximum(reg[...,3],x[...,3]); xx+=w+gap
    return out
