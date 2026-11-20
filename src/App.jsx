import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./componentes/Layout";
import Doadores from "./paginas/Doadores";
import NovaDoacao from "./paginas/NovaDoacao";
import Doacoes from "./paginas/Doacoes";
import Categorias from "./paginas/Categorias";
import Itens from "./paginas/Itens";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Navigate to="/doadores" replace />} />
        <Route path="/doadores" element={<Doadores />} />
        <Route path="/doacoes/nova" element={<NovaDoacao />} />
        <Route path="/doacoes/:id/editar" element={<NovaDoacao />} />
        <Route path="/doacoes" element={<Doacoes />} />
        <Route path="/categorias" element={<Categorias />} />
        <Route path="/itens" element={<Itens />} />
        <Route path="*" element={<Navigate to="/doadores" replace />} />
      </Route>
    </Routes>
  );
}
