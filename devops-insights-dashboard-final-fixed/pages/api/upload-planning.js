import { IncomingForm } from "formidable";
import * as XLSX from "xlsx";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  console.log("🟡 Upload handler chamado");

  const form = new IncomingForm();
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("🔴 Erro no parse do formulário:", err);
      return res.status(500).json({ error: "Erro no upload" });
    }

    try {
      const file = files.file[0];
      console.log("📄 Nome do arquivo recebido:", file.originalFilename);

      const data = fs.readFileSync(file.filepath);
      const workbook = XLSX.read(data, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      const headerIndex = json.findIndex(row => row.includes("Card") || row.includes("ID"));
      const dataRows = json.slice(headerIndex + 1);
      const idColIndex = json[headerIndex].findIndex(h => h === "Card" || h === "ID");

      const ids = dataRows.map(row => parseInt(row[idColIndex])).filter(v => !isNaN(v));

      console.log("✅ IDs extraídos da planning:", ids);
      res.status(200).json({ ids });
    } catch (e) {
      console.error("🔴 Erro ao processar o arquivo XLSX:", e);
      res.status(500).json({ error: "Falha ao ler a planilha" });
    }
  });
}