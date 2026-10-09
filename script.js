/* ===== Saka Bhayangkara - Sistem Rekrutmen (prototype, localStorage) ===== */
const $=(s,e=document)=>e.querySelector(s),$$=(s,e=document)=>[...e.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const hash=s=>{let h=5381;for(const c of 'saka$'+s)h=((h*33)^c.charCodeAt(0))>>>0;return h.toString(36)};
const LOGO='<img src="logo-saka.png" alt="Logo" onerror="this.style.display=\'none\'">';
const STAT=['Menunggu Data','Menunggu Verifikasi','Seleksi Administrasi','Seleksi Wawancara','Tes Simulasi Kelompok','Lulus','Tidak Lulus'];
const SCH=['MA Yapika Kurnia','MA YTI Sukamerang','SMA PGRI Kersamanah','SMK Bhakti Kusumah','SMAN 3 GARUT','MAN 5 GARUT','SMKS Santana 1&2 Cibatu','SMA PGRI Cibatu','SMA Al - Hikmah Cibatu'];
/* ---------- Master Sekolah ---------- */

function schoolList(){
  if(Array.isArray(db.sekolah) && db.sekolah.length){
    return db.sekolah
      .filter(s=>s.status!=='Nonaktif')
      .map(s=>s.nama);
  }

  return SCH;
}

function schoolOptions(selected=''){
  return schoolList()
    .map(nama=>`
      <option
        value="${esc(nama)}"
        ${nama===selected?'selected':''}
      >
        ${esc(nama)}
      </option>
    `)
    .join('');
}
const MODS=[
  'pendaftar',
  'seleksi',
  'pengumuman',
  'target',
  'materi',
  'tugas',
  'jadwal',
  'sekolah',
  'aduan',
  'keuangan'
];
const ROLES={admin:['*'],pembina:MODS,ketua:MODS,wakil:['seleksi','pengumuman','tugas','aduan'],sekretaris:['pendaftar','pengumuman','tugas','aduan'],bendahara:['keuangan'],humas:['target','materi','pengumuman'],pendaftaran:['pendaftar','aduan'],teknis:['seleksi','tugas'],acara:['tugas','seleksi'],dokumentasi:['materi','pengumuman'],korwil_cibatu:['target','aduan'],korwil_kersamanah:['target','aduan']};
const RL={admin:['Admin Sistem','Mengelola akun dan hak akses'],pembina:['Pembina','Pembimbing dan pengawas kegiatan; memberi arahan dan persetujuan'],ketua:['Ketua Panitia','Pimpinan dan penanggung jawab kegiatan'],wakil:['Wakil Ketua','Mendampingi ketua; anggota aktif yang dipercaya'],sekretaris:['Sekretaris','Administrasi, surat, data calon, absensi, dokumen'],bendahara:['Bendahara','RAB, pemasukan/pengeluaran, bukti transaksi'],humas:['Divisi Humas & Promosi','Sosialisasi sekolah, komunikasi calon peserta, media sosial'],pendaftaran:['Divisi Pendaftaran & Administrasi','Formulir, verifikasi data, rekap peserta, izin orang tua'],teknis:['Divisi Teknis/Seleksi','Mekanisme seleksi, jadwal, penguji, penilaian'],acara:['Divisi Acara & Lapangan','Tempat, perlengkapan, rundown, konsumsi, koordinasi hari-H'],dokumentasi:['Divisi Dokumentasi & Publikasi','Foto/video, dokumentasi kegiatan, konten IG'],korwil_cibatu:['Koordinator Wilayah Cibatu','Koordinasi wilayah Cibatu'],korwil_kersamanah:['Koordinator Wilayah Kersamanah','Koordinasi wilayah Kersamanah']};
const ALUR=[['Buat Akun','Daftarkan akun dengan data valid.'],['Lengkapi Data','Isi data pribadi dan asal sekolah.'],['Seleksi Administrasi','Berkas dan data diperiksa panitia.'],['Seleksi Wawancara','Wawancara bersama tim penguji.'],['Tes Simulasi Kelompok','Simulasi kerja sama dan kepemimpinan.']];
const MOD={
  sekolah:{
  t:'Master Data Sekolah',
  f:[
    ['nama','Nama Sekolah'],
    ['alamat','Alamat'],
    ['kontak','Kontak Sekolah'],
    ['pic','Kontak / PIC'],
    ['status','Status','sel:Aktif,Nonaktif'],
    ['catatan','Catatan','area']
  ]
},
 pengumuman:{t:'Pengumuman',f:[['judul','Judul'],['isi','Isi','area'],['tanggal','Tanggal','date']]},
 seleksi:{t:'Jadwal Seleksi',f:[['tahap','Tahap','sel:Seleksi Administrasi,Seleksi Wawancara,Tes Simulasi Kelompok'],['tanggal','Tanggal','date'],['tempat','Tempat'],['penguji','Penguji / Penilai']]},
 target:{t:'Target Sosialisasi',f:[['sekolah','Sekolah','school'],['tanggal','Tanggal','date'],['jumlah','Target Peserta','number'],['status','Status','sel:Direncanakan,Berjalan,Selesai']]},
 materi:{t:'Materi Sosialisasi',f:[['judul','Judul'],['tautan','Tautan (https://...)','url'],['catatan','Catatan']]},
 tugas:{t:'Tugas & Tanggung Jawab',f:[['tugas','Tugas'],['pj','Penanggung Jawab'],['tenggat','Tenggat','date'],['status','Status','sel:Belum Dimulai,Berjalan,Selesai']]},
  jadwal:{
  t:'Jadwal Sosialisasi',
  f:[
    ['sekolah','Sekolah','school'],
    ['tanggal','Tanggal','date'],
    ['jam','Jam','time'],
    ['tempat','Tempat'],
    ['pic','Penanggung Jawab','staff'],
    ['status','Status','sel:Direncanakan,Dijadwalkan,Selesai,Dibatalkan']
  ]
},
 aduan:{t:'Laporan / Aduan',f:[['judul','Judul'],['isi','Isi','area'],['status','Status','sel:Baru,Ditindaklanjuti,Selesai']]},
 keuangan:{t:'Keuangan',f:[['ket','Keterangan'],['tipe','Jenis','sel:Pemasukan,Pengeluaran'],['nominal','Nominal (Rp)','number'],['tanggal','Tanggal','date']]}
};
/* ---------- Penyimpanan ---------- */
const KEY='saka_db';
const seed=()=>({users:[],seleksi:[],pengumuman:[],target:[],materi:[],tugas:[],jadwal:[],sekolah:[],aduan:[],keuangan:[]});
let db=(()=>{try{const d=JSON.parse(localStorage.getItem(KEY));if(d&&Array.isArray(d.users))return{...seed(),...d}}catch(e){}return seed()})();
/* ---------- Sinkron Google Sheets ---------- */
const SHEET_URL='https://script.google.com/macros/s/AKfycby4tURuI59zmJQK-_MgkzgpadCA3hivNKi-GTmJLEPRoaTEPK8KeAzoxkEBzEBzvTqx9g/exec';
let cloudOk=false,pushing=false,dirty=false,pushT=0;
function cloudPush(){
  if(!cloudOk)return;
  clearTimeout(pushT);
  pushT=setTimeout(async()=>{
    if(pushing){dirty=true;return}
    pushing=true;
    try{
      await fetch(SHEET_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify(db)});
    }catch(e){toast('Gagal sinkron ke Sheet. Cek internet.',1)}
    pushing=false;
    if(dirty){dirty=false;cloudPush()}
  },800);
}
async function cloudLoad(){
  try{
    const r=await fetch(SHEET_URL);
    const remote=await r.json();
    if(remote&&Array.isArray(remote.users)&&remote.users.length){
      db={...seed(),...remote};
      cloudOk=true;
      ensureDemo();
      try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){}
      render();
    }else{
      cloudOk=true;
      cloudPush();
    }
  }catch(e){
    toast('Sheet tidak terjangkau ('+(e&&e.message||e)+'). Data belum tersinkron.',1);
  }
}
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(db))}catch(e){toast('Penyimpanan penuh',1)}cloudPush()};
const sess=()=>sessionStorage.getItem('sid')||localStorage.getItem('sid');
const me=()=>db.users.find(u=>String(u.id)===sess());
const isStaff=u=>u&&u.role!=='calon';
const ROLE_KEYS=Object.keys(RL);
/* Siapa yang boleh edit struktur: 'semua' = seluruh panitia, atau daftar role, contoh ['ketua','sekretaris'] (admin selalu boleh) */
const STRUKTUR_EDIT='semua';
/* Satu orang boleh punya banyak bidang: u.roles = daftar semua bidang, u.role = bidang utama (pertama) */
const userRoles=u=>{if(!u)return[];const s=new Set([u.role,...(Array.isArray(u.roles)?u.roles:[])]);return ROLE_KEYS.filter(r=>s.has(r))};
const isAdmin=u=>userRoles(u).includes('admin');
const roleLabel=u=>userRoles(u).map(r=>RL[r][0]).join(' + ')||'-';
const roleChips=u=>userRoles(u).map(r=>`<span class="rchip${r==='admin'?' adm':''}">${esc(RL[r][0])}</span>`).join('')||'-';
const can=(m,u=me())=>isStaff(u)&&userRoles(u).some(r=>(ROLES[r]||[]).some(p=>p==='*'||p===m));
const canStruktur=(u=me())=>isStaff(u)&&(isAdmin(u)||STRUKTUR_EDIT==='semua'||(Array.isArray(STRUKTUR_EDIT)&&userRoles(u).some(r=>STRUKTUR_EDIT.includes(r))));
/* panitia non-admin tidak boleh mengubah akun admin & jabatannya sendiri (cegah naik hak akses sendiri) */
const canEditRoles=(a,t)=>!!a&&!!t&&canStruktur(a)&&(isAdmin(a)||(!isAdmin(t)&&a.id!==t.id));
const pwIn=(name,extra='')=>`<div class="pw"><input type="password" name="${name}" ${extra}><button type="button" class="pw-t" data-pw aria-label="Tampilkan password" aria-pressed="false"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"/><circle cx="12" cy="12" r="3"/><line class="sl" x1="3" y1="3" x2="21" y2="21"/></svg></button></div>`;
const rolePick=(sel,adm,lock)=>ROLE_KEYS.filter(r=>adm||r!=='admin').map(r=>`<label class="rp"><input type="checkbox" name="roles" value="${r}" ${sel.includes(r)?'checked':''} ${r==='admin'&&lock?'disabled':''}><span><b>${RL[r][0]}</b><small>${RL[r][1]}</small></span></label>`).join('');
const nid=a=>a.reduce((m,x)=>Math.max(m,x.id||0),0)+1;
const rp=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const dt=d=>d?new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'short',year:'numeric'}):'-';

