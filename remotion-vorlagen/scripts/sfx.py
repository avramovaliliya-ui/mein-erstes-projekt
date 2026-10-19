import numpy as np, json, wave
S='/tmp/claude-0/-home-user-mein-erstes-projekt/6951b3f4-245f-5cc6-8384-60a6b2b60b9d/scratchpad/sag'
m=json.load(open(S+'/marks.json')); R=44100; N=int(m['total']/24*R)+R
out=np.zeros(N); rng=np.random.default_rng(1)
t_=lambda f: int(f/24*R)
def add(x,at,g=1.0):
    a=t_(at) if isinstance(at,int) else int(at*R); e=min(N,a+len(x)); out[a:e]+=x[:e-a]*g
def env(n,att,dec): t=np.arange(n)/R; return np.minimum(t/att,1)*np.exp(-t/dec)
def noise(n): return rng.normal(0,1,n)
def lp(x,k): return np.convolve(x,np.ones(k)/k,'same')
def whoosh(d=0.8,up=True):
    n=int(d*R); x=noise(n); k=np.linspace(40,3,n) if up else np.linspace(3,40,n)
    y=np.zeros(n); acc=0
    for i in range(0,n,512): kk=int(k[i]); y[i:i+512]=lp(x[max(0,i-64):i+576],kk)[64 if i else 0:][:len(y[i:i+512])]
    return y*np.sin(np.linspace(0,np.pi,n))**1.5
def sparkle(d=1.2):
    n=int(d*R); y=np.zeros(n)
    for _ in range(60):
        a=rng.integers(0,n-4000); f=rng.uniform(2500,7000); t=np.arange(3000)/R
        y[a:a+3000]+=np.sin(2*np.pi*f*t)*np.exp(-t/0.015)*rng.uniform(.2,.6)
    return y*np.linspace(1,.2,n)
def snap():
    t=np.arange(int(.4*R))/R
    c=noise(len(t))*np.exp(-t/0.004)
    b=np.sin(2*np.pi*55*t*(1+2*np.exp(-t/0.03)))*np.exp(-t/0.18)
    return c*0.9+b*0.9
def stop():
    t=np.arange(int(1.2*R))/R
    f=320*np.exp(-t/0.25)+40
    y=np.sin(2*np.pi*np.cumsum(f)/R)*np.exp(-t/0.6)
    return y*0.8+lp(noise(len(t)),3)*np.exp(-t/0.05)*0.5
def pad(n):
    t=np.arange(n)/R; y=sum(np.sin(2*np.pi*f*t)*a for f,a in [(110,.3),(164.8,.2),(220,.15),(277.2,.1)])
    return y*0.12*np.minimum(t/2,1)
out+=pad(N)
add(whoosh(1.4),m['dissolve']-4,0.5); add(sparkle(1.4),m['dissolve'],0.5)
sn=m['schnipp_cmd']+18; add(snap(),sn,0.9); add(whoosh(.6,False),sn,0.4)
for i,d in enumerate([0,0,6,6]): add(whoosh(.35),m['klone_cmd']+12+d,0.35)
add(stop(),m['stopp_cmd']+18,0.9)
end=t_(m['stopp_cmd']+18); 
out=out/np.max(np.abs(out))*0.85
fade=np.ones(N); fade[-R:]=np.linspace(1,0,R); out*=fade
w=wave.open(S+'/sfx.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(R)
w.writeframes((out*32767).astype(np.int16).tobytes()); w.close(); print('ok')
