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
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroTamanho, setFiltroTamanho] = useState("");

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload-planning", { method: "POST", body: formData });
    const data = await res.json();
    if (data.ids) {
      setIdsEstimados(data.ids.join(","));
    }
  };

  useEffect(() => {
    const fetchInsights = async () => {
      const res = await fetch(`/api/devops/insights?sprint=${encodeURIComponent(sprint)}&board=${encodeURIComponent(board)}&ids=${idsEstimados}`);
      const data = await res.json();
      setInsights(data);
    };
    fetchInsights();
  }, [sprint, board, idsEstimados]);

  const aplicarFiltros = (item) => {
    const statusOk = !filtroStatus || item.status === filtroStatus;
    const sizeOk = !filtroTamanho || item.tshirtSize === filtroTamanho;
    return statusOk && sizeOk;
  };

  const statusUnicos = [...new Set([...(insights?.alemEstimado || []), ...(insights?.impedidos || [])].map(i => i.status))];
  const tamanhosUnicos = [...new Set([...(insights?.alemEstimado || []), ...(insights?.impedidos || [])].map(i => i.tshirtSize).filter(Boolean))];

  const dataStatusPorSize = insights
    ? Object.entries(insights.statusPorSize).map(([size, statusMap]) => ({ size, ...statusMap }))
    : [];

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
        <input
          type="file"
          accept=".xlsx"
          onChange={handleUpload}
          className="text-sm text-white file:bg-white file:text-black file:rounded-md"
        />
        <Select onValueChange={setFiltroStatus} defaultValue="">
          <SelectItem value="">Status</SelectItem>
          {statusUnicos.map((status, idx) => (
            <SelectItem key={idx} value={status}>{status}</SelectItem>
          ))}
        </Select>
        <Select onValueChange={setFiltroTamanho} defaultValue="">
          <SelectItem value="">Tamanho</SelectItem>
          {tamanhosUnicos.map((size, idx) => (
            <SelectItem key={idx} value={size}>{size}</SelectItem>
          ))}
        </Select>
      </div>

      <Tabs defaultValue="alem-estimado">
        <TabsList className="bg-white/20">
          <TabsTrigger value="alem-estimado">Além do Estimado</TabsTrigger>
          <TabsTrigger value="impedidos">Impedidos</TabsTrigger>
          <TabsTrigger value="lead-cycle">Tempo</TabsTrigger>
          <TabsTrigger value="status-size">Status x Size</TabsTrigger>
        </TabsList>

        <TabsContent value="alem-estimado">
          <Card className="bg-white/10 mt-4">
            <CardContent>
              <h2 className="text-lg font-semibold mb-2">Itens Além do Estimado</h2>
              {insights?.alemEstimado?.filter(aplicarFiltros).map((item, i) => (
                <div key={i} className="border-b border-white/10 py-1 text-sm">
                  #{item.id} - {item.titulo} ({item.status}) [{item.tshirtSize}] - {item.responsavel}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impedidos">
          <Card className="bg-white/10 mt-4">
            <CardContent>
              <h2 className="text-lg font-semibold mb-2">Itens em Impedimento</h2>
              {insights?.impedidos?.filter(aplicarFiltros).map((item, i) => (
                <div key={i} className="border-b border-white/10 py-1 text-sm">
                  #{item.id} - {item.titulo} ({item.status}) [{item.tshirtSize}] - {item.responsavel}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lead-cycle">
          <Card className="bg-white/10 mt-4">
            <CardContent>
              <h2 className="text-lg font-semibold mb-2">Lead Time</h2>
              {insights?.leadTime?.map((item, i) => (
                <div key={i} className="text-sm py-1">
                  #{item.id} - {item.titulo} → {item.leadTime} dias
                </div>
              ))}
              <h2 className="text-lg font-semibold mt-4 mb-2">Cycle Time</h2>
              {insights?.cycleTime?.map((item, i) => (
                <div key={i} className="text-sm py-1">
                  #{item.id} - {item.titulo} → {item.cycleTime} dias
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status-size">
          <Card className="bg-white/10 mt-4">
            <CardContent>
              <h2 className="text-lg font-semibold mb-2">Distribuição por Status e T-Shirt Size</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dataStatusPorSize}>
                  <XAxis dataKey="size" stroke="#fff" />
                  <YAxis stroke="#fff" allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="Na fila" stackId="a" fill="#0074f0" name="Na fila" />
                  <Bar dataKey="Em desenvolvimento" stackId="a" fill="#7e00cc" name="Em desenvolvimento" />
                  <Bar dataKey="Em testes" stackId="a" fill="#ffcc00" name="Em testes" />
                  <Bar dataKey="Concluído" stackId="a" fill="#00ff7b" name="Concluído" />
                  <Bar dataKey="Em impedimento" stackId="a" fill="#ff0033" name="Em impedimento" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}