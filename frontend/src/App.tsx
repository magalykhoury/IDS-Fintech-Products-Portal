import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import AppLayout from "./layouts/AppLayout";

import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";

import ProductsPage from "./pages/ProductsPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import CreateProductPage from "./pages/CreateProductPage";
import EditProductPage from "./pages/EditProductPage";

import CreateProductModulePage from "./pages/CreateProductModulePage";
import EditProductModulePage from "./pages/EditProductModulePage";

import AddProductTechnologyPage from "./pages/AddProductTechnologyPage";

import CreateRepositoryPage from "./pages/CreateRepositoryPage";
import EditRepositoryPage from "./pages/EditRepositoryPage";

import CreateDocumentPage from "./pages/CreateDocumentPage";
import EditDocumentPage from "./pages/EditDocumentPage";

import AssignProductTeamMemberPage from "./pages/AssignProductTeamMemberPage";
import EditProductTeamMemberPage from "./pages/EditProductTeamMemberPage";

import ClientsPage from "./pages/ClientsPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import CreateClientPage from "./pages/CreateClientPage";
import EditClientPage from "./pages/EditClientPage";

import DeploymentsPage from "./pages/DeploymentsPage";
import DeploymentDetailsPage from "./pages/DeploymentDetailsPage";
import CreateDeploymentPage from "./pages/CreateDeploymentPage";
import EditDeploymentPage from "./pages/EditDeploymentPage";

import CreateEnvironmentPage from "./pages/CreateEnvironmentPage";
import EditEnvironmentPage from "./pages/EditEnvironmentPage";

import CreateServerPage from "./pages/CreateServerPage";
import EditServerPage from "./pages/EditServerPage";

import AddDeploymentModulePage from "./pages/AddDeploymentModulePage";

import AssignDeploymentTeamMemberPage from "./pages/AssignDeploymentTeamMemberPage";
import EditDeploymentTeamMemberPage from "./pages/EditDeploymentTeamMemberPage";

import TeamPage from "./pages/TeamPage";
import CreateTeamMemberPage from "./pages/CreateTeamMemberPage";
import EditTeamMemberPage from "./pages/EditTeamMemberPage";

