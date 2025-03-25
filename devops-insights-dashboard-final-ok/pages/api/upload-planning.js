import formidable from "formidable";
import * as XLSX from "xlsx";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ error: "Erro no upload" });

    const file = files.file[0];
    const data = fs.readFileSync(file.filepath);
    const workbook = XLSX.read(data, { type: "buffer" });

    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    const headerIndex = json.findIndex(row => row.includes("Card") || row.includes("ID"));
    const dataRows = json.slice(headerIndex + 1);
    const idColIndex = json[headerIndex].findIndex(h => h === "Card" || h === "ID");

    const ids = dataRows.map(row => parseInt(row[idColIndex])).filter(v => !isNaN(v));

    res.status(200).json({ ids });
  });
}