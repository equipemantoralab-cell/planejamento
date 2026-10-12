// CSS dos slides (1440x810). Usado na plataforma e no HTML exportado.
let DECK_CSS = `
.slide{--hf:"Source Serif 4",Georgia,serif;--hw:700;--hq:600;--tt:none;--h3w:700;--brand:#2b04b5;--dark:#000033;--accent:#19a7c2;--ink:#14143c;--muted:#55587a;
 --tint:color-mix(in srgb,var(--brand) 7%,#fff);--tint2:color-mix(in srgb,var(--brand) 14%,#fff);
 --brand2:color-mix(in srgb,var(--brand) 78%,#fff);--navy:color-mix(in srgb,var(--dark) 92%,var(--brand));
 position:relative;width:1440px;height:810px;overflow:hidden;background:#fff;color:var(--ink);
 font-family:'Inter','Segoe UI',system-ui,sans-serif;font-size:22px;line-height:1.45;text-align:left;
 -webkit-print-color-adjust:exact;print-color-adjust:exact;box-sizing:border-box}
.slide *{box-sizing:border-box}
.slide h1,.slide h2,.slide h3,.slide .serif{font-family:var(--hf);font-weight:var(--hw);color:var(--ink);margin:0;letter-spacing:-.01em}
.slide h1,.slide h2{text-transform:var(--tt)}
.slide h3{font-weight:var(--h3w)}
.slide .lg-m{display:block;fill:currentColor}
.slide p{margin:0}
.slide .pad{position:absolute;inset:0;padding:64px 84px 70px}
.slide .eb{font-size:13px;font-weight:700;letter-spacing:.28em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.slide h2{font-size:46px;line-height:1.1}
.slide .lead{font-size:23px;color:var(--muted);margin-top:14px;max-width:1100px}
.slide .foot{position:absolute;left:84px;right:84px;bottom:26px;display:flex;justify-content:space-between;font-size:10.5px;letter-spacing:.2em;text-transform:uppercase;color:#9a9cb8}
.slide.dk .foot,.slide.photo .foot{color:rgba(255,255,255,.5)}
.slide .body{position:absolute;left:84px;right:84px;top:190px;bottom:74px}
.slide .body.hi{top:150px}
/* backgrounds */
.slide.dk{background:radial-gradient(120% 120% at 85% 10%,color-mix(in srgb,var(--brand) 55%,var(--dark)) 0%,var(--dark) 62%);color:#fff}
.slide.dk h1,.slide.dk h2,.slide.dk h3{color:#fff}
.slide.dk .lead{color:rgba(255,255,255,.72)}
.slide.photo{background:var(--dark) var(--bg) center/cover no-repeat;color:#fff}
.slide.photo::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,color-mix(in srgb,var(--dark) 94%,transparent) 0%,color-mix(in srgb,var(--dark) 78%,transparent) 55%,color-mix(in srgb,var(--brand) 38%,transparent) 100%)}
.slide.photo h1,.slide.photo h2{color:#fff}
.slide.photo .pad,.slide.photo .foot{z-index:1}
.slide.photo .lead{color:rgba(255,255,255,.8)}
/* cover */
.slide.cover .pad{display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:110px}
.slide.cover h1{font-size:92px;line-height:1.02;color:#fff;max-width:900px}
.slide.cover .band{margin-top:30px;font-size:26px;color:rgba(255,255,255,.85);max-width:900px}
.slide.cover .by{position:absolute;right:84px;top:56px;color:rgba(255,255,255,.6);font-size:17px;letter-spacing:.06em;z-index:2}
.slide.cover .lg{position:absolute;left:84px;top:52px;height:58px;z-index:2;max-width:260px;object-fit:contain}
/* cards */
.card{background:var(--tint);border-radius:18px;padding:28px 30px;position:relative}
.card.dkc{background:var(--navy);color:#fff}
.card.dkc h3,.card.dkc .t{color:#fff}
.card.mid{background:color-mix(in srgb,var(--brand) 82%,var(--dark));color:#fff}
.card.mid h3,.card.mid .t{color:#fff}
.card h3,.card .t{font-size:28px;line-height:1.2;margin-bottom:10px}
.card p,.card .d{font-size:19px;color:var(--muted)}
.card.dkc p,.card.dkc .d,.card.mid p,.card.mid .d{color:rgba(255,255,255,.78)}
.card .q{font-size:19px;font-style:italic;color:var(--muted)}
.grid{display:grid;gap:22px;height:100%}
.g2{grid-template-columns:1fr 1fr}.g3{grid-template-columns:1fr 1fr 1fr}.g4{grid-template-columns:repeat(4,1fr)}
.rows2{grid-template-rows:1fr 1fr}
.tag{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;padding:5px 12px;border-radius:99px;background:var(--brand);color:#fff;margin-bottom:12px}
.tag.ac{background:var(--accent)}
.card.dkc .tag,.card.mid .tag{background:rgba(255,255,255,.18)}
.bar{position:absolute;left:84px;right:84px;bottom:66px;background:var(--navy);color:#fff;border-radius:16px;padding:20px 28px;font-size:20px;display:flex;gap:14px;align-items:center}
.bar b{color:var(--accent);white-space:nowrap}
.bar.lt{background:var(--tint2);color:var(--ink)}
.bar.lt b{color:var(--brand)}
.num{font-family:var(--hf);font-weight:var(--hq);font-size:54px;line-height:1;color:var(--brand);opacity:.9}
.card.dkc .num,.card.mid .num{color:#fff}
.big{font-family:var(--hf);font-weight:var(--hq);font-size:64px;line-height:1;letter-spacing:-.02em}
.sm{font-size:12px;font-weight:700;letter-spacing:.24em;text-transform:uppercase;color:var(--accent);margin-bottom:12px}
.card.dkc .sm,.card.mid .sm{color:var(--accent)}
.ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:17px}
.ul li{position:relative;padding-left:36px;font-size:22px;color:var(--muted)}
.ul li::before{content:"";position:absolute;left:0;top:3px;width:20px;height:20px;border-radius:50%;background:var(--accent)}
.ul li::after{content:"";position:absolute;left:7px;top:7px;width:5px;height:9px;border:solid #fff;border-width:0 2.2px 2.2px 0;transform:rotate(45deg)}
.ul.x li::before{background:#d9506a}
.ul.x li::after{border:0;left:9px;top:5px;width:2.2px;height:12px;background:#fff;transform:rotate(45deg);box-shadow:0 0 0 0 #fff}
.ul.x li{color:var(--muted)}
.dk .ul li,.card.dkc .ul li{color:rgba(255,255,255,.82)}
.quote{font-family:var(--hf);font-weight:var(--hq);font-size:46px;line-height:1.25;color:#fff}
.slide.dk .center{position:absolute;left:140px;right:140px;top:0;bottom:0;display:flex;flex-direction:column;justify-content:center}
.who{margin-top:30px;font-size:21px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:600}
.badge{width:60px;height:60px;border-radius:50%;background:var(--tint2);color:var(--brand);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:28px;font-family:'Source Serif 4',serif;flex:none}
.kv{background:var(--tint);border-radius:14px;padding:20px 26px}
.kv .k{font-size:12px;font-weight:700;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);margin-bottom:6px}
.kv .v{font-size:22px;color:var(--ink);font-weight:500}
table.tb{width:100%;border-collapse:separate;border-spacing:0 8px;font-size:19px}
table.tb th{font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:var(--accent);text-align:left;padding:4px 20px;font-weight:700}
table.tb td{background:var(--tint);padding:14px 20px;color:var(--ink);vertical-align:top}
table.tb td:first-child{border-radius:12px 0 0 12px;font-weight:700}
table.tb td:last-child{border-radius:0 12px 12px 0}
.divider .pad{display:flex;flex-direction:column;justify-content:center}
.divider h2{font-size:64px;max-width:980px;margin-bottom:6px}
.divider .lead{font-size:27px;max-width:960px}
.flow{display:flex;gap:0;height:100%;align-items:stretch}
.flow .st{flex:1;background:var(--tint);padding:28px 24px;clip-path:polygon(0 0,calc(100% - 26px) 0,100% 50%,calc(100% - 26px) 100%,0 100%,26px 50%);margin-left:-8px;padding-left:44px;padding-right:38px}
.flow .st:first-child{clip-path:polygon(0 0,calc(100% - 26px) 0,100% 50%,calc(100% - 26px) 100%,0 100%);padding-left:28px;margin-left:0}
.flow .st:nth-child(even){background:var(--tint2)}
.flow .st .num{font-size:40px;margin-bottom:8px}
.flow .st h3{font-size:26px;margin-bottom:8px}
.flow .st p{font-size:17px;color:var(--muted)}
.tl{display:flex;gap:26px;height:100%;position:relative}
.tl::before{content:"";position:absolute;left:30px;right:30px;top:30px;height:3px;background:var(--tint2)}
.tl .it{flex:1;position:relative;padding-top:0}
.tl .dot{width:60px;height:60px;border-radius:50%;background:var(--brand);color:#fff;font-family:'Source Serif 4',serif;font-weight:700;font-size:26px;display:flex;align-items:center;justify-content:center;position:relative;z-index:1;margin-bottom:20px}
.tl h3{font-size:28px;margin-bottom:10px}
.tl p{font-size:19px;color:var(--muted)}
.fit{display:flex;flex-direction:column;gap:12px}
.phone{background:#fff;border-radius:26px;box-shadow:0 24px 60px rgba(20,20,60,.18);padding:30px 34px;border:1px solid #e6e7f3}
.phone .av{width:84px;height:84px;border-radius:50%;background:linear-gradient(135deg,var(--brand),var(--accent));margin-bottom:16px;background-size:cover;background-position:center}
.phone .nm{font-weight:700;font-size:23px}
.phone .hd{color:var(--muted);font-size:20px;margin-top:8px;white-space:pre-line}
.mini{font-size:14px;color:var(--muted)}
.hz{display:flex;flex-direction:column;gap:16px}
.hz .h{display:flex;gap:18px;align-items:flex-start;background:var(--tint);border-radius:16px;padding:20px 24px}
`;
DECK_CSS += `
.slide.mt{--hf:'Outfit','Inter',sans-serif;--hw:300;--hq:400;--tt:uppercase;--h3w:500}
.slide.mt h2{letter-spacing:.01em}
.slide.mt .quote{text-transform:none;font-weight:300}
.slide.mt .serif{text-transform:none}
.slide .tbl-h{font-size:13px}
.slide .tl-s{display:flex;gap:0;height:100%;align-items:flex-end}
.slide .chart{display:flex;align-items:flex-end;gap:22px;height:100%;padding:0 6px}
.slide .chart .col{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;gap:8px}
.slide .chart .barv{width:100%;border-radius:12px 12px 0 0;background:linear-gradient(180deg,var(--brand2),var(--brand))}
.slide .chart .vl{font-weight:700;font-size:20px;color:var(--ink)}
.slide .chart .pl{font-size:15px;color:var(--muted);letter-spacing:.06em;text-transform:uppercase}
.slide .agenda{display:grid;grid-template-columns:1fr 1fr;gap:14px 40px;height:auto}
.slide .agenda .it{display:flex;align-items:center;gap:20px;padding:14px 0;border-bottom:1px solid var(--tint2)}
.slide .agenda .it .n{font-family:var(--hf);font-size:30px;color:var(--brand);width:54px;font-weight:var(--hq)}
.slide .agenda .it .t{font-size:23px;font-weight:600;color:var(--ink)}
.slide .swot{display:grid;grid-template-columns:1fr 1fr;grid-template-rows:1fr 1fr;gap:20px;height:100%}
.slide .mlogo{position:absolute;z-index:3}
`;
