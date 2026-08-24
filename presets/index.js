export const presets = [
 { slug:'passport', name:'Passport photo', category:'Photo', width:3.5, height:4.5, unit:'cm', dpi:300, formats:['JPG','PNG'], notes:'Commonly used specification — verify the latest requirements on the official application website.' },
 { slug:'pan-photo', name:'PAN application photo', category:'Government', width:3.5, height:2.5, unit:'cm', dpi:300, formats:['JPG'], notes:'Commonly used specification — verify the latest requirements on the official application website.' },
 { slug:'pan-signature', name:'PAN signature', category:'Signature', width:3.5, height:1.5, unit:'cm', dpi:200, formats:['JPG','PNG'], notes:'Commonly used specification — verify the latest requirements on the official application website.' },
 { slug:'visa', name:'Visa photo', category:'Government', width:2, height:2, unit:'in', dpi:300, formats:['JPG'], notes:'Commonly used specification — verify the latest requirements on the official application website.' },
 { slug:'application', name:'General application photo', category:'Government', width:300, height:300, unit:'px', dpi:300, formats:['JPG','PNG'], notes:'Commonly used specification — verify the latest requirements on the official application website.' }
];
export function presetPixels(p) { const factor = p.unit === 'cm' ? p.dpi / 2.54 : p.unit === 'in' ? p.dpi : 1; return { width: Math.round(p.width * factor), height: Math.round(p.height * factor) }; }
