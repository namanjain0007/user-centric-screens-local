
import { Navigate } from "react-router-dom";

const Index = () => {
  // Redirect to the dashboard as the main page
  return <Navigate to="/dashboard" replace />;
};

export default Index;