const normHp=s=>{s=String(s||'').replace(/[\s.\-()]/g,'');if(s.startsWith('+62'))s='0'+s.slice(3);else if(s.startsWith('62'))s='0'+s.slice(2);return s};
const okHp=s=>/^08\d{8,12}$/.test(s);
const OLD_DEMO=['admin@saka.id','ketua@saka.id','sekretaris@saka.id','bendahara@saka.id','calon@saka.id'];
function ensureDemo(){let ch=0;
 /* bersihkan akun demo lama (password publik) */
 const n0=db.users.length;db.users=db.users.filter(u=>!OLD_DEMO.includes(u.email));if(db.users.length!==n0)ch=1;
 db.users.forEach(u=>{if(u.role!=='calon'&&!Array.isArray(u.roles)){u.roles=[u.role];ch=1}});
 /* akun lama berbasis email: pindahkan no HP dari data pribadi bila ada */
 db.users.forEach(u=>{if(!u.hp&&u.data&&u.data.hp&&okHp(normHp(u.data.hp))){u.hp=normHp(u.data.hp);ch=1}});
 db.users.forEach(u=>{const m={Terverifikasi:STAT[2],Seleksi:STAT[3]};if(u.role==='calon'&&m[u.status]){u.status=m[u.status];ch=1}});
db.tugas.forEach(t=>{const m={Belum:'Belum Dimulai',Proses:'Berjalan'};if(m[t.status]){t.status=m[t.status];ch=1}});
/* ---------- Seed Master Sekolah ---------- */

if(!db.schoolSeeded){

  SCH.forEach(nama=>{

    if(!db.sekolah.some(s=>s.nama===nama)){

      db.sekolah.push({
        id:nid(db.sekolah),
        nama:nama,
        alamat:'',
        kontak:'',
        pic:'',
        status:'Aktif',
        catatan:''
      });

    }

  });

  db.schoolSeeded=true;
  ch=1;
}
if(ch)save()}
ensureDemo();
function toast(m,bad){const t=$('#toast');t.textContent=m;t.className='toast show'+(bad?' bad':'');clearTimeout(t._t);t._t=setTimeout(()=>t.className='toast',2600)}
/* ---------- Helper tampilan ---------- */
const DF=['nama','tempat','lahir','sekolah','kelas','hp'];
const prog=u=>Math.round(DF.filter(k=>u.data&&u.data[k]).length/DF.length*100);
const pill=s=>`<span class="pill ${/Lulus$|Terverifikasi|Selesai|Pemasukan/.test(s)&&s!=='Tidak Lulus'?'ok':/Tidak|Pengeluaran|Baru/.test(s)?'no':''}">${esc(s)}</span>`;
function field(f,v=''){
  const [k,l,t='text']=f;
  let i;

  /* Textarea */
  if(t==='area'){
    i=`<textarea name="${k}" rows="3" required maxlength="1000">${esc(v)}</textarea>`;
  }

    else if(t==='school'){
  i=`
    <select name="${k}" required>
      <option value="">Pilih sekolah</option>
      ${schoolOptions(v)}
    </select>
  `;
    }

  /* Pilihan biasa */
  else if(t.startsWith('sel:')){
    i=`
      <select name="${k}">
        ${t.slice(4).split(',').map(o=>
          `<option ${o===v?'selected':''}>${o}</option>`
        ).join('')}
      </select>
    `;
  }

  /* PJ / Penanggung Jawab */
  else if(t==='staff'){
    const staff=db.users.filter(u=>u.role!=='calon');

    i=`
      <select name="pic" required>
        <option value="">Pilih penanggung jawab</option>
        ${
          staff.map(u=>
            `<option value="${u.id}" ${String(u.id)===String(v)?'selected':''}>
              ${esc(u.nama)} — ${esc(roleLabel(u))}
            </option>`
          ).join('')
        }
      </select>
    `;
  }

  /* Input biasa */
  else{
    i=`
      <input
        name="${k}"
        type="${t}"
        ${t==='number'?'min="0"':''}
        maxlength="200"
        required
        ${t==='url'?'pattern="https?://.+"':''}
        value="${esc(v)}"
      >
    `;
  }

  return`
    <div class="fg">
      <label>${l}</label>
      ${i}
    </div>
  `;
}
function table(head,rows,empty='Belum ada data.'){return`<div class="tw"><table><thead><tr>${head.map(h=>`<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.join('')||`<tr><td colspan="${head.length}" class="muted" style="text-align:center;padding:28px">${empty}</td></tr>`}</tbody></table></div>`}
function cell(m,x,f,ed=true){const[k,,t='']=f,v=x[k];
 if(t.startsWith('sel:'))return`<select data-set="${m}:${x.id}:${k}" ${ed?'':'disabled'}>${t.slice(4).split(',').map(o=>`<option ${o===v?'selected':''}>${o}</option>`).join('')}</select>`;
 if(k==='tautan'&&/^https?:\/\//.test(v))return`<a class="y" href="${esc(v)}" target="_blank" rel="noopener noreferrer">Buka</a>`;
 if(k==='nominal')return rp(v);if(t==='date')return dt(v);return esc(v)}
/* ---------- Halaman ---------- */
const V={};
const noAdmin=()=>!db.users.some(u=>u.role==='admin');
V.login=(q)=>`<div class="auth"><div class="box"><span class="eyebrow">${q.p?'LOGIN PETUGAS':'PORTAL CALON ANGGOTA'}</span><h1>Masuk Akun</h1><p class="muted">Masuk untuk melanjutkan.</p>
<form id="fLogin"><div class="fg"><label>No. HP</label><input type="tel" name="hp" required inputmode="numeric" autocomplete="tel" placeholder="08xxxxxxxxxx"></div>
<div class="fg"><label>Password</label>${pwIn('pw','required autocomplete="current-password"')}</div>
<label><input type="checkbox" name="ingat"> Ingat saya</label><div class="err" id="err"></div><button class="btn">Masuk</button></form>
<p class="alt">Belum punya akun? <a href="#/daftar">Daftar</a></p>
${cloudOk&&noAdmin()?'<p class="alt"><a href="#/setup">Buat akun admin pertama</a></p>':''}</div></div>`;
V.setup=()=>{
  if(!cloudOk)return`<div class="auth"><div class="box"><h1>Memuat data...</h1><p class="muted">Tunggu sebentar lalu buka lagi halaman ini. Pastikan internet aktif.</p><a class="btn" href="#/login">Ke Login</a></div></div>`;
  if(!noAdmin())return`<div class="auth"><div class="box"><h1>Tidak tersedia</h1><p class="muted">Akun admin sudah dibuat.</p><a class="btn" href="#/login">Ke Login</a></div></div>`;
  return`<div class="auth"><div class="box"><span class="eyebrow">PENGATURAN AWAL</span><h1>Buat Akun Admin</h1><p class="muted">Akun ini mengelola semua akun panitia. Pakai password yang kuat.</p>
