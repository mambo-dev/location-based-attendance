import * as FileSaver from "file-saver";
import XLSX from "sheetjs-style";

type Export = {
  filetype: string;
  filename: string;
  fileExtension?: string;
  Dbdata: any[];
};

export function exportToExcel({
  filetype,
  fileExtension = ".xlsx",
  filename,
  Dbdata,
}: Export) {
  console.log(Dbdata);
  const ws = XLSX.utils.json_to_sheet(Dbdata);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: filetype });
  FileSaver.saveAs(data, filename + fileExtension);
}
