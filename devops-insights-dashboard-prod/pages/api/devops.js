import formidable from "formidable";
import * as XLSX from "xlsx";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const { sprint, board } = req.query;
  const { AZURE_ORG, AZURE_PROJECT, AZURE_PAT } = process.env;

  if (!AZURE_ORG || !AZURE_PROJECT || !AZURE_PAT) {
    return res.status(500).json({ error: "Variáveis de ambiente não configuradas" });
  }

  try {
    const auth = Buffer.from(`:${AZURE_PAT}`).toString("base64");

    const response = await fetch(`https://dev.azure.com/${AZURE_ORG}/${AZURE_PROJECT}/_apis/wit/wiql?api-version=7.1-preview.2`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `SELECT [System.Id], [System.Title], [System.State], [System.WorkItemType], [System.IterationPath] 
                FROM WorkItems 
                WHERE [System.IterationPath] CONTAINS '${sprint}' 
                  AND [System.TeamProject] = '${AZURE_PROJECT}'`
      })
    });

    const data = await response.json();
    const ids = data.workItems.map(item => item.id);

    if (!ids.length) return res.status(200).json([]);

    const batch = await fetch(`https://dev.azure.com/${AZURE_ORG}/${AZURE_PROJECT}/_apis/wit/workitemsbatch?api-version=7.1-preview.1`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ids,
        fields: [
          "System.Id",
          "System.Title",
          "System.State",
          "System.WorkItemType",
          "System.AssignedTo",
          "System.CreatedDate",
          "Microsoft.VSTS.Scheduling.StoryPoints",
          "Custom.TShirtSize",
          "System.IterationPath",
          "System.Parent",
          "System.ChangedDate",
          "Microsoft.VSTS.Common.ResolvedDate",
          "Microsoft.VSTS.Common.ClosedDate"
        ]
      })
    });

    const detalhes = await batch.json();
    const resultado = detalhes.value.map(item => ({
      id: item.fields["System.Id"],
      titulo: item.fields["System.Title"],
      estado: item.fields["System.State"],
      tipo: item.fields["System.WorkItemType"],
      responsavel: item.fields["System.AssignedTo"]?.displayName || null,
      criadoEm: item.fields["System.CreatedDate"],
      storyPoints: item.fields["Microsoft.VSTS.Scheduling.StoryPoints"] || null,
      tshirtSize: item.fields["Custom.TShirtSize"] || null,
      iterationPath: item.fields["System.IterationPath"],
      parentId: item.fields["System.Parent"] || null,
      resolvedDate: item.fields["Microsoft.VSTS.Common.ResolvedDate"] || null,
      closedDate: item.fields["Microsoft.VSTS.Common.ClosedDate"] || null,
      ultimaAlteracao: item.fields["System.ChangedDate"] || null
    }));

    return res.status(200).json(resultado);

  } catch (err) {
    console.error("🔴 Erro na API /devops:", err);
    return res.status(500).json({ error: "Erro ao buscar dados do Azure DevOps", details: err.message });
  }
}