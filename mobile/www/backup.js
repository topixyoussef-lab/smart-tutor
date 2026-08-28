// ============================================================
//  Smart Tutor — local backup & original-PDF download
//  يعمل مع نسخة المتصفح في docs/ (لا يمس نسخة الخادم).
// ============================================================
(function () {
  'use strict';

  function toast(msg, type) {
    const wrap = document.getElementById('toastWrap');
    if (!wrap) return alert(msg);
    const el = document.createElement('div');
    el.className = 'toast ' + (type || 'success');
    el.textContent = String(msg);
    wrap.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, 3500);
  }

  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1500);
  }

  function sanitizeName(s) {
    return String(s || 'book')
      .replace(/[\\/:*?"<>|]+/g, '-')
      .replace(/\s+/g, ' ')
      .trim() || 'book';
  }

  function setBackupStatus(msg, error) {
    const el = document.getElementById('backupStatus');
    if (!el) return;
    el.textContent = msg || '';
    el.className = 'text-xs font-bold mt-2 ' + (error ? 'text-rose-600' : 'text-emerald-600');
  }

  /* ---------------- export ---------------- */
  async function exportBackup() {
    const btn = document.getElementById('backupExportBtn');
    if (!btn) return;
    btn.disabled = true;
    setBackupStatus('جاري تجهيز النسخة الاحتياطية...');
    try {
      const res = await fetch('/api/export', { method: 'POST' });
      if (!res.ok) {
        let msg = 'خطأ ' + res.status;
        try { const d = await res.json(); msg = d.error || msg; } catch { }
        throw new Error(msg);
      }
      const data = await res.json();
      const backup = data.backup;
      if (!backup) throw new Error('استجابة فارغة.');
      const json = JSON.stringify(backup, null, 1);
      const stamp = new Date().toISOString().slice(0, 10);
      triggerDownload(new Blob([json], { type: 'application/json' }), 'smart-tutor-backup-' + stamp + '.json');
      const pdfs = Object.keys(backup.pdfs || {}).length;
      setBackupStatus('تم التنزيل ✓ — ' + backup.books.length + ' كتاب، ' + pdfs + ' ملف PDF، ' + backup.exams.length + ' امتحان، ' + backup.results.length + ' نتيجة.');
    } catch (e) {
      setBackupStatus('فشل: ' + (e.message || e), true);
    } finally {
      btn.disabled = false;
    }
  }

  /* ---------------- import ---------------- */
  async function importBackup(file) {
    if (!file) return;
    setBackupStatus('جاري قراءة الملف...');
    let backup;
    try {
      backup = JSON.parse(await file.text());
    } catch {
      setBackupStatus('الملف ليس نسخة احتياطية صالحة.', true);
      return;
    }
    if (!backup || backup.app !== 'smart-tutor' || backup.version !== 1) {
      setBackupStatus('الملف ليس نسخة احتياطية صالحة.', true);
      return;
    }
    if (!confirm('سيتم استبدال كل البيانات الحالية في هذا المتصفح ببيانات النسخة. متابعة؟')) {
      setBackupStatus('');
      return;
    }
    setBackupStatus('جاري الاستيراد... قد يستغرق لحظات للكتب الكبيرة.');
    try {
      const res = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup }),
      });
      if (!res.ok) {
        let msg = 'خطأ ' + res.status;
        try { const d = await res.json(); msg = d.error || msg; } catch { }
        throw new Error(msg);
      }
      const data = await res.json();
      setBackupStatus('تم الاستيراد ✓ — ' + data.books + ' كتاب، ' + data.pdfs + ' PDF، ' + data.exams + ' امتحان، ' + data.results + ' نتيجة. جاري إعادة التحميل...');
      setTimeout(() => location.reload(), 1200);
    } catch (e) {
      setBackupStatus('فشل: ' + (e.message || e), true);
    }
  }

  /* ---------------- per-book PDF download ---------------- */
  function wireBookGrid() {
    const grid = document.getElementById('booksGrid');
    if (!grid) return;
    grid.querySelectorAll('[data-book-card]').forEach((card) => {
      const id = card.dataset.bookCard;
      const btn = card.querySelector('.dl-book');
      if (btn) return;
      const del = card.querySelector('.del-book');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn-ghost text-brand-600 dl-book';
      b.dataset.id = id;
      b.textContent = 'تنزيل PDF';
      b.title = 'حفظ الكتاب الأصلي كملف على جهازك';
      del.parentNode.insertBefore(b, del);
      b.addEventListener('click', async () => {
        b.disabled = true;
        try {
          const res = await fetch('/api/books/' + encodeURIComponent(id) + '/pdf');
          if (!res.ok) {
            let msg = 'خطأ ' + res.status;
            try { const d = await res.json(); msg = d.error || msg; } catch { }
            throw new Error(msg);
          }
          let name = card.querySelector('h3')?.textContent || 'book';
          const cd = res.headers.get('Content-Disposition') || '';
          const mm = cd.match(/filename\*=UTF-8''([^;]+)/) || cd.match(/filename="([^"]+)"/);
          if (mm) {
            try { name = decodeURIComponent(mm[1]); } catch { name = mm[1]; }
          }
          const blob = await res.blob();
          triggerDownload(blob, sanitizeName(name));
        } catch (e) {
          toast('تعذّر تنزيل الكتاب: ' + (e.message || e), 'error');
        } finally {
          b.disabled = false;
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const ex = document.getElementById('backupExportBtn');
    if (ex) ex.addEventListener('click', exportBackup);
    const imp = document.getElementById('backupImportInput');
    if (imp) imp.addEventListener('change', () => { importBackup(imp.files && imp.files[0]); imp.value = ''; });

    wireBookGrid();
    const grid = document.getElementById('booksGrid');
    if (grid && 'MutationObserver' in window) {
      new MutationObserver(wireBookGrid).observe(grid, { childList: true, subtree: false });
    }
  });
})();