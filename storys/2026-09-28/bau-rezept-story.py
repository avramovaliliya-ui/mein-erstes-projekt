import re
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H=1080,1920; SZ=54; LH=round(SZ*1.4)
REG=ImageFont.truetype('fonts/PF-Reg.ttf',SZ); ITA=ImageFont.truetype('fonts/PF-Ital.ttf',SZ)
SCR=ImageFont.truetype('fonts/GreatVibes.ttf',150); SAN=ImageFont.truetype('fonts/Lato.ttf',30)
U='/root/.claude/uploads/348c5af4-34d6-5696-ace3-52e8d54daae4/'
WIN=(U+'e43149a3-image.png',560); SIP=(U+'e1722cb3-image.png',470); MAU=(U+'9325e06e-image.png',470)
LEAF=(U+'c1f46a2a-image.png',470); TURT=(U+'3971fc75-image.png',470)
dd=ImageDraw.Draw(Image.new('RGB',(1,1)))
def words(text):
    out=[];it=False
    for part in re.split(r'(\*)',text):
        if part=='*': it=not it; continue
        for w in re.split(r'(\s+)',part):
            if w: out.append((w,it))
    return out
def wrap(text,maxw=740):
    lines=[[]];w=0
    for t,it in words(text):
        tw=dd.textlength(t,font=ITA if it else REG)
        if t.strip() and w+tw>maxw and lines[-1]:
            while lines[-1] and not lines[-1][-1][0].strip(): lines[-1].pop()
            lines.append([]);w=0
        if not t.strip() and not lines[-1]: continue
        lines[-1].append((t,it)); w+=tw
    return lines
def base(img):
    src,fx=img; im=Image.open(src).convert('RGB'); s=max(H/im.height,W/im.width)
    im=im.resize((round(im.width*s),round(im.height*s)),Image.LANCZOS)
    x0=max(0,min(im.width-W,round(fx*s)-W//2)); y0=(im.height-H)//2
    return im.crop((x0,y0,x0+W,y0+H)).convert('RGBA')
def slide(img,small,script,body,out,bottom=1500,foot=None):
    im=base(img); body_l=wrap(body)
    h_body=len(body_l)*LH; h_foot=60 if foot else 0
    y_body=bottom-h_body-h_foot; y_scr=y_body-175; y_small=y_scr-10
    txt=Image.new('RGBA',(W,H),(0,0,0,0)); sh=Image.new('RGBA',(W,H),(0,0,0,0))
    d=ImageDraw.Draw(txt); ds=ImageDraw.Draw(sh)
    # script, slightly tilted
    sl=Image.new('RGBA',(1000,260),(0,0,0,0)); s1=ImageDraw.Draw(sl)
    s1.text((20,30),script,font=SCR,fill='white',stroke_width=1,stroke_fill=(26,22,18))
    ssh=Image.new('RGBA',(1000,260),(0,0,0,0)); ImageDraw.Draw(ssh).text((24,36),script,font=SCR,fill=(0,0,0,170))
    sl=sl.rotate(4,resample=Image.BICUBIC,expand=False); ssh=ssh.rotate(4,resample=Image.BICUBIC,expand=False)
    sh.alpha_composite(ssh,(70,y_scr-60)); txt.alpha_composite(sl,(70,y_scr-60))
    if small:
        d.text((92,y_small-30),small,font=SAN,fill='white'); ds.text((94,y_small-28),small,font=SAN,fill=(0,0,0,190))
    y=y_body
    for ln in body_l:
        x=90
        for t,it in ln:
            f=ITA if it else REG
            d.text((x,y),t,font=f,fill='white',stroke_width=2,stroke_fill=(26,22,18))
            ds.text((x+2,y+3),t,font=f,fill=(0,0,0,170)); x+=d.textlength(t,font=f)
        y+=LH
    if foot:
        d.text((92,y+8),foot,font=SAN,fill='white'); ds.text((94,y+10),foot,font=SAN,fill=(0,0,0,190))
    im=Image.alpha_composite(im,sh.filter(ImageFilter.GaussianBlur(7)))
    im=Image.alpha_composite(im,txt)
    d=ImageDraw.Draw(im); b=ImageFont.truetype('fonts/Lato-Bold.ttf',22); t='KI-generiert'; tw=d.textlength(t,font=b)
    d.rounded_rectangle((W-20-tw-24,H-58,W-20,H-20),radius=7,fill=(26,22,18))
    d.text((W-20-tw-12,H-51),t,font=b,fill='#f0e8db')
    im.convert('RGB').save(out,quality=92)
S=[
 (TURT,"montag, 28. september","guten morgen","ich hab heute was für dich *mitgebracht.*",None,1500),
 (SIP,None,"ehrlich?","jahrelang hab ich mich vor der *kamera* versteckt.",None,1500),
 (MAU,None,"bis ich merkte","ich musste nicht mutiger werden – ich brauchte nur ein *werkzeug.*",None,1500),
 (LEAF,None,"jedes bild hier","ein foto von mir und ein prompt. *mehr nicht.*",None,1500),
 (WIN,None,"für dich","meine 12 prompts für deinen ganzen tag – *kostenlos.*",None,1330),
]
for i,(img,sm,sc,bd,ft,bt) in enumerate(S,1): slide(img,sm,sc,bd,f'st{i}.jpg',bt,ft)
G=Image.new('RGB',(5*360+4*12,640),'white')
for i in range(5): G.paste(Image.open(f'st{i+1}.jpg').resize((360,640)),(i*372,0))
G.save('story_vorschau.jpg',quality=90)
