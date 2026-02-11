import type { Addon } from "../../interfaces/Addon";
import Spinner from "../common/Spinner";
import { Table } from "react-bootstrap";

interface AddonsTableProps {
  addons: Addon[];
  loading: boolean;
}

const AddonsTable = ({ addons, loading }: AddonsTableProps) => {
  const priceNum = (a: Addon) => (typeof a.price === "string" ? parseFloat(a.price) : Number(a.price));

  if (loading) {
    return (
      <div className="text-center p-5">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="app-card p-4">
      <h2 className="app-section-title mb-4">Add-ons list</h2>
      <Table striped bordered hover responsive className="app-table">
        <thead>
          <tr>
            <th className="app-table-th">Image</th>
            <th className="app-table-th">ID</th>
            <th className="app-table-th">Name</th>
            <th className="app-table-th">Price (₱)</th>
          </tr>
        </thead>
        <tbody>
          {addons.length === 0 ? (
            <tr>
              <td colSpan={4} className="text-center text-muted py-4">
                No add-ons yet. Use “Add Product” and choose Add-ons to create some.
              </td>
            </tr>
          ) : (
            addons.map((addon) => (
              <tr key={addon.id}>
                <td>
                  {addon.image_url ? (
                    <img
                      src={addon.image_url}
                      alt=""
                      style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }}
                    />
                  ) : (
                    <span className="text-muted small">—</span>
                  )}
                </td>
                <td>{addon.id}</td>
                <td>{addon.name}</td>
                <td>₱{priceNum(addon).toFixed(2)}</td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default AddonsTable;
