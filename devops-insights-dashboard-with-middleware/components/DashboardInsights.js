import { useEffect, useState } from "react";
import { Card, CardContent } from "../components/ui/card";
import { Select, SelectItem } from "../components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { Input } from "../components/ui/input";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function DashboardInsights() {
  const [sprint, setSprint] = useState("Sprint 8");
  const [board, setBoard] = useState("App Condor");
  const [idsEstimados, setIdsEstimados] = useState("208743,208744,208745");
  const [insights, setInsights] = useState(null);
  const [erro, setErro] = useState(null);

  const fetchInsights = async () => {
    try {
      const res = await fetch(`/api/devops?sprint=${encodeURIComponent(sprint)}&board=${encodeURIComponent(board)}&ids=${idsEstimados}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Erro ${res.status}: ${text}`);
      }
      const data = await res.json();
      console.log("Dados recebidos da API:", data);
      setInsights(data);
      setErro(null);
    } catch (err) {
      console.error("Erro ao buscar insights:", err);
      setErro(err.message);
      setInsights(null);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [sprint, board, idsEstimados]);

  return (
    <div className="p-6 space-y-6 text-white">
      <h1 className="text-2xl font-bold">Insights DevOps</h1>

      <div className="flex flex-wrap gap-4 items-center">
        <Select onValueChange={setBoard} defaultValue={board}>
          <SelectItem value="App Condor">App Condor</SelectItem>
          <SelectItem value="Max Call">Max Call</SelectItem>
        </Select>
        <Select onValueChange={setSprint} defaultValue={sprint}>
          <SelectItem value="Sprint 8">Sprint 8</SelectItem>
          <SelectItem value="Sprint 17">Sprint 17</SelectItem>
        </Select>
        <Input
          className="w-[300px] text-black"
          placeholder="IDs estimados (ex: 123,456)"
          value={idsEstimados}
          onChange={(e) => setIdsEstimados(e.target.value)}
        />
      </div>

      {erro && <div className="text-red-500 font-bold">Erro: {erro}</div>}
      {!erro && !insights && <div className="text-yellow-400">Carregando insights...</div>}
      {insights && (
        <div className="text-green-400">Dados carregados com sucesso. Total: {insights.length} itens</div>
      )}
    </div>
  );
}