<form id="fSetup"><div class="fg"><label>Nama Lengkap</label><input name="nama" required maxlength="80"></div>
<div class="fg"><label>No. HP</label><input type="tel" name="hp" required inputmode="numeric" placeholder="08xxxxxxxxxx"></div>
<div class="two"><div class="fg"><label>Password</label>${pwIn('pw','minlength="8" required placeholder="Min. 8 karakter" autocomplete="new-password"')}</div>
<div class="fg"><label>Konfirmasi</label>${pwIn('pw2','required autocomplete="new-password"')}</div></div>
<div class="err" id="err"></div><button class="btn">Buat Admin</button></form></div></div>`;
};
V.daftar=()=>`<div class="auth"><div class="box"><span class="eyebrow">PORTAL CALON ANGGOTA</span><h1>Buat Akun</h1><p class="muted">Buat akun untuk mulai mendaftar.</p>
<form id="fReg"><div class="fg"><label>Nama Lengkap</label><input name="nama" required maxlength="80"></div>
<div class="fg"><label>No. HP</label><input type="tel" name="hp" required inputmode="numeric" placeholder="08xxxxxxxxxx"></div>
<div class="two"><div class="fg"><label>Password</label>${pwIn('pw','minlength="8" required placeholder="Min. 8 karakter" autocomplete="new-password"')}</div>
<div class="fg"><label>Konfirmasi</label>${pwIn('pw2','required autocomplete="new-password"')}</div></div>
<label><input type="checkbox" required> Data yang saya isi benar.</label><div class="err" id="err"></div><button class="btn">Buat Akun</button></form>
<p class="alt">Sudah punya akun? <a href="#/login">Masuk</a></p></div></div>`;
const anns=n=>db.pengumuman.slice(-n).reverse().map(a=>`<div class="card"><span class="eyebrow">${dt(a.tanggal)}</span><h3>${esc(a.judul)}</h3><p class="muted">${esc(a.isi)}</p></div>`).join('')||'<div class="card muted">Belum ada pengumuman.</div>';
V.c_dash=u=>{const p=prog(u);return`<h1>Selamat datang, <em>${esc(u.nama)}</em></h1><p class="muted">Pantau proses pendaftaranmu.</p>
<div class="stats"><div class="stat"><small>STATUS</small><b style="font-size:18px">${esc(u.status)}</b></div><div class="stat"><small>KELENGKAPAN</small><b>${p}%</b></div></div>
<div class="card"><div class="bar"><i style="width:${p}%"></i></div>${p<100?'<a class="btn sm" href="#/c/data">Lengkapi Data</a>':'<span class="pill ok">Data lengkap</span>'}</div>
<h2>Pengumuman</h2>${anns(3)}
<h2 style="margin-top:20px">Kirim Laporan / Aduan</h2><div class="card"><form data-add="aduan">${field(MOD.aduan.f[0])}${field(MOD.aduan.f[1])}<button class="btn sm">Kirim</button></form></div>`};
V.c_data=u=>{const d=u.data||{};const v=k=>esc(d[k]||'');return`<h1>Lengkapi Data</h1><p class="muted">Isi data pribadimu dengan benar.</p><div class="card"><div class="bar"><i id="pb" style="width:${prog(u)}%"></i></div>
<form id="fData"><div class="fg"><label>Nama Lengkap</label><input name="nama" value="${v('nama')||esc(u.nama)}" required maxlength="80"></div>
<div class="two"><div class="fg"><label>Tempat Lahir</label><input name="tempat" value="${v('tempat')}" required></div><div class="fg"><label>Tanggal Lahir</label><input type="date" name="lahir" value="${v('lahir')}" required></div></div>
<div class="fg">
  <label>Asal Sekolah</label>
  <select name="sekolah" required>
    <option value="">Pilih sekolah</option>
    ${schoolOptions(d.sekolah)}
  </select>
