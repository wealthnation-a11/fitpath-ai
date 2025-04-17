import { Navigate } from "react-router-dom";

// Redirect Index to Home page
const Index = () => {
  return <Navigate to="/" replace />;
};

export default Index;
