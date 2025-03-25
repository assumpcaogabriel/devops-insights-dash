export default async function handler(req, res) {
  console.log("🟢 [API] devops chamada com query:", req.query);
  res.status(200).json({ status: "ok", message: "API está respondendo com sucesso", query: req.query });
}