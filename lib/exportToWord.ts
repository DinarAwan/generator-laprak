import {
  AlignmentType,
  BorderStyle,
  Document,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  Tab,
  TabStopType,
  TextRun,
  WidthType,
  type IImageOptions,
  type IParagraphOptions,
} from "docx";
import { saveAs } from "file-saver";
import type { DaftarItem, FormData, JawabanItem, SoalItem } from "./types";

type DocxImageType = "jpg" | "png" | "gif" | "bmp";
type DocxImage = { data: Uint8Array; type: DocxImageType; width?: number; height?: number };
type DocumentChild = Paragraph | Table;

const CM_TO_DXA = 567;
const LIST_CONTENT_LEFT = 720;
const ANSWER_CONTENT_LEFT = 1080;
const MARGIN_TOP = 3 * CM_TO_DXA;
const MARGIN_BOTTOM = 3 * CM_TO_DXA;
const MARGIN_LEFT = 3 * CM_TO_DXA;
const MARGIN_RIGHT = 3 * CM_TO_DXA;

function capitalizeEachWord(str: string): string {
  if (!str) return "";
  return str.replace(/\b\w/g, (c) => c.toUpperCase());
}

function getPostJawabanItems(soal: SoalItem): JawabanItem[] {
  if (soal.jawaban_items && soal.jawaban_items.length > 0) return soal.jawaban_items;

  if ((!soal.tipe || soal.tipe === "image") && soal.list_gambar && soal.list_gambar.length > 0) {
    return soal.list_gambar.map((gbr) => ({
      id: gbr.id,
      tipe: "image",
      file: gbr.file,
      url: gbr.url,
      code: "",
      table_data: [["Header 1", "Header 2"], ["Data 1", "Data 2"]],
      judul: gbr.nama,
      penjelasan: gbr.penjelasan,
    }));
  }

  if ((!soal.tipe || soal.tipe === "image") && soal.gambar_url) {
    return [{
      id: soal.id,
      tipe: "image",
      file: soal.gambar,
      url: soal.gambar_url,
      code: "",
      table_data: [["Header 1", "Header 2"], ["Data 1", "Data 2"]],
      judul: soal.judul_gambar,
      penjelasan: "",
    }];
  }

  if (soal.tipe === "code" && soal.code) {
    return [{
      id: soal.id,
      tipe: "code",
      file: null,
      url: "",
      code: soal.code,
      table_data: [["Header 1", "Header 2"], ["Data 1", "Data 2"]],
      judul: soal.judul_gambar,
      penjelasan: "",
    }];
  }

  if (soal.tipe === "table" && soal.table_data) {
    return [{
      id: soal.id,
      tipe: "table",
      file: null,
      url: "",
      code: "",
      table_data: soal.table_data,
      judul: soal.judul_gambar,
      penjelasan: "",
    }];
  }

  return [];
}

function imageTypeFromMime(mime: string): DocxImageType | null {
  if (mime === "image/jpeg" || mime === "image/jpg") return "jpg";
  if (mime === "image/png") return "png";
  if (mime === "image/gif") return "gif";
  if (mime === "image/bmp") return "bmp";
  return null;
}

function imageTypeFromUrl(url: string): DocxImageType | null {
  const cleanUrl = url.split("?")[0].toLowerCase();
  if (cleanUrl.endsWith(".jpg") || cleanUrl.endsWith(".jpeg")) return "jpg";
  if (cleanUrl.endsWith(".png")) return "png";
  if (cleanUrl.endsWith(".gif")) return "gif";
  if (cleanUrl.endsWith(".bmp")) return "bmp";
  return null;
}

async function getBlobDimensions(blob: Blob): Promise<{ width: number; height: number } | null> {
  try {
    if ('createImageBitmap' in window) {
      const bitmap = await createImageBitmap(blob);
      const dimensions = { width: bitmap.width, height: bitmap.height };
      bitmap.close();
      return dimensions;
    }
  } catch {
    // Fall back to HTMLImageElement below.
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    image.src = objectUrl;
  });
}

