'use client';

import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, Link } from '../utils/inertia-compat';
import { CalendarIcon, MapPinIcon, UsersIcon, ClockIcon, ArrowLeftIcon, BoltIcon } from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { useState } from 'react';

const ACCENTS = [
    { bg: '#2AAF15', btn: '#2AAF15', bar: '#33CC00', tag: '#33CC00', tagText: '#000' },
    { bg: '#003300', btn: '#003300', bar: '#2AAF15', tag: '#2AAF15', tagText: '#000' },
    { bg: '#33CC00', btn: '#33CC00', bar: '#003300', tag: '#003300', tagText: '#fff' },
    { bg: '#2AAF15', btn: '#003300', bar: '#33CC00', tag: '#33CC00', tagText: '#000' },
    { bg: '#003300', btn: '#2AAF15', bar: '#33CC00', tag: '#33CC00', tagText: '#000' },
];

const STATUS_CFG = {
    PUBLISHED: { color: '#4ade80', textColor: '#000', label: 'Open Now'  },
    DRAFT:     { color: '#e2e8f0', textColor: '#000', label: 'Draft'     },
    CLOSED:    { color: '#f87171', textColor: '#fff', label: 'Closed'    },
};

const CSS = `
    @import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@400;600;700&display=swap');
    body { background-color: #FEFEFE; }
    .font-fredoka { font-family: 'Fredoka', sans-serif; }
    .b-border    { border: 3px solid #1a1a1a; }
    .b-shadow    { box-shadow: 8px 8px 0px #1a1a1a; }
    .b-shadow-sm { box-shadow: 4px 4px 0px #1a1a1a; }
    .b-btn       { box-shadow: 4px 4px 0px #1a1a1a; transition: all 0.1s; }
    .b-btn:hover { transform: translate(-1px,-1px); box-shadow: 6px 6px 0px #1a1a1a; }
    .b-btn:active { transform: translate(2px,2px); box-shadow: 0px 0px 0px #1a1a1a; }
    .bg-dots { background-image: radial-gradient(#1a1a1a 1.5px, transparent 1.5px); background-size: 24px 24px; opacity: 0.05; pointer-events: none; }
    @keyframes heroIn  { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
    @keyframes slideIn { from{opacity:0;transform:translateX(18px)}  to{opacity:1;transform:translateX(0)} }
    @keyframes popIn   { 0%{transform:scale(0.5) rotate(-8deg);opacity:0} 65%{transform:scale(1.15)} 100%{transform:scale(1);opacity:1} }
    @keyframes bar     { from{width:0} }
    .sh-heroIn  { animation: heroIn  0.55s cubic-bezier(.22,1,.36,1) both }
    .sh-fadeUp  { animation: fadeUp  0.5s  cubic-bezier(.22,1,.36,1) 0.06s both }
    .sh-slideIn { animation: slideIn 0.45s cubic-bezier(.22,1,.36,1) both }
    .sh-popIn   { animation: popIn   0.6s  cubic-bezier(.34,1.56,.64,1) both }
    .sh-bar     { animation: bar     1.2s  ease both }
`;

