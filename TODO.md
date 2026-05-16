# TODO - Househunt

- [x] Perbaiki error blank screen di FavoritesPage (module export mismatch)
  - [x] Edit `client/src/pages/tenant/FavoritesPage.jsx`: ganti import `useToast` dari `../../components/Toast` -> `../../hooks/useToast`
- [ ] Jalankan app lagi untuk memastikan error hilang dan halaman tampil
- [ ] Perbaiki server agar invalid JSON saat register tidak bikin 500/blank (edit `server/index.js` tambah handler SyntaxError)