import UsersPage from "./pages/UsersPage";
import TechnologiesPage from "./pages/TechnologiesPage";
import ApprovalsPage from "./pages/ApprovalsPage";
import NotificationsPage from "./pages/NotificationsPage";
import IntelligencePage from "./pages/IntelligencePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* --------------------------------------------------
            PUBLIC ROUTES
        -------------------------------------------------- */}

        <Route
          path="/login"
          element={<LoginPage />}
        />


        {/* --------------------------------------------------
            PROTECTED PORTAL
        -------------------------------------------------- */}

        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >

          {/* DASHBOARD */}

          <Route
            path="/dashboard"
            element={<DashboardPage />}
          />


          {/* --------------------------------------------------
              PRODUCTS
          -------------------------------------------------- */}

          <Route
            path="/products"
            element={<ProductsPage />}
          />

          <Route
            path="/products/new"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><CreateProductPage /></RoleProtectedRoute>}
          />

          <Route
            path="/products/:id/edit"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><EditProductPage /></RoleProtectedRoute>}
          />


          {/* PRODUCT MODULES */}

          <Route
            path="/products/:id/modules/new"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><CreateProductModulePage /></RoleProtectedRoute>}
          />

          <Route
            path="/products/:productId/modules/:moduleId/edit"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><EditProductModulePage /></RoleProtectedRoute>}
          />


          {/* PRODUCT TECHNOLOGIES */}

          <Route
            path="/products/:id/technologies/add"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><AddProductTechnologyPage /></RoleProtectedRoute>}
          />


          {/* PRODUCT REPOSITORIES */}

          <Route
            path="/products/:id/repositories/new"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><CreateRepositoryPage /></RoleProtectedRoute>}
          />

          <Route
            path="/products/:productId/repositories/:repositoryId/edit"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><EditRepositoryPage /></RoleProtectedRoute>}
          />


          {/* PRODUCT DOCUMENTATION */}

          <Route
            path="/products/:id/documents/new"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><CreateDocumentPage /></RoleProtectedRoute>}
          />

          <Route
            path="/products/:productId/documents/:documentId/edit"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><EditDocumentPage /></RoleProtectedRoute>}
          />


          {/* PRODUCT TEAM */}

          <Route
            path="/products/:id/team/assign"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><AssignProductTeamMemberPage /></RoleProtectedRoute>}
          />

          <Route
            path="/products/:productId/team/:responsibilityId/edit"
            element={<RoleProtectedRoute permission="PRODUCT_MANAGE" fallbackPath="/products"><EditProductTeamMemberPage /></RoleProtectedRoute>}
          />


          {/* PRODUCT DETAILS */}

          <Route
            path="/products/:id"
            element={<ProductDetailsPage />}
          />


          {/* --------------------------------------------------
              CLIENTS
          -------------------------------------------------- */}

          <Route
            path="/clients"
            element={<ClientsPage />}
          />

          <Route
            path="/clients/new"
            element={<RoleProtectedRoute permission="PORTAL_WRITE" fallbackPath="/clients"><CreateClientPage /></RoleProtectedRoute>}
          />

          <Route
            path="/clients/:id/edit"
            element={<RoleProtectedRoute permission="PORTAL_WRITE" fallbackPath="/clients"><EditClientPage /></RoleProtectedRoute>}
          />

          <Route
            path="/clients/:id"
            element={<ClientDetailsPage />}
          />


          {/* --------------------------------------------------
              DEPLOYMENTS
          -------------------------------------------------- */}

          <Route
            path="/deployments"
            element={<DeploymentsPage />}
          />

          <Route
            path="/deployments/new"
            element={<RoleProtectedRoute permission="DEPLOYMENT_MANAGE" fallbackPath="/deployments"><CreateDeploymentPage /></RoleProtectedRoute>}
          />

          <Route
            path="/deployments/:id/edit"
            element={<RoleProtectedRoute permission="DEPLOYMENT_MANAGE" fallbackPath="/deployments"><EditDeploymentPage /></RoleProtectedRoute>}
          />


          {/* DEPLOYMENT ENVIRONMENTS */}

          <Route
            path="/deployments/:deploymentId/environments/new"
            element={<RoleProtectedRoute permission="DEPLOYMENT_MANAGE" fallbackPath="/deployments"><CreateEnvironmentPage /></RoleProtectedRoute>}
          />

          <Route
            path="/deployments/:deploymentId/environments/:environmentId/edit"
            element={<RoleProtectedRoute permission="DEPLOYMENT_MANAGE" fallbackPath="/deployments"><EditEnvironmentPage /></RoleProtectedRoute>}
          />


          {/* DEPLOYMENT SERVERS */}

          <Route
            path="/deployments/:deploymentId/servers/new"
            element={<RoleProtectedRoute permission="DEPLOYMENT_MANAGE" fallbackPath="/deployments"><CreateServerPage /></RoleProtectedRoute>}
          />

          <Route
            path="/deployments/:deploymentId/servers/:serverId/edit"
            element={<RoleProtectedRoute permission="DEPLOYMENT_MANAGE" fallbackPath="/deployments"><EditServerPage /></RoleProtectedRoute>}
          />


          {/* DEPLOYMENT MODULES */}

          <Route
            path="/deployments/:deploymentId/modules/add"
            element={<RoleProtectedRoute permission="DEPLOYMENT_MANAGE" fallbackPath="/deployments"><AddDeploymentModulePage /></RoleProtectedRoute>}
          />


          {/* DEPLOYMENT TEAM */}

          <Route
            path="/deployments/:deploymentId/team/assign"
            element={<RoleProtectedRoute permission="DEPLOYMENT_MANAGE" fallbackPath="/deployments"><AssignDeploymentTeamMemberPage /></RoleProtectedRoute>}
          />

          <Route
            path="/deployments/:deploymentId/team/:responsibilityId/edit"
            element={<RoleProtectedRoute permission="DEPLOYMENT_MANAGE" fallbackPath="/deployments"><EditDeploymentTeamMemberPage /></RoleProtectedRoute>}
          />


          {/* DEPLOYMENT DETAILS */}

          <Route
            path="/deployments/:id"
            element={<DeploymentDetailsPage />}
          />


          {/* --------------------------------------------------
              TEAM
          -------------------------------------------------- */}

          <Route
            path="/team"
            element={<TeamPage />}
          />

          <Route
            path="/team/new"
            element={<RoleProtectedRoute permission="PORTAL_WRITE" fallbackPath="/team"><CreateTeamMemberPage /></RoleProtectedRoute>}
          />

          <Route
            path="/team/:id/edit"
            element={<RoleProtectedRoute permission="PORTAL_WRITE" fallbackPath="/team"><EditTeamMemberPage /></RoleProtectedRoute>}
          />

          <Route
            path="/technologies"
            element={<RoleProtectedRoute permission="PORTAL_WRITE" fallbackPath="/products"><TechnologiesPage /></RoleProtectedRoute>}
          />


          {/* --------------------------------------------------
              USERS
          -------------------------------------------------- */}

          <Route
            path="/users"
            element={<RoleProtectedRoute permission="USER_MANAGE" fallbackPath="/dashboard"><UsersPage /></RoleProtectedRoute>}
          />

          <Route path="/approvals" element={<ApprovalsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/intelligence" element={<IntelligencePage />} />

        </Route>


        {/* --------------------------------------------------
            DEFAULT ROUTE
        -------------------------------------------------- */}

        <Route
          path="/"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


        {/* --------------------------------------------------
            UNKNOWN ROUTES
        -------------------------------------------------- */}

        <Route
          path="*"
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