export default function ShowEvent({ auth, event, remainingQuota, canRegister, eventId }) {
    const [step, setStep] = useState('detail');
    const [formData, setFormData] = useState({
        nama: '',
        nim: '',
        email: '',
        no_wa: '',
        jurusan: '',
        angkatan: '',
        role: 'PESERTA',
    });
    const [errors, setErrors] = useState({});
    const [processing, setProcessing] = useState(false);
    
    const isAuthenticated = !!auth.user;
    const isAdmin    = auth.user?.role === 'admin';
    const eventDate  = new Date(event.tanggal);
    const isUpcoming = eventDate > new Date();
    const filled     = event._count?.participants || 0;
    const fillPct    = Math.min(Math.round((filled / event.kapasitas) * 100), 100);
    const acc        = ACCENTS[(event.id || 0) % ACCENTS.length];
    const status     = STATUS_CFG[event.status] || STATUS_CFG.DRAFT;

    const handleInputChange = (key, value) => {
        setFormData(prev => ({ ...prev, [key]: value }));
        if (errors[key]) {
            setErrors(prev => ({ ...prev, [key]: '' }));
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        const newErrors = {};
        if (!formData.nama) newErrors.nama = 'Nama lengkap harus diisi';
        if (!formData.nim) newErrors.nim = 'NIM harus diisi';
        if (!formData.email) newErrors.email = 'Email harus diisi';
        if (!formData.no_wa) newErrors.no_wa = 'WhatsApp harus diisi';
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setProcessing(true);
        try {
            const response = await fetch('/api/participants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nama: formData.nama,
                    nim: formData.nim,
                    email: formData.email,
                    no_wa: formData.no_wa,
                    jurusan: formData.jurusan || 'Tidak disebutkan',
                    angkatan: formData.angkatan || 'Tidak disebutkan',
                    role: formData.role || 'PESERTA',
                    status: 'terdaftar',
                    eventId: eventId,
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Gagal mendaftar');
            }

            setStep('success');
            setFormData({
                nama: '',
                nim: '',
                email: '',
                no_wa: '',
                jurusan: '',
                angkatan: '',
                role: 'PESERTA',
                angkatan: '',
            });
        } catch (error) {
            setErrors({ submit: error.message });
        } finally {
            setProcessing(false);
        }
    };

    const formFields = [
        { key: 'nama',     label: 'Nama Lengkap', placeholder: 'Nama lengkap kamu', type: 'text',  required: true  },
        { key: 'nim',      label: 'NIM',          placeholder: '2101001234',         type: 'text',  required: true  },
        { key: 'email',    label: 'Email',        placeholder: 'nama@email.com',     type: 'email', required: true  },
        { key: 'no_wa',    label: 'WhatsApp',     placeholder: '081234567890',       type: 'tel',   required: true  },
        { key: 'jurusan',  label: 'Jurusan',      placeholder: 'Teknik Informatika', type: 'text',  required: false },
        { key: 'angkatan', label: 'Angkatan',     placeholder: '2021',               type: 'text',  required: false },
        { key: 'role',     label: 'Mendaftar Sebagai', placeholder: '',                type: 'select', required: true, options: [
            { value: 'PESERTA', label: '🎓 Peserta' },
            { value: 'DOSEN', label: '👨‍🏫 Dosen' },
            { value: 'PANITIA', label: '👔 Panitia' },
        ]},
    ];

    /* render fn, not component  avoids input remount on typing */
    const renderSidebar = () => {

        /* SUCCESS */
        if (step === 'success') return (
            <div className="bg-white b-border b-shadow overflow-hidden rounded-[2rem] sh-slideIn">
                <div className="relative px-6 py-10 text-center overflow-hidden" style={{ background: acc.bg }}>
                    <div className="font-fredoka absolute right-3 -bottom-4 font-bold text-white/10 leading-none text-[120px] select-none pointer-events-none"></div>
                    <div className="relative">
                        <div className="w-[72px] h-[72px] bg-white b-border flex items-center justify-center mx-auto mb-4 rounded-2xl sh-popIn" style={{ boxShadow: '4px 4px 0 #1a1a1a' }}>
                            <CheckBadgeIcon className="w-9 h-9" style={{ color: acc.bg }} />
                        </div>
                        <h3 className="font-fredoka text-2xl font-bold text-white mb-1" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>Berhasil! </h3>
                        <p className="text-white/70 text-sm font-bold">Kamu sudah terdaftar!</p>
                    </div>
                </div>

                {/* ticket notch */}
                <div className="relative h-0">
                    <div className="absolute -left-3.5 -top-3.5 w-7 h-7 rounded-full b-border" style={{ background: '#FEFEFE' }} />
                    <div className="absolute -right-3.5 -top-3.5 w-7 h-7 rounded-full b-border" style={{ background: '#FEFEFE' }} />
                </div>

                <div className="px-5 pt-5 pb-5 space-y-3">
                    <div className="border-t-2 border-dashed border-slate-300 mb-1" />
                    <div className="p-4 bg-slate-50 b-border rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Event</p>
                        <p className="text-sm font-black text-slate-900 leading-snug">{event.nama_event}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        {[
                            { label: 'Tanggal', val: eventDate.toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }) },
                            { label: 'Waktu',  val: `${event.jam_mulai}-${event.jam_berakhir}` },
                            { label: 'Lokasi',  val: event.lokasi, trunc: true },
                        ].map(({ label, val, trunc }) => (
                            <div key={label} className="p-3 bg-slate-50 b-border rounded-xl">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
                                <p className={`text-xs font-black text-slate-800 ${trunc ? 'truncate' : ''}`}>{val}</p>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2.5 bg-green-50 b-border rounded-2xl px-4 py-3">
                        <span></span>
                        <p className="text-xs font-black text-green-700">Konfirmasi dikirim ke email kamu</p>
                    </div>
                    <Link href="/events"
                        className="b-btn b-border flex items-center justify-center w-full gap-2 py-3.5 text-sm font-black text-white rounded-2xl uppercase tracking-widest"
                        style={{ background: '#1a1a1a' }}>
                        Lihat Event Lainnya 
                    </Link>
                </div>
            </div>
        );

        /* FORM */
        if (step === 'form') return (
            <div className="bg-white b-border b-shadow overflow-hidden rounded-[2rem] sh-slideIn">
                <div className="relative px-5 py-5 overflow-hidden" style={{ background: acc.bg }}>
                    <div className="font-fredoka absolute right-2 -bottom-3 font-bold text-white/10 leading-none text-[80px] select-none pointer-events-none">
                        {event.nama_event.charAt(0)}
                    </div>
                    <div className="relative">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-0.5">Formulir Pendaftaran</p>
                        <h3 className="font-fredoka text-xl font-bold text-white leading-tight line-clamp-1" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.2)' }}>
                            {event.nama_event}
                        </h3>
                    </div>
                </div>

                <form onSubmit={handleRegister} className="p-5">
                    {errors.submit && <div className="mb-4 p-3 bg-red-100 border-2 border-red-500 rounded-lg text-red-700 text-sm font-bold">{errors.submit}</div>}
                    <div className="space-y-3">
                        {formFields.map(({ key, label, placeholder, type, required, options }) => (
                            <div key={key}>
                                <label className="block text-[11px] font-black text-slate-600 uppercase tracking-wider mb-1.5">
                                    {label}{required && <span className="text-red-500 ml-0.5">*</span>}
                                </label>
                                {type === 'select' ? (
                                    <select value={formData[key]} onChange={e => handleInputChange(key, e.target.value)}
                                        required={required}
                                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold focus:outline-none transition-all b-border ${errors[key] ? 'bg-red-50 text-red-900' : 'bg-white text-slate-900'}`}
                                        style={{ boxShadow: errors[key] ? '3px 3px 0 #f87171' : '3px 3px 0 #1a1a1a' }}>
                                        {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                    </select>
                                ) : (
                                    <input type={type} value={formData[key]} onChange={e => handleInputChange(key, e.target.value)}
                                        placeholder={placeholder} required={required}
                                        className={`w-full px-3.5 py-2.5 rounded-xl text-sm font-bold placeholder-slate-300 focus:outline-none transition-all b-border ${errors[key] ? 'bg-red-50 text-red-900' : 'bg-white text-slate-900'}`}
                                        style={{ boxShadow: errors[key] ? '3px 3px 0 #f87171' : '3px 3px 0 #1a1a1a' }} />
                                )}
                                {errors[key] && <p className="text-[11px] text-red-500 mt-1 font-black">{errors[key]}</p>}
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-2">
                        <button type="submit" disabled={processing}
                            className="b-btn b-border w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-50 uppercase tracking-widest"
                            style={{ background: acc.btn }}>
                            {processing
                                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Mendaftar...</>
                                : <><CheckBadgeIcon className="w-4 h-4" />Konfirmasi Pendaftaran</>}
                        </button>
                        <button type="button" onClick={() => setStep('detail')}
                            className="b-btn b-border w-full py-3 rounded-2xl text-sm font-black text-slate-700 bg-white uppercase tracking-widest">
                             Kembali
                        </button>
                    </div>
                </form>
            </div>
        );

        /* DETAIL */
        return (
            <div className="bg-white b-border b-shadow overflow-hidden rounded-[2rem] sh-slideIn">
                {/* price header */}
                <div className="relative px-5 py-6 overflow-hidden" style={{ background: acc.bg }}>
                    <div className="font-fredoka absolute right-2 -bottom-4 font-bold text-white/10 leading-none text-[100px] select-none pointer-events-none"></div>
                    <div className="relative">
                        <p className="text-white/60 text-[10px] font-black uppercase tracking-widest mb-2">Akses Event</p>
                        <div className="flex items-end justify-between gap-3">
                            <span className="font-fredoka text-5xl font-bold text-white" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.2)' }}>GRATIS</span>
                            <span className="b-border text-[10px] bg-white text-black px-3 py-1.5 rounded-full font-black uppercase tracking-wide" style={{ boxShadow: '2px 2px 0 #1a1a1a' }}>
                                HIMTI Event
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-4 space-y-3">
                    {/* meta */}
                    {[
                        { Icon: CalendarIcon, label: 'Tanggal',  val: eventDate.toLocaleDateString('id-ID', { dateStyle:'long' }) },
                        { Icon: ClockIcon, label: 'Waktu',  val: `${event.jam_mulai} - ${event.jam_berakhir}` },
                        { Icon: MapPinIcon,   label: 'Lokasi', val: event.lokasi, trunc: true },
                    ].map(({ Icon, label, val, trunc }) => (
                        <div key={label} className="flex items-center gap-3 p-3 b-border rounded-2xl bg-white">
                            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 b-border"
                                style={{ background: acc.tag, boxShadow: '2px 2px 0 #1a1a1a' }}>
                                <Icon className="w-4 h-4" style={{ color: acc.tagText === '#fff' ? '#fff' : '#1a1a1a' }} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                <p className={`text-xs font-black text-slate-900 mt-0.5 ${trunc ? 'truncate' : ''}`}>{val}</p>
                            </div>
                        </div>
                    ))}

                    {/* quota */}
                    <div className="p-4 b-border rounded-2xl bg-white">
                        <div className="flex justify-between items-center mb-2.5">
                            <span className="flex items-center gap-1.5 text-xs font-black text-slate-700">
                                <UsersIcon className="w-3.5 h-3.5" /> {filled} peserta
                            </span>
                            <span className={`text-xs font-black ${remainingQuota <= 10 ? 'text-red-500' : 'text-slate-500'}`}>
                                {remainingQuota === 0 ? 'PENUH' : `${remainingQuota} sisa`}
                            </span>
                        </div>
                        <div className="relative h-4 w-full bg-slate-100 b-border rounded-full overflow-hidden">
                            <div className="sh-bar absolute top-0 left-0 h-full rounded-full border-r-2 border-black"
                                style={{ width: `${fillPct}%`, background: fillPct >= 80 ? '#f87171' : acc.bar }} />
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1.5 text-right font-black">{fillPct}% dari {event.kapasitas} kursi</p>
                    </div>

                    {/* CTA */}
                    {!isAdmin && canRegister && (
                        <button onClick={() => setStep('form')}
                            className="b-btn b-border w-full py-4 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 uppercase tracking-widest"
                            style={{ background: acc.btn }}>
                             Bergabunglah Sekarang!
                        </button>
                    )}
                    {!isAdmin && !canRegister && (
                        <div className="w-full py-4 b-border text-sm font-black text-center rounded-2xl bg-slate-100 text-slate-400 cursor-not-allowed">
                            {remainingQuota === 0 ? ' Pendaftaran Penuh' : ' Pendaftaran Ditutup'}
                        </div>
                    )}
                    {isAdmin && (
                        <Link href={`/events/${event.id}/participants`}
                            className="b-btn b-border flex items-center justify-center w-full gap-2 py-4 rounded-2xl font-black text-sm text-white uppercase tracking-widest"
                            style={{ background: acc.btn }}>
                            <UsersIcon className="w-4 h-4" strokeWidth={3} /> Kelola Peserta
                        </Link>
                    )}

                    <p className="text-[11px] text-center text-slate-400 font-black uppercase tracking-wider">
                        Event HIMTI  Terbuka Umum  Email Konfirmasi
                    </p>
                </div>
            </div>
        );
    };

    const pageBody = (
        <div className="min-h-screen" style={{ background: '#FEFEFE' }}>
            <style>{CSS}</style>
            <div className="fixed inset-0 bg-dots" />

            {/* Hero */}
            <div className="relative overflow-hidden" style={{ background: acc.bg, minHeight: '300px' }}>
                {event.poster && (
                    <img src={`/storage/${event.poster}`} alt={event.nama_event}
                        className="absolute inset-0 w-full h-full object-cover" style={{ opacity: 0.08 }} />
                )}
                {/* big letter bg */}
                <div className="font-fredoka absolute right-6 -bottom-6 font-bold text-white/10 leading-none select-none pointer-events-none"
                    style={{ fontSize: 'clamp(8rem, 25vw, 20rem)' }}>
                    {event.nama_event.charAt(0)}
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sh-heroIn"
                    style={{ minHeight: '300px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                    <Link href="/events"
                        className="b-btn b-border inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-2xl text-sm font-black w-fit uppercase tracking-wider">
                        <ArrowLeftIcon className="w-3.5 h-3.5" strokeWidth={3} />
                        Kembali ke Event
                    </Link>

                    <div className="mt-10">
                        <div className="flex flex-wrap items-center gap-2 mb-5">
                            <span className="b-border text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider"
                                style={{ background: status.color, color: status.textColor, boxShadow: '2px 2px 0 #1a1a1a' }}>
                                {status.label}
                            </span>
                            {isUpcoming && (
                                <span className="b-border text-[11px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider bg-white text-black"
                                    style={{ boxShadow: '2px 2px 0 #1a1a1a' }}>
                                     Segera Hadir
                                </span>
                            )}
                        </div>

                        <h1 className="font-fredoka font-bold text-white mb-6 leading-none max-w-3xl"
                            style={{ fontSize: 'clamp(2rem, 5vw, 4rem)', textShadow: '4px 4px 0 rgba(0,0,0,0.25)' }}>
                            {event.nama_event}
                        </h1>

                        <div className="flex flex-wrap gap-2">
                            {[
                                { icon: '', text: eventDate.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
                                { icon: '', text: event.lokasi },
                                { icon: '', text: `${filled}/${event.kapasitas} pendaftar` },
                            ].map(({ icon, text }) => (
                                <span key={text} className="inline-flex items-center gap-2 bg-black/20 text-white text-[12px] font-black px-3.5 py-1.5 rounded-2xl backdrop-blur-sm">
                                    {icon} {text}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10 sh-fadeUp">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

                    <div className="lg:col-span-2 space-y-5">

                        {/* About */}
                        <div className="bg-white b-border b-shadow-sm overflow-hidden rounded-[2rem]">
                            <div className="px-6 py-4 border-b-3 flex items-center gap-3" style={{ borderBottom: '3px solid #1a1a1a' }}>
                                <div className="w-3 h-6 rounded-sm" style={{ background: acc.bg }} />
                                <h2 className="font-fredoka text-xl font-bold text-slate-900 uppercase tracking-wide">Tentang Event</h2>
                            </div>
                            <div className="px-6 py-6">
                                <p className="text-slate-600 leading-relaxed whitespace-pre-line text-[14px] sm:text-[15px] font-medium">
                                    {event.deskripsi}
                                </p>
                            </div>
                        </div>

                        {/* Info Grid */}
                        <div className="bg-white b-border b-shadow-sm overflow-hidden rounded-[2rem]">
                            <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '3px solid #1a1a1a' }}>
                                <div className="w-3 h-6 rounded-sm" style={{ background: acc.bar }} />
                                <h2 className="font-fredoka text-xl font-bold text-slate-900 uppercase tracking-wide">Informasi Event</h2>
                            </div>
                            <div className="px-6 py-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {[
                                    { icon: '', label: 'Tanggal', val: eventDate.toLocaleDateString('id-ID', { weekday:'long', day:'numeric', month:'long', year:'numeric' }) },
                                    { icon: '', label: 'Waktu', val: `${event.jam_mulai} - ${event.jam_berakhir} WIB` },
                                    { icon: '', label: 'Lokasi',          val: event.lokasi },
                                    { icon: '', label: 'Daftar Ulang',    val: `${filled} dari ${event.kapasitas} telah mendaftar` },
                                    { icon: '', label: 'Status Waktu',    val: isUpcoming ? 'Segera Dimulai' : 'Sudah Berlangsung' },
                                ].map(({ icon, label, val }) => (
                                    <div key={label} className="flex items-start gap-3 p-3.5 b-border rounded-2xl bg-slate-50">
                                        <div className="w-10 h-10 flex items-center justify-center flex-shrink-0 b-border rounded-xl text-xl"
                                            style={{ background: acc.tag, boxShadow: '2px 2px 0 #1a1a1a' }}>
                                            {icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                                            <p className="text-sm font-black text-slate-900 mt-0.5 leading-snug">{val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Admin */}
                        {isAdmin && (
                            <div className="bg-white b-border b-shadow-sm overflow-hidden rounded-[2rem]">
                                <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '3px solid #1a1a1a', background: '#fef3c7' }}>
                                    <div className="w-3 h-6 rounded-sm bg-amber-500" />
                                    <h2 className="font-fredoka text-xl font-bold text-amber-900 uppercase tracking-wide">Kontrol Admin </h2>
                                </div>
                                <div className="px-6 py-4 flex flex-wrap gap-3">
                                    <Link href={`/events/${event.id}/edit`}
                                        className="b-btn b-border inline-flex items-center gap-2 px-4 py-2.5 text-sm font-black bg-white text-slate-900 rounded-2xl uppercase tracking-wider">
                                         Edit Event
                                    </Link>
                                    <Link href={`/events/${event.id}/participants`}
                                        className="b-btn b-border inline-flex items-center gap-2 px-4 py-2.5 text-sm font-black text-white rounded-2xl uppercase tracking-wider"
                                        style={{ background: acc.btn }}>
                                        <UsersIcon className="w-4 h-4" strokeWidth={3} /> Peserta ({filled})
                                    </Link>
                                </div>
                            </div>
                        )}

                        <div className="block lg:hidden">{renderSidebar()}</div>
                    </div>

                    <div className="hidden lg:block lg:col-span-1">
                        <div className="sticky top-6">{renderSidebar()}</div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (isAuthenticated) return (
        <AuthenticatedLayout user={auth.user}>
            <Head title={event.nama_event} />
            {pageBody}
        </AuthenticatedLayout>
    );

    return (
        <>
            <Head title={event.nama_event} />
            <div className="flex flex-col min-h-screen">
                <header className="sticky top-0 z-50 px-4 sm:px-6 py-4">
                    <div className="max-w-7xl mx-auto bg-white b-border b-shadow-sm rounded-2xl px-5 sm:px-7 flex items-center justify-between"
                        style={{ height: '72px' }}>
                        <Link href="/events" className="flex items-center gap-2.5">
                            <div className="w-10 h-10 bg-green-500 b-border rounded-xl flex items-center justify-center"
                                style={{ boxShadow: '3px 3px 0 #1a1a1a' }}>
                                <BoltIcon className="w-5 h-5 text-black" strokeWidth={3} />
                            </div>
                            <span className="font-fredoka text-2xl font-bold tracking-tight text-black">HIMTI Events</span>
                        </Link>
                    </div>
                </header>
                <main className="flex-1">{pageBody}</main>
                <footer className="mt-8 py-10 bg-white border-t-4 border-black">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-10 h-10 bg-green-500 b-border rounded-xl flex items-center justify-center" style={{ boxShadow: '3px 3px 0 #1a1a1a' }}>
                                <span className="text-xl"></span>
                            </div>
                            <span className="font-fredoka text-2xl font-bold tracking-tight text-black">HIMTI Events</span>
                        </div>
                        <p className="text-slate-900 font-black text-xs uppercase tracking-widest">&copy; 2026 HIMTI Events. Satu Platform, Ribuan Kesempatan!</p>
                    </div>
                </footer>
            </div>
        </>
    );
}