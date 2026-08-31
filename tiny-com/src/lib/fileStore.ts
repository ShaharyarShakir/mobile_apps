import {
  CompressionResult,
  PDFCompressionResult,
  SelectedFile,
} from "../types/file";

class FileStore {
  private _imageFiles: SelectedFile[] = [];
  private _pdfFiles: SelectedFile[] = [];
  private _imageResults: CompressionResult[] = [];
  private _pdfResults: PDFCompressionResult[] = [];

  getImageFiles(): SelectedFile[] {
    return this._imageFiles;
  }

  setImageFiles(files: SelectedFile[]): void {
    this._imageFiles = files;
  }

  getPdfFiles(): SelectedFile[] {
    return this._pdfFiles;
  }

  setPdfFiles(files: SelectedFile[]): void {
    this._pdfFiles = files;
  }

  getImageResults(): CompressionResult[] {
    return this._imageResults;
  }

  setImageResults(results: CompressionResult[]): void {
    this._imageResults = results;
  }

  getPdfResults(): PDFCompressionResult[] {
    return this._pdfResults;
  }

  setPdfResults(results: PDFCompressionResult[]): void {
    this._pdfResults = results;
  }

  clear(): void {
    this._imageFiles = [];
    this._pdfFiles = [];
    this._imageResults = [];
    this._pdfResults = [];
  }
}

export const fileStore = new FileStore();