</div>
<div class="fg"><label>Kelas</label><select name="kelas" required>${['','X','XI','XII','Lulusan'].map(o=>`<option ${o===d.kelas?'selected':''} value="${o}">${o||'Pilih kelas'}</option>`).join('')}</select></div>
<div class="fg"><label>No. HP</label><input type="tel" name="hp" value="${v('hp')||esc(u.hp||'')}" required placeholder="08xxxxxxxxxx"></div><div class="err" id="err"></div><button class="btn">Simpan Data</button></form></div>`};
V.c_status=u=>{const i=STAT.indexOf(u.status),bad=u.status==='Tidak Lulus';return`<h1>Status Seleksi</h1><p class="muted">Posisi kamu saat ini: ${pill(u.status)}</p><div class="card tl">${STAT.filter(s=>s!=='Tidak Lulus'||bad).map((s,n)=>`<div class="${n<i?'done':n===i?'now':''}"><b>${n+1}</b><span>${s}</span></div>`).join('')}</div>`};
/* ---------- Dashboard Helpers ---------- */

function formatDate(d){
  if(!d) return '-';

  const x=new Date(d+'T00:00:00');

  if(isNaN(x)) return d;

  return x.toLocaleDateString('id-ID',{
    day:'2-digit',
    month:'short',
    year:'numeric'
  });
}

function dashboardStatus(status){
  const map={
    'Belum Dimulai':'Belum mulai',
    'Berjalan':'Sedang berjalan',
    'Selesai':'Selesai',
    'Direncanakan':'Direncanakan',
    'Dijadwalkan':'Dijadwalkan',
    'Dibatalkan':'Dibatalkan'
  };

  return map[status]||status||'-';
}
V.p_dash=u=>{

  const calon=db.users.filter(x=>x.role==='calon');

  const tugasAktif=db.tugas.filter(
    x=>x.status!=='Selesai'
  );

  const aduanBaru=db.aduan.filter(
    x=>x.status==='Baru'
  );

  const saldo=db.keuangan.reduce(
    (s,x)=>s+(x.tipe==='Pemasukan'?1:-1)*x.nominal,
    0
  );

  /* =========================
     TUGAS SAYA
     ========================= */

  const tugasSaya=db.tugas
    .filter(x=>
      x.pjId===u.id ||
      x.pj===u.nama
    )
    .slice()
    .sort((a,b)=>
      String(a.tenggat||'').localeCompare(
        String(b.tenggat||'')
      )
    )
    .slice(0,5);

  /* =========================
     JADWAL TERDEKAT
     ========================= */

  const jadwalTerdekat=(db.jadwal||[])
    .filter(x=>x.status!=='Dibatalkan')
    .slice()
    .sort((a,b)=>
      String(a.tanggal||'').localeCompare(
        String(b.tanggal||'')
      )
    )
    .slice(0,4);

  /* =========================
     PENGUMUMAN
     ========================= */

  const pengumumanTerbaru=db.pengumuman
    .slice()
    .sort((a,b)=>
      String(b.tanggal||'').localeCompare(
        String(a.tanggal||'')
      )
    )
    .slice(0,4);

  return`

    <div class="dash-head">
      <div>
        <h1>Dashboard <em>Panitia</em></h1>
        <p class="muted">
          Selamat datang, ${esc(u.nama)} 👋
        </p>
      </div>
    </div>


    <!-- STATISTIK -->

    <div class="stats">

      <div class="stat">
        <small>PENDAFTAR</small>
        <b>${calon.length}</b>
      </div>

      <div class="stat">
        <small>TERVERIFIKASI</small>
        <b>
          ${
            calon.filter(x=>
              STAT.indexOf(x.status)>=2 &&
              x.status!=='Tidak Lulus'
            ).length
          }
        </b>
      </div>

      <div class="stat">
        <small>TUGAS AKTIF</small>
        <b>${tugasAktif.length}</b>
      </div>

      <div class="stat">
        <small>JADWAL</small>
        <b>${(db.jadwal||[]).length}</b>
      </div>

      <div class="stat">
        <small>ADUAN BARU</small>
        <b>${aduanBaru.length}</b>
      </div>

      <div class="stat">
        <small>SALDO</small>
        <b style="font-size:20px">
          ${rp(saldo)}
        </b>
      </div>

    </div>


    <!-- GRID DASHBOARD -->

    <div class="dashboard-grid">


      <!-- TUGAS SAYA -->

      <section class="card dashboard-card">

        <div class="dash-card-head">
          <div>
            <small class="eyebrow">PERSONAL</small>
            <h2>Tugas Saya</h2>
          </div>

          <a href="#/p/tugas" class="btn ghost sm">
            Lihat Semua
          </a>
        </div>

        ${
          tugasSaya.length
          ?
          `<div class="dash-list">
            ${
              tugasSaya.map(t=>`

                <div class="dash-item">

                  <div class="dash-item-main">

                    <b>${esc(t.tugas||'-')}</b>

                    <small>
                      ${esc(
                        t.divisi
                        ? RL[t.divisi]?.[0]||t.divisi
                        : ''
                      )}
                    </small>

                  </div>

                  <div class="dash-item-side">

                    <span class="status-chip">
                      ${esc(dashboardStatus(t.status))}
                    </span>

                    <small>
                      ${
                        t.tenggat
                        ? 'Deadline '+formatDate(t.tenggat)
                        : 'Tanpa deadline'
                      }
                    </small>

                  </div>

                </div>

              `).join('')
            }
          </div>`
          :
          `
          <div class="empty-dash">
            <span>✓</span>
            <b>Tidak ada tugas aktif</b>
            <small>
              Tugas yang diberikan kepada kamu akan muncul di sini.
            </small>
          </div>
          `
        }

      </section>


      <!-- JADWAL TERDEKAT -->

      <section class="card dashboard-card">

        <div class="dash-card-head">

          <div>
            <small class="eyebrow">AGENDA</small>
            <h2>Jadwal Terdekat</h2>
          </div>

          <a href="#/p/jadwal" class="btn ghost sm">
            Lihat Semua
          </a>

        </div>

        ${
          jadwalTerdekat.length
          ?
          `<div class="schedule-list">

            ${
              jadwalTerdekat.map(j=>`

                <div class="schedule-item">

                  <div class="schedule-date">
                    <b>
                      ${
                        j.tanggal
                        ? new Date(
                            j.tanggal+'T00:00:00'
                          ).toLocaleDateString(
                            'id-ID',
                            {day:'2-digit'}
                          )
                        : '--'
                      }
                    </b>

                    <small>
                      ${
                        j.tanggal
                        ? new Date(
                            j.tanggal+'T00:00:00'
                          ).toLocaleDateString(
                            'id-ID',
                            {month:'short'}
                          )
                        : ''
                      }
                    </small>

                  </div>


                  <div class="schedule-info">

                    <b>${esc(j.sekolah||'-')}</b>

                    <small>
                      🕐 ${esc(j.jam||'-')}
                      · 📍 ${esc(j.tempat||'-')}
                    </small>

                    <span>
                      ${esc(dashboardStatus(j.status))}
                    </span>

                  </div>

                </div>

              `).join('')
            }

          </div>`
          :
          `
          <div class="empty-dash">
            <span>📅</span>
            <b>Belum ada jadwal</b>
            <small>
              Jadwal sosialisasi akan muncul di sini.
            </small>
          </div>
          `
        }

      </section>


      <!-- PENGUMUMAN -->

      <section class="card dashboard-card dashboard-wide">

        <div class="dash-card-head">

          <div>
            <small class="eyebrow">INFORMASI</small>
            <h2>Pengumuman Terbaru</h2>
          </div>

          <a href="#/p/pengumuman" class="btn ghost sm">
            Semua Pengumuman
          </a>

        </div>


        ${
          pengumumanTerbaru.length
          ?
          `<div class="announcement-list">

            ${
              pengumumanTerbaru.map(p=>`

                <div class="announcement-item">

                  <div class="announcement-icon">
                    !
                  </div>

                  <div>
                    <b>${esc(p.judul||'-')}</b>

                    <p>
                      ${esc(
                        String(p.isi||'')
                        .slice(0,140)
                      )}
                      ${
                        String(p.isi||'').length>140
                        ? '...'
                        : ''
                      }
                    </p>

                    <small>
                      ${formatDate(p.tanggal)}
                    </small>

                  </div>

                </div>

              `).join('')
            }

          </div>`
          :
          `
          <div class="empty-dash">
            <span>📢</span>
            <b>Belum ada pengumuman</b>
          </div>
          `
        }

      </section>

    </div>
  `;
};
/* ---------- Data Pendaftar ---------- */
const PF={q:'',sekolah:'',status:''};
const calonAll=()=>db.users.filter(x=>x.role==='calon');
function pdFiltered(){
  const q=PF.q.trim().toLowerCase();
  return calonAll().filter(x=>{
    const text=(x.nama+' '+(x.hp||'')+' '+(x.data?.sekolah||'')).toLowerCase();
    return (!q||text.includes(q))
      &&(!PF.sekolah||(x.data?.sekolah||'')===PF.sekolah)
      &&(!PF.status||x.status===PF.status);
  });
}
function pdResults(){
  const all=calonAll(),c=pdFiltered(),ed=can('pendaftar');
  const filtering=!!(PF.q.trim()||PF.sekolah||PF.status);
  const empty=!all.length
    ?'Belum ada pendaftar. Data akan muncul setelah calon membuat akun.'
    :'Tidak ada pendaftar yang cocok dengan pencarian/filter. <button type="button" class="btn ghost sm" data-pdreset style="margin-left:6px">Reset filter</button>';
  return`
  <div class="stats">
    <div class="stat"><small>TOTAL PENDAFTAR</small><b>${all.length}</b></div>
    <div class="stat"><small>DATA LENGKAP</small><b>${all.filter(x=>prog(x)===100).length}</b></div>
    <div class="stat"><small>MENUNGGU DATA</small><b>${all.filter(x=>x.status===STAT[0]).length}</b></div>
    <div class="stat"><small>LULUS</small><b>${all.filter(x=>x.status==='Lulus').length}</b></div>
  </div>
  <p class="muted pendaftar-count">Menampilkan <b>${c.length}</b> dari <b>${all.length}</b> pendaftar${filtering?' (difilter)':''}</p>`+
  table(['Nama','No. HP','Sekolah','Kelas','Data','Status'],c.map(x=>`<tr>
    <td>${esc(x.nama)}</td><td>${esc(x.hp||'-')}</td><td>${esc(x.data?.sekolah||'-')}</td><td>${esc(x.data?.kelas||'-')}</td><td>${prog(x)}%</td>
    <td><select data-st="${x.id}" aria-label="Status ${esc(x.nama)}" ${ed?'':'disabled'}>${STAT.map(s=>`<option ${s===x.status?'selected':''}>${s}</option>`).join('')}</select></td></tr>`),empty);
}
V.p_pendaftar=u=>{
  const sekolahList=[...new Set([...schoolList(),...calonAll().map(x=>x.data?.sekolah).filter(Boolean)])].sort();
  return`<h1>Data Pendaftar</h1>${badge(can('pendaftar'))}
  <div class="card" style="margin-top:12px">
    <div class="pendaftar-tools">
      <input id="cari" type="search" placeholder="Cari nama / no. HP / sekolah" aria-label="Cari pendaftar" value="${esc(PF.q)}" maxlength="80">
      <select id="filterSekolah" aria-label="Filter sekolah"><option value="">Semua Sekolah</option>${sekolahList.map(s=>`<option value="${esc(s)}" ${s===PF.sekolah?'selected':''}>${esc(s)}</option>`).join('')}</select>
      <select id="filterStatus" aria-label="Filter status"><option value="">Semua Status</option>${STAT.map(s=>`<option value="${esc(s)}" ${s===PF.status?'selected':''}>${esc(s)}</option>`).join('')}</select>
      <button class="btn ghost sm" data-csv>Ekspor CSV</button>
    </div>
  </div>
  <div id="pdResults">${pdResults()}</div>`;
};
const badge=ed=>`<p class="mode ${ed?'edit':''}">${ed?'✎ Mode Edit':'👁 Hanya Lihat'}</p>`;
V.p_role=u=>{
 const adm=can('role'),ed=canStruktur(u),mem=r=>db.users.filter(x=>isStaff(x)&&userRoles(x).includes(r)),nb=x=>userRoles(x).filter(r=>r!=='admin').length;
 return`<h1>Struktur & Role Panitia</h1>${badge(ed)}<p class="muted">Satu orang boleh memegang lebih dari satu bidang. Hak edit tiap modul adalah gabungan dari semua bidang yang dipegang.</p>