function fitImageSize(width: number, height: number, maxWidth: number, maxHeight: number) {
  if (width <= 0 || height <= 0) return { width: maxWidth, height: Math.round(maxWidth * 0.56) };

  const scale = Math.min(maxWidth / width, maxHeight / height, 1);
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

async function fetchImageAsBuffer(url: string): Promise<DocxImage | null> {
  try {
    if (!url) return null;

    const response = await fetch(url);
    const blob = await response.blob();
    const type = imageTypeFromMime(blob.type) || imageTypeFromUrl(url);

    if (!type) return null;

    const arrayBuffer = await blob.arrayBuffer();
    const dimensions = await getBlobDimensions(blob);
    return { data: new Uint8Array(arrayBuffer), type, ...(dimensions || {}) };
  } catch (error) {
    console.error("Gagal memuat gambar:", error);
    return null;
  }
}

function textParagraph(text: string, options: IParagraphOptions = {}): Paragraph {
  return new Paragraph({
    ...options,
    children: [new TextRun({ text: text || " " })],
    spacing: options.spacing ?? { after: 120 },
  });
}

function textParagraphs(text: string, options: IParagraphOptions = {}): Paragraph[] {
  if (!text) return [];

  return text.split("\n").map((line) =>
    textParagraph(line.trim() ? line : " ", {
      ...options,
      spacing: options.spacing ?? { after: 120 },
    }),
  );
}

function justifiedParagraphs(text: string, options: IParagraphOptions = {}): Paragraph[] {
  return textParagraphs(text, {
    ...options,
    alignment: options.alignment ?? AlignmentType.JUSTIFIED,
  });
}

function indentedJustifiedParagraphs(text: string, left: number): Paragraph[] {
  return justifiedParagraphs(text, { indent: { left } });
}

function heading(text: string, pageBreakBefore = false): Paragraph {
  return new Paragraph({
    pageBreakBefore,
    alignment: AlignmentType.LEFT,
    spacing: { before: 240, after: 240 },
    children: [new TextRun({ text, bold: true, size: 28 })],
  });
}

function numberedParagraph(
  number: string,
  text: string,
  options: {
    left?: number;
    hanging?: number;
    tab?: number;
    bold?: boolean;
    alignment?: (typeof AlignmentType)[keyof typeof AlignmentType];
    spacing?: IParagraphOptions["spacing"];
  } = {},
): Paragraph {
  const left = options.left ?? 720;
  const hanging = options.hanging ?? 360;
  const tab = options.tab ?? left;

  return new Paragraph({
    alignment: options.alignment ?? AlignmentType.JUSTIFIED,
    indent: { left, hanging },
    tabStops: [{ type: TabStopType.LEFT, position: tab }],
    spacing: options.spacing ?? { before: 200, after: 120 },
    children: [
      new TextRun({ text: number, bold: options.bold ?? false, size: 22 }),
      new Tab(),
      new TextRun({ text: text || " ", bold: options.bold ?? false, size: 22 }),
    ],
  });
}

function caption(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    children: [new TextRun({ text, bold: true, italics: true, size: 20 })],
  });
}

function imageParagraph(image: DocxImage, maxWidth = 450, maxHeight = 520, indentLeft = 0): Paragraph {
  const size = fitImageSize(image.width || maxWidth, image.height || maxHeight, maxWidth, maxHeight);
  const options: IImageOptions = {
    data: image.data,
    type: image.type,
    transformation: size,
  };

  return new Paragraph({
    alignment: AlignmentType.CENTER,
    indent: indentLeft ? { left: indentLeft } : undefined,
    spacing: { before: 160, after: 80 },
    children: [new ImageRun(options)],
  });
}

function dataTable(rows: string[][], indentLeft = 0): Table {
  return new Table({
    width: { size: indentLeft ? 88 : 100, type: WidthType.PERCENTAGE },
    indent: indentLeft ? { size: indentLeft, type: WidthType.DXA } : undefined,
    rows: rows.map(
      (row, rowIndex) =>
        new TableRow({
          children: row.map(
            (cell) =>
              new TableCell({
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                shading:
                  rowIndex === 0
                    ? { type: ShadingType.SOLID, color: "F3F4F6", fill: "F3F4F6" }
                    : undefined,
                children: [
                  new Paragraph({
                    alignment: rowIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                    children: [new TextRun({ text: cell || " ", bold: rowIndex === 0 })],
                  }),
                ],
              }),
          ),
        }),
    ),
  });
}

function codeTable(code: string, indentLeft = 0): Table {
  const lines = code.split("\n");

  return new Table({
    width: { size: indentLeft ? 88 : 100, type: WidthType.PERCENTAGE },
    indent: indentLeft ? { size: indentLeft, type: WidthType.DXA } : undefined,
    rows: lines.map(
      (line, index) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 10, type: WidthType.PERCENTAGE },
              margins: { top: 40, bottom: 40, left: 80, right: 80 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: `${index + 1}`, font: "Courier New", size: 18 })],
                }),
              ],
            }),
            new TableCell({
              width: { size: 90, type: WidthType.PERCENTAGE },
              margins: { top: 40, bottom: 40, left: 120, right: 80 },
              children: [
                new Paragraph({
                  children: [new TextRun({ text: line || " ", font: "Courier New", size: 18 })],
                }),
              ],
            }),
          ],
        }),
    ),
  });
}

