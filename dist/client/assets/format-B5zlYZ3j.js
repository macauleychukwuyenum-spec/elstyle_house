function t(r){const e=typeof r=="string"?Number(r):r??0;return new Intl.NumberFormat("en-NG",{style:"currency",currency:"NGN",maximumFractionDigits:0}).format(Number.isFinite(e)?e:0)}export{t as f};
