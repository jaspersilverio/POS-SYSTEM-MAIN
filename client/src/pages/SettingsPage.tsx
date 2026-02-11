import { useState, useEffect } from "react";
import { Tab, Tabs, Card } from "react-bootstrap";
import Spinner from "../components/common/Spinner";
import UserManagement from "../components/settings/UserManagement";
import StoreSettings from "../components/settings/StoreSettings";
import POSPreferences from "../components/settings/POSPreferences";
import ReceiptSettings from "../components/settings/ReceiptSettings";
import SecuritySettings from "../components/settings/SecuritySettings";
import SystemInfo from "../components/settings/SystemInfo";
import * as settingsApi from "../api/settings";
import type { Settings } from "../interfaces/Settings";

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    settingsApi
      .getSettings()
      .then((res) => setSettings(res.data))
      .catch(() => setSettings(null))
      .finally(() => setLoading(false));
  }, []);

  const refreshSettings = () => {
    settingsApi.getSettings().then((res) => setSettings(res.data));
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50 p-5">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="settings-page">
      <h2 className="mb-4" style={{ fontSize: "1.75rem", fontWeight: 600 }}>
        Settings
      </h2>
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <Tabs
            defaultKey={isAdmin ? "users" : "security"}
            className="px-3 pt-3 border-0"
            fill
          >
            {isAdmin && (
              <Tab eventKey="users" title="User Management">
                <div className="p-4">
                  <UserManagement />
                </div>
              </Tab>
            )}
            {isAdmin && (
              <Tab eventKey="store" title="Store">
                <div className="p-4">
                  <StoreSettings settings={settings} onSaved={refreshSettings} />
                </div>
              </Tab>
            )}
            {isAdmin && (
              <Tab eventKey="pos" title="POS Preferences">
                <div className="p-4">
                  <POSPreferences settings={settings} onSaved={refreshSettings} />
                </div>
              </Tab>
            )}
            {isAdmin && (
              <Tab eventKey="receipt" title="Receipt">
                <div className="p-4">
                  <ReceiptSettings settings={settings} onSaved={refreshSettings} />
                </div>
              </Tab>
            )}
            <Tab eventKey="security" title="Security">
              <div className="p-4">
                <SecuritySettings />
              </div>
            </Tab>
            <Tab eventKey="system" title="System Info">
              <div className="p-4">
                <SystemInfo />
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default SettingsPage;