<div class="org">${ROLE_KEYS.filter(r=>r!=='admin').map(r=>{const ms=mem(r);return`<div class="card"><b>${RL[r][0]}</b><p class="muted">${RL[r][1]}</p><small>${ms.length?ms.map(x=>esc(x.nama)+(nb(x)>1?` <span class="dbl">${nb(x)} bidang</span>`:'')).join(', '):'Belum ada anggota'}</small><div class="acc">Edit: ${ROLES[r].join(', ')}</div></div>`}).join('')}</div>`+
(adm?`<div class="card"><form data-add="panitia"><div class="two"><div class="fg"><label>Nama</label><input name="nama" required maxlength="80"></div><div class="fg"><label>No. HP</label><input type="tel" name="hp" required inputmode="numeric" placeholder="08xxxxxxxxxx"></div></div><div class="fg"><label>Password</label>${pwIn('pw','minlength="8" required autocomplete="new-password"')}</div><div class="fg"><label>Bidang / Jabatan (boleh lebih dari satu)</label><div class="rolepick">${rolePick([],true)}</div></div><button class="btn sm">Tambah Panitia</button></form></div>`:'')+
table(['Nama','No. HP','Bidang / Jabatan',''],db.users.filter(isStaff).map(x=>`<tr><td>${esc(x.nama)}</td><td>${esc(x.hp||'-')}</td><td>${roleChips(x)}</td><td style="white-space:nowrap">${canEditRoles(u,x)?`<button class="btn ghost sm" data-editr="${x.id}">Edit</button> `:''}${adm&&x.id!==u.id?`<button class="btn red sm" data-delu="${x.id}">Hapus</button>`:''}</td></tr>`))};
/* ---------- Editor Struktur (modal) ---------- */
function openRoleEditor(id){
 const a=me(),t=db.users.find(x=>x.id===id);if(!canEditRoles(a,t))return;closeRoleEditor();
 const m=document.createElement('div');m.className='modal-bg';m.id='roleModal';m.dataset.uid=id;
 m.innerHTML=`<div class="modal" role="dialog" aria-modal="true" aria-label="Edit struktur"><h2>Edit Struktur</h2><p class="muted"><b>${esc(t.nama)}</b> — centang semua bidang yang dipegang.</p><div class="rolepick">${rolePick(userRoles(t),isAdmin(a),t.id===a.id)}</div><div class="err" id="rerr"></div><div class="row" style="margin-top:12px"><button type="button" class="btn ghost sm" data-rclose>Batal</button><button type="button" class="btn sm" data-rsave>Simpan</button></div></div>`;
 document.body.appendChild(m);document.body.style.overflow='hidden';
}
function closeRoleEditor(){const m=$('#roleModal');if(m)m.remove();document.body.style.overflow=''}
function saveRoleEditor(){
 const m=$('#roleModal');if(!m)return;
 const a=me(),t=db.users.find(x=>x.id===+m.dataset.uid);if(!canEditRoles(a,t))return closeRoleEditor();
 let sel=$$('input[name=roles]:checked',m).map(i=>i.value);
 if(!isAdmin(a))sel=sel.filter(r=>r!=='admin');
 if(t.id===a.id&&isAdmin(a)&&!sel.includes('admin'))sel.push('admin');
 sel=ROLE_KEYS.filter(r=>sel.includes(r));
 if(!sel.length){$('#rerr').textContent='Pilih minimal satu bidang.';return}
 t.roles=sel;t.role=sel[0];save();closeRoleEditor();render();toast('Struktur diperbarui');
}

/* ---------- Helper Tugas ---------- */
function staffByRole(role){
  return db.users.filter(u => isStaff(u) && userRoles(u).includes(role));
}

function roleOptions(){
  return Object.keys(ROLES)
    .filter(r => r !== 'admin')
    .map(r => `<option value="${r}">${RL[r]?.[0] || r}</option>`)
    .join('');
}

function memberOptions(role){
  if(!role) return '<option value="">Pilih divisi terlebih dahulu</option>';

  const members = staffByRole(role);

  if(!members.length){
    return '<option value="">Belum ada anggota di divisi ini</option>';
  }

  return '<option value="">Pilih penanggung jawab</option>' +
    members.map(u =>
      `<option value="${u.id}">${esc(u.nama)}</option>`
    ).join('');
}

function modView(m){const M=MOD[m],items=db[m],ed=can(m);let x='';
 if(m==='keuangan')x=`<div class="stats"><div class="stat"><small>PEMASUKAN</small><b style="font-size:20px">${rp(items.filter(i=>i.tipe==='Pemasukan').reduce((s,i)=>s+i.nominal,0))}</b></div><div class="stat"><small>PENGELUARAN</small><b style="font-size:20px">${rp(items.filter(i=>i.tipe==='Pengeluaran').reduce((s,i)=>s+i.nominal,0))}</b></div></div>`;
return`<h1>${M.t}</h1>${badge(ed)}${x}`+
(ed ? `
<div class="card">
  ${
    m === 'tugas'
    ? `
      <form data-add="tugas" id="formTugas">

        <div class="fg">
          <label>Nama Tugas</label>
          <input
            name="tugas"
            placeholder="Contoh: Membuat desain poster"
            maxlength="200"
            required
          >
        </div>

        <div class="two">

          <div class="fg">
            <label>Divisi</label>
            <select name="divisi" id="tugasDivisi" required>
              <option value="">Pilih divisi</option>
              ${roleOptions()}
            </select>
          </div>

          <div class="fg">
            <label>Penanggung Jawab</label>
            <select name="pj" id="tugasPJ" required>
              <option value="">Pilih divisi terlebih dahulu</option>
            </select>
          </div>

        </div>

        <div class="two">

          <div class="fg">
            <label>Tenggat</label>
            <input type="date" name="tenggat" required>
          </div>

          <div class="fg">
            <label>Status</label>
            <select name="status">
              <option>Belum Dimulai</option>
              <option>Berjalan</option>
              <option>Selesai</option>
            </select>
          </div>

        </div>

        <button class="btn sm" type="submit">
          + Tambah Tugas
        </button>

      </form>
    `
    : `
      <form data-add="${m}">
        <div class="two">
          ${M.f.map(f=>field(f)).join('')}
        </div>
        <button class="btn sm">Tambah</button>
      </form>
    `
  }
