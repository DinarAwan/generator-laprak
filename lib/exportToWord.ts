import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  AlignmentType, 
  ImageRun, 
  Table, 
  TableRow, 
  TableCell, 
  WidthType, 
  BorderStyle, 
  ShadingType,
  HeadingLevel,
  VerticalAlign,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  TableOfContents
} from "docx";
import { saveAs } from "file-saver";
import type { FormData } from "./types";

/**
 * Konversi cm ke DXA (Twips)
 * 1 cm = 567 dxa
 */
const CM_TO_DXA = 567;
const MARGIN_3CM = 3 * CM_TO_DXA;

/**
 * Fetch image dari Blob URL ke Uint8Array agar bisa dibaca docx
 */
async function fetchImageAsBuffer(url: string): Promise<Uint8Array | null> {
  try {
    if (!url) return null;
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error("Gagal memuat gambar:", error);
    return null;
  }
}

/**
 * Helper untuk kapitalisasi kata
 */
function capitalizeEachWord(str: string): string {
  if (!str) return '';
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Fungsi Utama Export ke Word
 */
export async function exportToWord(data: FormData) {
  const { cover, preTest, hasil, postTest, daftars } = data;

  // 1. Persiapan Gambar (Fetch semua ke buffer)
  const preTestImages = await Promise.all(preTest.map(s => s.gambar_url ? fetchImageAsBuffer(s.gambar_url) : null));
  const hasilImages = await Promise.all(hasil.screenshots.map(s => s.url ? fetchImageAsBuffer(s.url) : null));
  const postTestImages = await Promise.all(postTest.map(s => s.gambar_url ? fetchImageAsBuffer(s.gambar_url) : null));

  // 2. Definisi Dokumen
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22, // 11pt
          },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 28, // 14pt
            bold: true,
            color: "000000",
          },
          paragraph: {
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: {
            size: 24, // 12pt
            bold: true,
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
        {
          id: "CodeBlock",
          name: "Code Block",
          basedOn: "Normal",
          run: {
            font: "Courier New",
            size: 20, // 10pt
          },
          paragraph: {
            shading: {
              type: ShadingType.SOLID,
              color: "F3F4F6",
              fill: "F3F4F6",
            },
            indent: { left: 720 },
            spacing: { before: 120, after: 120 },
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN_3CM,
              bottom: MARGIN_3CM,
              left: MARGIN_3CM,
              right: MARGIN_3CM,
            },
          },
        },
        children: [
          // ── Kover ──────────────────────────────────────────────────────────
          new Paragraph({
            children: [
              new TextRun({ text: "LAPORAN PRAKTIKUM", bold: true, size: 28 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 2000, after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Mata Praktikum: ${cover.mata_praktikum || "-"}`, bold: true, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `Materi: ${cover.materi || "-"}`, bold: true, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 2000 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: "Oleh:", size: 22 }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: cover.nama || "-", bold: true, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: cover.nim || "-", bold: true, size: 24 }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 2000 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `${cover.hari_tanggal || "-"}`, size: 22 }),
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({ text: `${cover.tahun || new Date().getFullYear()}`, bold: true, size: 22 }),
            ],
            alignment: AlignmentType.CENTER,
            pageBreakBefore: false,
          }),

          // ── Bab I: Pre-Test ───────────────────────────────────────────────
          new Paragraph({ text: "I. PRE TEST", style: "Heading1", pageBreakBefore: true }),
          ...(data.preTestIntro ? [new Paragraph({ text: data.preTestIntro })] : []),
          ...preTest.flatMap((soal, i) => {
            const letter = String.fromCharCode(65 + i);
            const content = [
              new Paragraph({
                children: [
                  new TextRun({ text: `${letter}. ${soal.pertanyaan || ""}`, bold: true }),
                ],
                spacing: { before: 240 },
              }),
              new Paragraph({ text: "1. Jawaban", indent: { left: 720 } }),
            ];

            // Gambar Jawaban
            const imgBuffer = preTestImages[i];
            if (imgBuffer) {
              content.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imgBuffer,
                      transformation: { width: 450, height: 250 },
                    } as any),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { before: 200, after: 100 },
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Gambar 1.${i + 1} ${capitalizeEachWord(soal.judul_gambar)}`, bold: true, italics: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 240 },
                })
              );
            }

            // Code
            if (soal.tipe === 'code' && soal.code) {
              content.push(
                new Paragraph({
                  children: [
                    new TextRun({ text: soal.code }),
                  ],
                  style: "CodeBlock",
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Kode Program 1.${i + 1} ${capitalizeEachWord(soal.judul_gambar)}`, bold: true, italics: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                })
              );
            }

            // Analisis
            if (soal.analisis) {
              content.push(new Paragraph({ text: soal.analisis, spacing: { before: 120 } }));
            }

            return content;
          }),

          // ── Bab II: Hasil Praktikum ───────────────────────────────────────
          new Paragraph({ text: "II. HASIL PRAKTIKUM", style: "Heading1", pageBreakBefore: true }),
          new Paragraph({ text: "A. Alat dan Bahan", style: "Heading2" }),
          new Paragraph({ text: hasil.alat_bahan || "-" }),

          new Paragraph({ text: "B. Langkah Kerja", style: "Heading2" }),
          new Paragraph({ text: hasil.langkah_kerja || "-" }),

          new Paragraph({ text: "C. Implementasi / Screenshot", style: "Heading2" }),
          ...hasil.screenshots.flatMap((ss, i) => {
            const content = [];
            if (ss.penjelasan_atas) {
              content.push(new Paragraph({ text: ss.penjelasan_atas }));
            }

            const imgBuffer = hasilImages[i];
            if (imgBuffer) {
              content.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imgBuffer,
                      transformation: { width: 450, height: 250 },
                    } as any),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Gambar 2.${i + 1} ${capitalizeEachWord(ss.judul)}`, bold: true, italics: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                  spacing: { after: 200 },
                })
              );
            }

            if (ss.tipe === 'code' && ss.code) {
              content.push(
                new Paragraph({ children: [new TextRun({ text: ss.code })], style: "CodeBlock" }),
                new Paragraph({ children: [new TextRun({ text: `Kode Program 2.${i + 1} ${capitalizeEachWord(ss.judul)}`, bold: true, italics: true })], alignment: AlignmentType.CENTER })
              );
            }

            return content;
          }),

          new Paragraph({ text: "D. Analisis Hasil", style: "Heading2" }),
          new Paragraph({ text: hasil.analisis_hasil || "-" }),

          // ── Bab III: Post-Test ────────────────────────────────────────────
          new Paragraph({ text: "III. POST TEST", style: "Heading1", pageBreakBefore: true }),
          ...(data.postTestIntro ? [new Paragraph({ text: data.postTestIntro })] : []),
          ...postTest.flatMap((soal, i) => {
            const letter = String.fromCharCode(65 + i);
            const content = [
              new Paragraph({
                children: [
                  new TextRun({ text: `${letter}. ${soal.pertanyaan || ""}`, bold: true }),
                ],
                spacing: { before: 240 },
              }),
              new Paragraph({ text: "1. Jawaban", indent: { left: 720 } }),
            ];

            const imgBuffer = postTestImages[i];
            if (imgBuffer) {
              content.push(
                new Paragraph({
                  children: [
                    new ImageRun({
                      data: imgBuffer,
                      transformation: { width: 450, height: 250 },
                    } as any),
                  ],
                  alignment: AlignmentType.CENTER,
                }),
                new Paragraph({
                  children: [
                    new TextRun({ text: `Gambar 3.${i + 1} ${capitalizeEachWord(soal.judul_gambar)}`, bold: true, italics: true }),
                  ],
                  alignment: AlignmentType.CENTER,
                })
              );
            }

            if (soal.analisis) {
              content.push(new Paragraph({ text: soal.analisis }));
            }

            return content;
          }),
        ],
      },
    ],
  });

  // 3. Generate & Download
  Packer.toBlob(doc).then((blob) => {
    const fileName = `${cover.nim || "NIM"} - ${cover.nama || "Nama Mahasiswa"}.docx`;
    saveAs(blob, fileName);
  });
}