function daftarRows(items: DaftarItem[]): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: items.map(
      (item) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: 85, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              },
              children: [textParagraph(item.label)],
            }),
            new TableCell({
              width: { size: 15, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
                right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              },
              children: [
                new Paragraph({
                  alignment: AlignmentType.RIGHT,
                  children: [new TextRun({ text: item.halaman || " " })],
                }),
              ],
            }),
          ],
        }),
    ),
  });
}

function pushFigure(
  children: DocumentChild[],
  image: DocxImage | null,
  captionText: string,
  indentLeft = 0,
): void {
  if (!image) return;
  children.push(imageParagraph(image, 450, 520, indentLeft), caption(captionText));
}

function pushCode(children: DocumentChild[], code: string, captionText: string, indentLeft = 0): void {
  if (!code) return;
  children.push(codeTable(code, indentLeft), caption(captionText));
}

function pushTable(children: DocumentChild[], rows: string[][], captionText: string, indentLeft = 0): void {
  if (!rows || rows.length === 0) return;
  children.push(caption(captionText), dataTable(rows, indentLeft), textParagraph(""));
}

export async function exportToWord(data: FormData) {
  const { cover, preTest, hasil, postTest, daftars } = data;

  const logo = await fetchImageAsBuffer("/uad.png");
  const preTestImages = await Promise.all(
    preTest.map((soal) =>
      (!soal.tipe || soal.tipe === "image") && soal.gambar_url
        ? fetchImageAsBuffer(soal.gambar_url)
        : null,
    ),
  );
  const hasilImages = await Promise.all(
    hasil.screenshots.map((item) =>
      item.tipe === "image" && item.url ? fetchImageAsBuffer(item.url) : null,
    ),
  );
  const postAnswerImageEntries = await Promise.all(
    postTest.flatMap((soal) =>
      getPostJawabanItems(soal)
        .filter((item) => item.tipe === "image")
        .map(async (item) => ({
          id: item.id,
          image: item.url ? await fetchImageAsBuffer(item.url) : null,
        })),
    ),
  );
  const postAnswerImages = new Map(postAnswerImageEntries.map((entry) => [entry.id, entry.image]));

  const children: DocumentChild[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 120 },
      children: [new TextRun({ text: "LAPORAN PRAKTIKUM", bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `(${cover.mata_praktikum || "Mata Praktikum"})`, bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 80 },
      children: [new TextRun({ text: "Materi", bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: `(${cover.materi || "Judul Pertemuan"})`, bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 900 },
      children: [
        new TextRun({
          text: `(${cover.hari_tanggal || "Hari Tanggal dan Sesi Praktikum"})`,
          bold: true,
          size: 28,
        }),
      ],
    }),
  ];

  if (logo) {
    children.push(imageParagraph(logo, 210, 210));
  }

  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 520 },
      children: [new TextRun({ text: "Disusun Oleh:", bold: true, size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: cover.nama || "Nama Mahasiswa", size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 900 },
      children: [new TextRun({ text: cover.nim || "NIM", size: 24 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "PROGRAM STUDI S1 INFORMATIKA", bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "FAKULTAS TEKNOLOGI INDUSTRI", bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: "UNIVERSITAS AHMAD DAHLAN", bold: true, size: 28 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240 },
      children: [new TextRun({ text: cover.tahun || `${new Date().getFullYear()}`, bold: true, size: 28 })],
    }),
  );

  if (daftars.show) {
    if (daftars.isi.length > 0) children.push(heading("DAFTAR ISI", true), daftarRows(daftars.isi));
    if (daftars.gambar.length > 0) children.push(heading("DAFTAR GAMBAR", true), daftarRows(daftars.gambar));
    if (daftars.tabel.length > 0) children.push(heading("DAFTAR TABEL", true), daftarRows(daftars.tabel));
    if (daftars.kode.length > 0) children.push(heading("DAFTAR KODE PROGRAM", true), daftarRows(daftars.kode));

    children.push(heading("DAFTAR PERTEMUAN PRAKTIKUM", true));
    children.push(
      dataTable(
        daftars.listPertemuan.length > 0
          ? [["Pertemuan", "Judul Materi"], ...daftars.listPertemuan.map((item) => [item.no, item.materi])]
          : [["Pertemuan", "Judul Materi"], [daftars.pertemuan, daftars.materi]],
      ),
    );
  }

  children.push(heading("I. Pre Test", true));
  children.push(...justifiedParagraphs(data.preTestIntro));

  let preImageCount = 0;
  preTest.forEach((soal, index) => {
    const letter = String.fromCharCode(65 + index);
    children.push(numberedParagraph(`${letter}.`, soal.pertanyaan || `Pertanyaan ${index + 1}`));
    children.push(numberedParagraph("1.", "Jawaban", { left: 1080, tab: 1080, spacing: { after: 120 } }));

    if ((!soal.tipe || soal.tipe === "image") && preTestImages[index]) {
      preImageCount += 1;
      pushFigure(
        children,
        preTestImages[index],
        `Gambar 1.${preImageCount} ${capitalizeEachWord(soal.judul_gambar)}`.trim(),
        ANSWER_CONTENT_LEFT,
      );
    }

    if (soal.tipe === "code") {
      pushCode(children, soal.code, `Kode Program 1.${index + 1} ${capitalizeEachWord(soal.judul_gambar)}`.trim(), ANSWER_CONTENT_LEFT);
    }

    if (soal.tipe === "table") {
      pushTable(children, soal.table_data, `Tabel 1.${index + 1} ${capitalizeEachWord(soal.judul_gambar)}`.trim(), ANSWER_CONTENT_LEFT);
    }

    children.push(...indentedJustifiedParagraphs(soal.analisis, ANSWER_CONTENT_LEFT));
  });

  children.push(heading("II. Hasil Praktikum", true));
  children.push(...justifiedParagraphs(hasil.intro));
  children.push(numberedParagraph("A.", "Alat dan Bahan:", { bold: true }));
  children.push(...indentedJustifiedParagraphs(hasil.alat_bahan || "-", LIST_CONTENT_LEFT));
  children.push(numberedParagraph("B.", "Langkah Kerja:", { bold: true }));
  children.push(...indentedJustifiedParagraphs(hasil.langkah_kerja || "-", LIST_CONTENT_LEFT));
  children.push(numberedParagraph("C.", "Implementasi/Screenshot:", { bold: true }));

  hasil.screenshots.forEach((item, index) => {
    children.push(...indentedJustifiedParagraphs(item.penjelasan_atas, LIST_CONTENT_LEFT));

    if (item.tipe === "image") {
      pushFigure(
        children,
        hasilImages[index],
        `Gambar 2.${index + 1} ${capitalizeEachWord(item.judul)}`.trim(),
        LIST_CONTENT_LEFT,
      );
    }

    if (item.tipe === "code") {
      pushCode(children, item.code, `Kode Program 2.${index + 1} ${capitalizeEachWord(item.judul)}`.trim(), LIST_CONTENT_LEFT);
    }

    if (item.tipe === "table") {
      pushTable(children, item.table_data, `Tabel 2.${index + 1} ${capitalizeEachWord(item.judul)}`.trim(), LIST_CONTENT_LEFT);
    }

    children.push(...indentedJustifiedParagraphs(item.penjelasan_bawah, LIST_CONTENT_LEFT));
  });

  children.push(numberedParagraph("D.", "Analisis Hasil:", { bold: true }));
  children.push(...indentedJustifiedParagraphs(hasil.analisis_hasil || "-", LIST_CONTENT_LEFT));

  children.push(heading("III. Post Test", true));
  children.push(...justifiedParagraphs(data.postTestIntro));

  let postImageCount = 0;
  let postCodeCount = 0;
  let postTableCount = 0;
  postTest.forEach((soal, index) => {
    const letter = String.fromCharCode(65 + index);
    children.push(numberedParagraph(`${letter}.`, soal.pertanyaan || `Pertanyaan ${index + 1}`));
    children.push(numberedParagraph("1.", "Jawaban", { left: 1080, tab: 1080, spacing: { after: 120 } }));

    getPostJawabanItems(soal).forEach((item) => {
      if (item.tipe === "image" && item.url) {
        postImageCount += 1;
        pushFigure(
          children,
          postAnswerImages.get(item.id) || null,
          `Gambar 3.${postImageCount} ${capitalizeEachWord(item.judul)}`.trim(),
          ANSWER_CONTENT_LEFT,
        );
        children.push(...indentedJustifiedParagraphs(item.penjelasan, ANSWER_CONTENT_LEFT));
      }

      if (item.tipe === "code" && item.code) {
        postCodeCount += 1;
        pushCode(children, item.code, `Kode Program 3.${postCodeCount} ${capitalizeEachWord(item.judul)}`.trim(), ANSWER_CONTENT_LEFT);
      }

      if (item.tipe === "table" && item.table_data) {
        postTableCount += 1;
        pushTable(children, item.table_data, `Tabel 3.${postTableCount} ${capitalizeEachWord(item.judul)}`.trim(), ANSWER_CONTENT_LEFT);
      }
    });

    children.push(...indentedJustifiedParagraphs(soal.analisis, ANSWER_CONTENT_LEFT));
  });

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: 22,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: MARGIN_TOP,
              bottom: MARGIN_BOTTOM,
              left: MARGIN_LEFT,
              right: MARGIN_RIGHT,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const fileName = `${cover.nim || "NIM"} - ${cover.nama || "Nama Mahasiswa"}.docx`;
  saveAs(blob, fileName);
}
