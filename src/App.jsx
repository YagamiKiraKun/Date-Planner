import React, { useState, useEffect, useRef } from 'react';
import html2pdf from 'html2pdf.js';

function App() {
  // --- STATE MANAGEMENT ---
  const [phase, setPhase] = useState(1); 
  const [noBtnPos, setNoBtnPos] = useState({ transform: 'translate(0px, 0px)', position: 'relative' });
  const [dateInfo, setDateInfo] = useState({ tanggal: '', kegiatan: '', tempat: '', waktu: '' });
  
  // State bantuan untuk memisahkan jam dan menit
  const [selectedHour, setSelectedHour] = useState('');
  const [selectedMinute, setSelectedMinute] = useState('');

  // State untuk simulasi tampilan (Otomatis, Desktop, HP)
  const [viewMode, setViewMode] = useState('auto');
  const [isMobileScreen, setIsMobileScreen] = useState(false);

  const notaRef = useRef();

  // Deteksi ukuran layar asli browser
  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sinkronisasi komponen jam & menit ke state utama waktu
  useEffect(() => {
    if (selectedHour && selectedMinute) {
      setDateInfo(prev => ({ ...prev, waktu: `${selectedHour}:${selectedMinute} WIB` }));
    } else {
      setDateInfo(prev => ({ ...prev, waktu: '' }));
    }
  }, [selectedHour, selectedMinute]);

  const isMobileLayout = viewMode === 'mobile' || (viewMode === 'auto' && isMobileScreen);

  // LOGIKA TOMBOL "ENGGA" LARI-LARI DI SEKITARAN CARD SAJA
  const moveNoButton = (e) => {
    e.preventDefault();
    const randomTop = Math.floor(Math.random() * 100) - 50; 
    const randomLeft = Math.floor(Math.random() * 140) - 70; 
    
    setNoBtnPos({
      position: 'relative',
      transform: `translate(${randomLeft}px, ${randomTop}px)`,
      zIndex: 9999,
      transition: 'all 0.15s ease'
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setDateInfo({ ...dateInfo, [name]: value });
  };

  const sendToWhatsApp = () => {
    const phoneNumber = "6282180875271"; 
    const text = `Halo Sayang! ✨\n\nIni rencana date terdekat kita yang udah aku isi di Miane Planner:\n\n📅 Tanggal: ${dateInfo.tanggal}\n🎈 Kegiatan: ${dateInfo.kegiatan}\n📍 Tempat: ${dateInfo.tempat}\n⏰ Waktu: ${dateInfo.waktu}\n\nSampai ketemu di hari H! I love you ❤️`;
    const encodedText = encodeURIComponent(text);
    window.open(`https://wa.me/${phoneNumber}?text=${encodedText}`, '_blank');
  };

  const downloadPDF = () => {
    const element = notaRef.current;
    const opt = {
      margin:       10,
      filename:     `Date_Plan_MiaBela.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a5', orientation: 'portrait' }
    };
    html2pdf().set(opt).from(element).save();
  };

  // Generate array jam kosong (00 - 23)
  const hoursArray = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  // Kategori menit yang umum digunakan
  const minutesArray = ['00', '15', '30', '45'];

  return (
    <div style={{
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
      minHeight: '100vh',
      height: isMobileLayout ? 'auto' : '100vh',
      padding: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      boxSizing: 'border-box',
      overflow: isMobileLayout ? 'auto' : 'hidden',
      color: '#2b2d42'
    }}>
      
      {/* CHOICE OF LAYOUT DISPLAY MODE CONTROLLER (DI ATAS) */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.8)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        padding: '4px',
        borderRadius: '30px',
        marginBottom: '25px',
        display: 'flex',
        gap: '4px',
        zIndex: 10000,
        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
      }}>
        {[
          { id: 'auto', label: '📱 Auto Responsive' },
          { id: 'desktop', label: '💻 Full Desktop' },
          { id: 'mobile', label: '📱 Mobile View' }
        ].map(mode => (
          <button
            key={mode.id}
            onClick={() => setViewMode(mode.id)}
            style={{
              padding: '6px 14px',
              border: 'none',
              borderRadius: '20px',
              cursor: 'pointer',
              backgroundColor: viewMode === mode.id ? '#a94438' : 'transparent',
              color: viewMode === mode.id ? '#fff' : '#555',
              fontSize: '12px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* WORKSPACE APP CONTAINER */}
      <div style={{
        width: '100%',
        maxWidth: isMobileLayout ? '400px' : '520px', 
        minHeight: '500px',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.6)',
        borderRadius: '24px',
        boxShadow: '0 20px 40px rgba(169, 68, 56, 0.05)',
        padding: isMobileLayout ? '30px 20px' : '45px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        transition: 'all 0.3s ease',
        boxSizing: 'border-box'
      }}>
        
        {/* ================= FASE 1: PERTANYAAN ================= */}
        {phase === 1 && (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <h2 style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px', color: '#2b2d42', letterSpacing: '-0.5px' }}>Date Planner</h2>
            <p style={{ fontSize: '18px', color: '#495057', marginBottom: '35px', fontWeight: '500' }}>
              Masih sayang aku?
            </p>
            
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', alignItems: 'center', minHeight: '100px', position: 'relative' }}>
              <button
                onClick={() => setPhase(2)}
                style={{
                  padding: '12px 38px',
                  backgroundColor: '#a94438',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '16px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 15px rgba(169, 68, 56, 0.25)',
                  zIndex: 10
                }}
              >
                Iya ❤️
              </button>
              
              <button
                onMouseEnter={moveNoButton}
                onClick={moveNoButton}
                onTouchStart={moveNoButton}
                style={{
                  padding: '12px 38px',
                  backgroundColor: '#ffffff',
                  color: '#6c757d',
                  border: '1px solid #ced4da',
                  borderRadius: '12px',
                  fontWeight: '600',
                  fontSize: '16px',
                  cursor: 'pointer',
                  ...noBtnPos
                }}
              >
                Engga 😜
              </button>
            </div>
          </div>
        )}

        {/* ================= FASE 2: BUKET BUNGA BLOOMING ================= */}
        {phase === 2 && (
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#a94438', marginBottom: '6px' }}>
              Buket ini buat kamu, Mia Bela 💐
            </h2>
            <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>Thank you for always being there and loving me</p>
            
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '240px', marginBottom: '25px' }}>
              <div className="bloom-animation" style={{ width: '200px', height: '240px' }}>
                <style>{`
                  @keyframes scaleIn {
                    0% { transform: scale(0.6); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                  .bloom-animation {
                    animation: scaleIn 1.5s cubic-bezier(0.175, 0.885, 0.32, 1.2) forwards;
                  }
                `}</style>
                <svg viewBox="0 0 200 240" width="100%" height="100%">
                  <path d="M50 120 L100 230 L150 120 C170 80, 180 50, 150 30 C120 10, 80 10, 50 30 C20 50, 30 80, 50 120 Z" fill="#f2e2be" stroke="#dfcb9f" strokeWidth="1" />
                  <path d="M40 70 Q20 50, 35 30 Q50 45, 40 70 Z" fill="#607d3b" />
                  <path d="M160 70 Q180 50, 165 30 Q150 45, 160 70 Z" fill="#607d3b" />
                  <path d="M100 40 Q100 15, 115 20 Q115 35, 100 40 Z" fill="#4d6630" />
                  <path d="M85 40 Q85 15, 70 20 Q70 35, 85 40 Z" fill="#4d6630" />
                  <path d="M55 110 L100 228 L145 110 C155 85, 145 60, 100 65 C55 60, 45 85, 55 110 Z" fill="#eadebd" />
                  
                  <g transform="translate(100,75)">
                    <circle cx="0" cy="0" r="22" fill="#a94438" />
                    <path d="M-15 -5 C-10 -18, 10 -18, 15 -5 C18 10, -18 10, -15 -5 Z" fill="#bd5347" />
                    <path d="M-10 2 C-5 -10, 5 -10, 10 2 C10 10, -10 10, -10 2 Z" fill="#d96846" />
                    <circle cx="0" cy="0" r="5" fill="#e58263" />
                  </g>
                  <g transform="translate(65,95)">
                    <circle cx="0" cy="0" r="18" fill="#94362b" />
                    <path d="M-11 -3 C-7 -13, 7 -13, 11 -3 C13 7, -13 7, -11 -3 Z" fill="#a94438" />
                    <path d="M-7 1 C-3 -7, 3 -7, 7 1 Z" fill="#d96846" />
                    <circle cx="0" cy="0" r="4" fill="#bd5347" />
                  </g>
                  <g transform="translate(135,95)">
                    <circle cx="0" cy="0" r="18" fill="#94362b" />
                    <path d="M-11 -3 C-7 -13, 7 -13, 11 -3 C13 7, -13 7, -11 -3 Z" fill="#a94438" />
                    <path d="M-7 1 C-3 -7, 3 -7, 7 1 Z" fill="#d96846" />
                    <circle cx="0" cy="0" r="4" fill="#bd5347" />
                  </g>
                  <g transform="translate(73,60)">
                    <circle cx="0" cy="0" r="16" fill="#a94438" />
                    <path d="M-9 -2 C-6 -11, 6 -11, 9 -2 Z" fill="#bd5347" />
                    <circle cx="0" cy="0" r="3" fill="#d96846" />
                  </g>
                  <g transform="translate(127,60)">
                    <circle cx="0" cy="0" r="16" fill="#a94438" />
                    <path d="M-9 -2 C-6 -11, 6 -11, 9 -2 Z" fill="#bd5347" />
                    <circle cx="0" cy="0" r="3" fill="#d96846" />
                  </g>
                  
                  <path d="M40 100 L100 230 L65 110 Z" fill="#e3d4ae" />
                  <path d="M160 100 L100 230 L135 110 Z" fill="#e3d4ae" />
                  <g transform="translate(100,195)">
                    <path d="M0 0 C-25 -15, -30 10, 0 0 Z" fill="#c4533d" stroke="#a94438" strokeWidth="1" />
                    <path d="M0 0 C25 -15, 30 10, 0 0 Z" fill="#c4533d" stroke="#a94438" strokeWidth="1" />
                    <path d="M-5 0 L-15 25 L-2 18 Z" fill="#a94438" />
                    <path d="M5 0 L15 25 L2 18 Z" fill="#a94438" />
                    <circle cx="0" cy="0" r="5" fill="#d96846" />
                  </g>
                </svg>
              </div>
            </div>

            <button
              onClick={() => setPhase(3)}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#a94438',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer',
                boxShadow: '0 6px 15px rgba(169, 68, 56, 0.2)'
              }}
            >
              Rencanakan Date Terdekat ✨
            </button>
          </div>
        )}

        {/* ================= FASE 3: FORM ================= */}
        {phase === 3 && (
          <div style={{ textAlign: 'left' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#2b2d42', marginBottom: '5px', textAlign: 'center' }}>
              Rencanain Datenya Yuk!
            </h3>
            <p style={{ fontSize: '13px', color: '#6c757d', marginBottom: '20px', textAlign: 'center' }}>Isi rencana date ideal kita selanjutnya.</p>
            
            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#495057', display: 'block', marginBottom: '5px' }}>Pilih Tanggal</label>
              <input type="date" name="tanggal" value={dateInfo.tanggal} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e5e5', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#495057', display: 'block', marginBottom: '5px' }}>Nama Kegiatan</label>
              <input type="text" name="kegiatan" placeholder="Contoh: Nonton bioskop dan makan nasi cokot" value={dateInfo.kegiatan} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e5e5', boxSizing: 'border-box' }} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#495057', display: 'block', marginBottom: '5px' }}>Tempat Tujuan</label>
              <input type="text" name="tempat" placeholder="Contoh: Opi / Gacoan" value={dateInfo.tempat} onChange={handleInputChange} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e5e5e5', boxSizing: 'border-box' }} />
            </div>

            {/* UPGRADE INPUT: DOUBLE DROPDOWN JAM 24 JAM DAN MENIT BERSIH */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#495057', display: 'block', marginBottom: '5px' }}>Waktu Bertemu (Format 24 Jam)</label>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select 
                  value={selectedHour} 
                  onChange={(e) => setSelectedHour(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e5e5e5', backgroundColor: '#fff' }}
                >
                  <option value="">Jam</option>
                  {hoursArray.map(hr => <option key={hr} value={hr}>{hr}</option>)}
                </select>
                <span style={{ fontWeight: 'bold' }}>:</span>
                <select 
                  value={selectedMinute} 
                  onChange={(e) => setSelectedMinute(e.target.value)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #e5e5e5', backgroundColor: '#fff' }}
                >
                  <option value="">Menit</option>
                  {minutesArray.map(mn => <option key={mn} value={mn}>{mn}</option>)}
                </select>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#6c757d' }}>WIB</span>
              </div>
            </div>

            <button
              onClick={() => {
                if(!dateInfo.tanggal || !dateInfo.kegiatan || !dateInfo.tempat || !dateInfo.waktu) {
                  alert("Lengkapi semua kolom rencananya dulu ya!");
                  return;
                }
                setPhase(4);
              }}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#a94438',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '700',
                fontSize: '15px',
                cursor: 'pointer'
              }}
            >
              Cetak Tiket Date 🎟️
            </button>
          </div>
        )}

        {/* ================= FASE 4: TICKET OUTPUT ================= */}
        {phase === 4 && (
          <div>
            <div ref={notaRef} style={{
              backgroundColor: '#ffffff',
              border: '2px dashed #a94438',
              borderRadius: '16px',
              padding: '20px',
              textAlign: 'left',
              marginBottom: '25px',
              color: '#2b2d42'
            }}>
              <div style={{ textAlign: 'center', borderBottom: '1px dashed #ced4da', paddingBottom: '10px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '18px', color: '#a94438', fontWeight: '800' }}>MIANE OFFICIAL TICKET</h4>
                <span style={{ fontSize: '10px', color: '#6c757d' }}>Karcis Date Resmi</span>
              </div>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}><strong>📅 Tanggal:</strong> {dateInfo.tanggal}</p>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}><strong>🎈 Agenda:</strong> {dateInfo.kegiatan}</p>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}><strong>📍 Lokasi:</strong> {dateInfo.tempat}</p>
              <p style={{ margin: '0 0 15px 0', fontSize: '13px' }}><strong>⏰ Jam:</strong> {dateInfo.waktu}</p>
              <div style={{ textAlign: 'center', fontSize: '11px', color: '#a94438', fontWeight: 'bold' }}>
                "Berlaku untuk satu kali."
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={sendToWhatsApp}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#25d366', 
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                💬 Kirim via WhatsApp
              </button>

              <button
                onClick={downloadPDF}
                style={{
                  width: '100%',
                  padding: '14px',
                  backgroundColor: '#a94438',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontWeight: '700',
                  fontSize: '15px',
                  cursor: 'pointer'
                }}
              >
                📥 Unduh Dokumen PDF
              </button>

              <button
                onClick={() => {
                  setPhase(1);
                  setSelectedHour('');
                  setSelectedMinute('');
                  setNoBtnPos({ transform: 'translate(0px, 0px)', position: 'relative' });
                  setDateInfo({ tanggal: '', kegiatan: '', tempat: '', waktu: '' });
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  backgroundColor: 'transparent',
                  color: '#6c757d',
                  border: '1px solid #ced4da',
                  borderRadius: '10px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  marginTop: '5px'
                }}
              >
                Ulangi dari Awal
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;