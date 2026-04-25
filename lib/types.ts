export interface UserProfile {
  id: string;
  email: string;
  nama_lengkap: string;
  nim: string;
  status_langganan: 'free' | 'premium';
}

export interface CoverData {
  mata_praktikum: string;
  materi: string;
  hari_tanggal: string;
  tahun: string;
  nama: string;
  nim: string;
}

export interface GambarItem {
  id: string;
  file: File | null;
  url: string;
  nama: string;
  penjelasan: string;
}

export interface SoalItem {
  id: string;
  pertanyaan: string;
  tipe: 'image' | 'code' | 'table';
  gambar: File | null;
  gambar_url: string;
  code: string;
  table_data: string[][];
  judul_gambar: string;
  analisis: string;
  list_gambar?: GambarItem[];
}

export interface HasilData {
  intro: string;
  alat_bahan: string;
  langkah_kerja: string;
  analisis_hasil: string;
  screenshots: ScreenshotItem[];
}

export interface ScreenshotItem {
  id: string;
  tipe: 'image' | 'code' | 'table';
  file: File | null;
  url: string;
  code: string;
  table_data: string[][];
  judul: string;
  penjelasan_atas: string;
  penjelasan_bawah: string;
}

export interface DaftarItem {
  id: string;
  label: string;
  halaman: string;
}

export interface PertemuanItem {
  id: string;
  no: string;
  materi: string;
}

export interface DaftarData {
  show: boolean;
  pertemuan: string;
  materi: string;
  isi: DaftarItem[];
  gambar: DaftarItem[];
  tabel: DaftarItem[];
  kode: DaftarItem[];
  listPertemuan: PertemuanItem[];
}

export interface FormData {
  cover: CoverData;
  preTestIntro: string;
  preTest: SoalItem[];
  hasil: HasilData;
  postTestIntro: string;
  postTest: SoalItem[];
  daftars: DaftarData;
}

export function createEmptySoal(): SoalItem {
  return {
    id: crypto.randomUUID(),
    pertanyaan: '',
    tipe: 'image',
    gambar: null,
    gambar_url: '',
    code: '',
    table_data: [['Header 1', 'Header 2'], ['Data 1', 'Data 2']],
    judul_gambar: '',
    analisis: '',
    list_gambar: [],
  };
}

export function createEmptyScreenshot(): ScreenshotItem {
  return {
    id: crypto.randomUUID(),
    tipe: 'image',
    file: null,
    url: '',
    code: '',
    table_data: [['Header 1', 'Header 2'], ['Data 1', 'Data 2']],
    judul: '',
    penjelasan_atas: '',
    penjelasan_bawah: '',
  };
}

export function createInitialFormData(nama: string, nim: string): FormData {
  return {
    cover: {
      mata_praktikum: '',
      materi: '',
      hari_tanggal: '',
      tahun: new Date().getFullYear().toString(),
      nama,
      nim,
    },
    preTestIntro: 'Pada bagian ini digunakan untuk melaporkan jawaban Pre Test pada setiap pertemuan praktikum.',
    preTest: [createEmptySoal()],
    hasil: {
      intro: 'Bagian ini digunakan untuk melaporkan seluruh luaran, data, dan proses yang dilakukan selama praktikum.',
      alat_bahan: '',
      langkah_kerja: '',
      screenshots: [createEmptyScreenshot()],
      analisis_hasil: '',
    },
    postTestIntro: 'Pada bagian ini digunakan untuk melaporkan jawaban Post Test pada akhir pertemuan praktikum.',
    postTest: [createEmptySoal()],
    daftars: {
      show: false,
      pertemuan: '',
      materi: '',
      isi: [],
      gambar: [],
      tabel: [],
      kode: [],
      listPertemuan: [
        { id: crypto.randomUUID(), no: '1', materi: '' }
      ],
    },
  };
}