</div>
` : '') +
  
 table([...M.f.map(f=>f[1].replace(/ \(.*/,'')),...(ed?['']:[])],items.map(i=>`<tr>${M.f.map(f=>`<td>${cell(m,i,f,ed)}</td>`).join('')}${ed?`<td><button class="btn red sm" data-del="${m}:${i.id}">Hapus</button></td>`:''}</tr>`))}
const _cs=V.c_status;V.c_status=u=>_cs(u)+'<h2 style="margin-top:20px">Jadwal Seleksi</h2>'+table(['Tahap','Tanggal','Tempat'],db.seleksi.map(s=>`<tr><td>${esc(s.tahap)}</td><td>${dt(s.tanggal)}</td><td>${esc(s.tempat)}</td></tr>`),'Jadwal seleksi belum diumumkan panitia.');
/* ---------- Router & shell ---------- */
function shell(u,items,body,cur){return`<div class="top"><a class="brand" href="#/">${LOGO}<div><strong>SAKA BHAYANGKARA</strong></div></a><button class="burger" style="display:block" id="sb" aria-label="Buka menu" aria-controls="side" aria-expanded="false">${'<i></i>'.repeat(3)}</button></div>
<div class="scrim" id="scrim"></div>
<div class="shell"><aside class="side" id="side"><a class="brand" href="#/">${LOGO}<div><span>${isStaff(u)?'PANEL PANITIA':'PORTAL CALON'}</span><strong>SAKA BHAYANGKARA</strong></div></a>
${items.map(([h,l])=>`<a href="#/${h}" class="${h===cur?'on':''}">${l}</a>`).join('')}<button class="out" id="logout">↪ Keluar</button></aside><main class="main">${body}</main></div>`}
function render0(){
 const[path,qs]=(location.hash.slice(2)||'').split('?'),q=Object.fromEntries(new URLSearchParams(qs||'')),u=me(),L=$('#landing'),A=$('#app'),T=$('#topbar');
 $('#navLinks').classList.remove('open');
 const pub=!path||['tentang','alur','sekolah','pengumuman','status'].includes(path),auth=['login','daftar','setup'].includes(path);
 if(pub){A.hidden=true;L.hidden=false;T.hidden=false;
  $('#pubAnn').innerHTML=anns(3);$('#pubStatus').textContent=u?`Halo ${u.nama}, kamu sudah masuk.`:'Silakan masuk untuk melihat status pendaftaranmu.';
  $('#pubStatusBtn').innerHTML=u?`<a class="btn" href="#/${isStaff(u)?'p/dashboard':'c/dashboard'}">Buka Dashboard</a>`:'<a class="btn" href="#/login">Masuk Akun</a><a class="btn ghost" href="#/daftar">Daftar Akun</a>';
  if(path)setTimeout(()=>document.getElementById(path)?.scrollIntoView(),0);else scrollTo(0,0);return}
 L.hidden=true;A.hidden=false;
 if(auth){if(u)return location.hash=isStaff(u)?'#/p/dashboard':'#/c/dashboard';T.hidden=false;A.innerHTML=V[path](q);return}
 T.hidden=true;
 if(!u)return location.hash='#/login';
 const[area,page='dashboard']=path.split('/');
 if(area==='c'&&!isStaff(u)){A.innerHTML=shell(u,[['c/dashboard','⌂ Dashboard'],['c/data','◉ Lengkapi Data'],['c/status','✓ Status Seleksi']],(V['c_'+page]||V.c_dash)(u),path);return}
 if(area==='p'&&isStaff(u)){
  const nav=[['p/dashboard','⌂ Dashboard'],...[['pendaftar','Data Pendaftar'],['seleksi','Jadwal Seleksi'],['pengumuman','Pengumuman'],['target','Target Sosialisasi'],['materi','Materi Sosialisasi'],['tugas','Tugas & Tanggung Jawab'],['jadwal','Jadwal Sosialisasi'],['sekolah','Master Data Sekolah'],['aduan','Laporan / Aduan'],['keuangan','Keuangan'],['role','Struktur & Role']].map(([m,l])=>['p/'+m,l])];
  let body;if(page==='dashboard')body=V.p_dash(u);else body=page==='pendaftar'?V.p_pendaftar(u):page==='role'?V.p_role(u):MOD[page]?modView(page):V.p_dash(u);
  A.innerHTML=shell(u,nav,body,path);return}
 location.hash=isStaff(u)?'#/p/dashboard':'#/c/dashboard';
}
/* ---------- Event ---------- */
const go=u=>{location.hash=isStaff(u)?'#/p/dashboard':'#/c/dashboard'};
let fails=0,lock=0;
document.addEventListener('submit',e=>{const f=e.target;e.preventDefault();const d=Object.fromEntries(new FormData(f)),er=$('#err');
 if(f.id==='fLogin'){if(Date.now()<lock)return er.textContent='Terlalu banyak percobaan. Coba lagi sebentar.';
  const u=db.users.find(x=>x.hp&&x.hp===normHp(d.hp)&&x.pw===hash(d.pw));
  if(!u){if(++fails>=5){lock=Date.now()+30000;fails=0}return er.textContent='No. HP atau password salah.'}
  fails=0;sessionStorage.removeItem('sid');localStorage.removeItem('sid');(d.ingat?localStorage:sessionStorage).setItem('sid',u.id);go(u)}
 else if(f.id==='fSetup'){
  if(!cloudOk||!noAdmin())return er.textContent='Pengaturan awal tidak tersedia.';
  const hp=normHp(d.hp);
  if(d.nama.trim().length<3)return er.textContent='Nama minimal 3 karakter.';
  if(!okHp(hp))return er.textContent='No. HP tidak valid. Contoh: 081234567890';
  if(d.pw.length<8)return er.textContent='Password minimal 8 karakter.';
  if(d.pw!==d.pw2)return er.textContent='Konfirmasi password tidak sama.';
  if(db.users.some(x=>x.hp===hp))return er.textContent='No. HP sudah terdaftar.';
  const u={id:nid(db.users),nama:d.nama.trim(),hp,pw:hash(d.pw),role:'admin'};db.users.push(u);save();
  sessionStorage.setItem('sid',u.id);toast('Akun admin dibuat');go(u)}
 else if(f.id==='fReg'){const hp=normHp(d.hp);
  if(d.nama.trim().length<3)return er.textContent='Nama minimal 3 karakter.';
  if(!okHp(hp))return er.textContent='No. HP tidak valid. Contoh: 081234567890';
  if(d.pw.length<8)return er.textContent='Password minimal 8 karakter.';
  if(d.pw!==d.pw2)return er.textContent='Konfirmasi password tidak sama.';
  if(db.users.some(x=>x.hp===hp))return er.textContent='No. HP sudah terdaftar.';
  const u={id:nid(db.users),nama:d.nama.trim(),hp,pw:hash(d.pw),role:'calon',status:STAT[0],data:{}};db.users.push(u);save();sessionStorage.setItem('sid',u.id);toast('Akun berhasil dibuat');location.hash='#/c/data'}
 else if(f.id==='fData'){if(!/^(\+62|62|0)8\d{8,12}$/.test(d.hp.replace(/[\s-]/g,'')))return er.textContent='Nomor HP tidak valid.';
  if(new Date(d.lahir)>new Date())return er.textContent='Tanggal lahir tidak valid.';
  const u=me();u.data={...d};if(u.status===STAT[0])u.status=STAT[1];save();toast('Data berhasil disimpan');location.hash='#/c/dashboard'}
 else if(f.dataset.add==='panitia'){if(!can('role'))return;const hp=normHp(d.hp);if(!okHp(hp))return toast('No. HP tidak valid',1);if(db.users.some(x=>x.hp===hp))return toast('No. HP sudah terdaftar',1);
  const rs=ROLE_KEYS.filter(r=>new FormData(f).getAll('roles').includes(r));if(!rs.length)return toast('Pilih minimal satu bidang',1);
  db.users.push({id:nid(db.users),nama:d.nama.trim(),hp,pw:hash(d.pw),role:rs[0],roles:rs});save();render();toast('Panitia ditambahkan')}
else if(f.dataset.add){
  const m=f.dataset.add;

  if(m!=='aduan'&&!can(m))return;

  // TUGAS
  if(m==='tugas'){
    const pj=db.users.find(u=>u.id===+d.pj);

    if(!pj){
      return toast('Penanggung jawab tidak valid',1);
    }

    d.pjId=pj.id;
    d.pj=pj.nama;
    if(!userRoles(pj).includes(d.divisi))return toast('Penanggung jawab bukan anggota divisi ini',1);
  }

  // JADWAL

  if(m==='jadwal'){
  const pj=db.users.find(u=>u.id===+d.pic);

  if(!pj){
    return toast('Penanggung jawab belum dipilih',1);
  }

  d.picId=pj.id;
  d.pic=pj.nama;
  d.picRole=roleLabel(pj);
  }

  // ADUAN
  if(m==='aduan'&&!isStaff(me())){
    d.status='Baru';
  }

  // VALIDASI
  for(const k in d){if(typeof d[k]==='string')d[k]=d[k].trim()}
  if(Object.values(d).some(v=>v===''))return toast('Semua kolom wajib diisi',1);

  // SIMPAN DATA
  const x={
    id:nid(db[m]),
    ...d
  };

  if(x.nominal!==undefined){
    x.nominal=+x.nominal||0;
  }

  if(m==='aduan'&&!x.status){
    x.status='Baru';
  }

  if(m==='pengumuman'){
    x.tanggal=x.tanggal||new Date().toISOString().slice(0,10);
  }

  db[m].push(x);
  save();

  f.reset();

  toast('Berhasil disimpan');

  if(isStaff(me())){
    render();
  }
}
});
function setNav(open){
 const sd=$('#side'),sc=$('#scrim'),b=$('#sb');
 if(!sd)return;
 sd.classList.toggle('open',open);
 if(sc)sc.classList.toggle('show',open);
 if(b){b.setAttribute('aria-expanded',open);b.setAttribute('aria-label',open?'Tutup menu':'Buka menu')}
 document.body.classList.toggle('nav-open',open);
}
document.addEventListener('click',e=>{if(e.target.id==='scrim')setNav(false);if(e.target.id==='roleModal')closeRoleEditor()});
document.addEventListener('mousedown',e=>{if(e.target.closest('[data-pw]'))e.preventDefault()});
document.addEventListener('click',e=>{const b=e.target.closest('[data-pw]');if(!b)return;const i=b.parentElement.querySelector('input');if(!i)return;const show=i.type==='password';i.type=show?'text':'password';b.classList.toggle('on',show);b.setAttribute('aria-pressed',show);b.setAttribute('aria-label',show?'Sembunyikan password':'Tampilkan password')});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){setNav(false);closeRoleEditor()}});
window.addEventListener('resize',()=>{if(innerWidth>900)setNav(false)});
document.addEventListener('click',e=>{const t=e.target.closest('button,a,i');if(!t)return;const u=me();
 if(t.dataset.pdreset!==undefined){PF.q=PF.sekolah=PF.status='';render()}
 if(t.id==='burger'||t.parentElement?.id==='burger')$('#navLinks').classList.toggle('open');
 if(t.id==='sb'||t.parentElement?.id==='sb')setNav(!$('#side')?.classList.contains('open'));
 if(t.closest('.side a'))setNav(false);
 if(t.dataset.editr)openRoleEditor(+t.dataset.editr);
 if(t.dataset.rclose!==undefined)closeRoleEditor();
 if(t.dataset.rsave!==undefined)saveRoleEditor();
 if(t.id==='logout'){sessionStorage.removeItem('sid');localStorage.removeItem('sid');location.hash='#/'}
 if(t.dataset.del){const[m,id]=t.dataset.del.split(':');if(can(m)&&confirm('Hapus data ini?')){db[m]=db[m].filter(x=>x.id!==+id);save();render()}}
 if(t.dataset.delu&&can('role')&&confirm('Hapus akun panitia ini?')){db.users=db.users.filter(x=>x.id!==+t.dataset.delu);save();render()}
 if(t.dataset.csv!==undefined&&isStaff(u)){const c=s=>'"'+(/^[=+\-@]/.test(s)?"'":'')+String(s??'').replace(/"/g,'""')+'"';
  const r=[['Nama','No. HP','Sekolah','Kelas','Status'],...pdFiltered().map(x=>[x.nama,x.hp,x.data?.sekolah,x.data?.kelas,x.status])].map(r=>r.map(c).join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+r],{type:'text/csv'}));a.download='pendaftar-saka.csv';a.click()}});
document.addEventListener('change',e=>{const t=e.target,u=me();

if(t.id==='tugasDivisi'){
  const pj=$('#tugasPJ');

  if(pj){
    pj.innerHTML=memberOptions(t.value);
  }

  return;
}

if(t.id==='filterSekolah'||t.id==='filterStatus'){
  if(t.id==='filterSekolah')PF.sekolah=t.value;else PF.status=t.value;
  $('#pdResults').innerHTML=pdResults();
  return;
}
 if(t.dataset.st&&can('pendaftar')){db.users.find(x=>x.id===+t.dataset.st).status=t.value;save();toast('Status diperbarui');if($('#pdResults'))$('#pdResults').innerHTML=pdResults()}
 if(t.dataset.set){const[m,id,k]=t.dataset.set.split(':');if(can(m)||(m==='aduan'&&can('aduan'))){db[m].find(x=>x.id===+id)[k]=t.value;save();toast('Diperbarui')}}});
document.addEventListener('input',e=>{const t=e.target;
if(t.id==='cari'){
 PF.q=t.value;
 $('#pdResults').innerHTML=pdResults();
}
 if(t.closest('#fData')){const f=$('#fData');$('#pb').style.width=Math.round(DF.filter(k=>f.elements[k].value.trim()).length/DF.length*100)+'%'}});
/* ---------- Init ---------- */
$('#alurList').innerHTML=ALUR.map((a,i)=>`<div class="card step"><div class="num">0${i+1}</div><div><h3>${a[0]}</h3><p class="muted">${a[1]}</p></div></div>`).join('');
$('#pubAnn').innerHTML=anns(3);
$$('img.lg').forEach(i=>i.onerror=()=>i.style.display='none');
window.addEventListener('hashchange',render);
window.addEventListener('load',()=>{setTimeout(()=>$('#opening').classList.add('hide'),1600)});
$('#sekolahList').innerHTML=SCH.map(s=>`<span class="chip">🏫 ${s}</span>`).join('');
/* ---------- Efek ---------- */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.1});
function fx(){$$('.stat b').forEach(b=>{const t=b.textContent.trim();if(!/^\d+$/.test(t))return;const n=+t,s=performance.now();(function f(now){const p=Math.min((now-s)/900,1);b.textContent=Math.round(n*p);if(p<1)requestAnimationFrame(f)})(s)});
 $$('#landing .sec>*,#landing .card,#landing .chip').forEach(el=>{if(!el.classList.contains('rv')){el.classList.add('rv');io.observe(el)}})}
function render(){render0();fx();document.body.classList.remove('nav-open')}
render();
cloudLoad();
