import { useEffect, useState } from "react";
import ErrorHandler from "../utils/errorHandler";
import Spinner from "../components/common/Spinner";
import { Table, Button, Modal, Form } from "react-bootstrap";
import * as ingredientsApi from "../api/ingredients";

interface Ingredient {
  id: number;
  name: string;
  category: string;
  unit: string;
  stock: number;
  par_level: number;
  status: string;
}

const InventoryPage = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Ingredient | null>(null);
  const [stockValue, setStockValue] = useState("");
  const [parLevelValue, setParLevelValue] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchIngredients = () => {
    ingredientsApi.getIngredients()
      .then((res) => setIngredients(res.data))
      .catch((err) => ErrorHandler(err, null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchIngredients();
  }, []);

  const openEdit = (ing: Ingredient) => {
    setEditing(ing);
    setStockValue(String(ing.stock));
    setParLevelValue(String(ing.par_level));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    try {
      await ingredientsApi.updateIngredient(editing.id, {
        stock: parseFloat(stockValue),
        par_level: parseFloat(parLevelValue),
      });
      setEditing(null);
      fetchIngredients();
    } catch (err) {
      ErrorHandler(err, null);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center p-5"><Spinner /></div>;

  return (
    <div className="container-fluid">
      <h1 className="app-page-title mb-2">Inventory</h1>
      <p className="app-label text-muted mb-4">Ingredient stock levels. Update stock and par level below.</p>
      <div className="app-card p-4">
        <h2 className="app-section-title mb-4">Ingredients</h2>
        <Table striped bordered hover responsive className="app-table">
        <thead>
          <tr>
            <th className="app-table-th">ID</th>
            <th className="app-table-th">Name</th>
            <th className="app-table-th">Category</th>
            <th className="app-table-th">Unit</th>
            <th className="app-table-th">Stock</th>
            <th className="app-table-th">Par Level</th>
            <th className="app-table-th">Status</th>
            <th className="app-table-th">Actions</th>
          </tr>
        </thead>
        <tbody>
          {ingredients.map((ing) => (
            <tr key={ing.id} className={ing.stock < ing.par_level ? "table-warning" : ""}>
              <td>{ing.id}</td>
              <td>{ing.name}</td>
              <td>{ing.category}</td>
              <td>{ing.unit}</td>
              <td>{ing.stock}</td>
              <td>{ing.par_level}</td>
              <td>{ing.status}</td>
              <td>
                <Button variant="outline-primary" size="sm" onClick={() => openEdit(ing)}>Update Stock</Button>
              </td>
            </tr>
          ))}
        </tbody>
        </Table>
      </div>

      <Modal show={!!editing} onHide={() => setEditing(null)} centered contentClassName="app-card">
        <Modal.Header closeButton closeVariant="white" className="border-secondary">
          <Modal.Title className="app-page-title">Update stock — {editing?.name}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSave}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="app-label">Stock ({editing?.unit})</Form.Label>
              <Form.Control
                type="number"
                step="any"
                className="app-input"
                value={stockValue}
                onChange={(e) => setStockValue(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label className="app-label">Par Level ({editing?.unit})</Form.Label>
              <Form.Control
                type="number"
                step="any"
                className="app-input"
                value={parLevelValue}
                onChange={(e) => setParLevelValue(e.target.value)}
                required
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer className="border-secondary">
            <Button variant="secondary" onClick={() => setEditing(null)}>Cancel</Button>
            <Button variant="primary" className="app-btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default InventoryPage;
